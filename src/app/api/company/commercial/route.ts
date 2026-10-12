import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { notifyCommercialPurchase } from "@/lib/telegram/notifier";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    // 1. Profil entreprise
    const { data: company, error: compErr } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("email", session.email.toLowerCase().trim())
      .maybeSingle();

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
    }

    // 2. Grille de plans & configuration fiscale
    const [plansRes, taxRes, subsRes, ordersRes, unlocksRes, missionsRes, adsRes] = await Promise.all([
      supabaseAdmin.from("commercial_plans").select("*").order("price_eur", { ascending: true }),
      supabaseAdmin.from("tax_settings").select("*").eq("id", "default").maybeSingle(),
      supabaseAdmin.from("company_subscriptions").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("commercial_orders").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("unlocked_profiles").select("*, drivers(id, first_name, last_name, phone, email, city, postal_code, permits, experience, availability, resume_url)").eq("company_id", company.id),
      supabaseAdmin.from("driver_search_missions").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("advertising_campaigns").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
    ]);

    const activeSub = (subsRes.data || []).find((s: any) => s.status === "active") || null;
    const currentPlanId = company.subscription_plan || activeSub?.plan_id || "decouverte";
    const currentPlan = (plansRes.data || []).find((p: any) => p.id === currentPlanId) || {
      id: "decouverte",
      name: "Découverte",
      price_eur: 0,
      max_active_jobs: 0,
      monthly_credits: 0,
    };

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.company_name,
        email: company.email,
        subscription_plan: currentPlanId,
        subscription_status: company.subscription_status || "active",
        subscription_expires_at: company.subscription_expires_at || activeSub?.expires_at || null,
        credits_balance: company.credits_balance || 0,
        is_subscription_gifted: company.is_subscription_gifted || false,
        gifted_reason: company.gifted_reason || null,
      },
      currentPlan,
      activeSubscription: activeSub,
      plans: plansRes.data || [],
      taxSettings: taxRes.data || {
        is_vat_exempt: true,
        vat_legal_notice: "TVA non applicable, art. 293 B du CGI",
      },
      unlockedDrivers: unlocksRes.data || [],
      orders: ordersRes.data || [],
      searchMissions: missionsRes.data || [],
      adCampaigns: adsRes.data || [],
    });
  } catch (err: any) {
    console.error("GET /api/company/commercial error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || (session.role !== "company" && session.role !== "admin")) {
      return NextResponse.json({ error: "Accès refusé. Connexion entreprise requise." }, { status: 403 });
    }

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("email", session.email.toLowerCase().trim())
      .maybeSingle();

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const { action, data } = body;

    // 1. DÉBLOCAGE DE PROFIL CANDIDAT (1 crédit, jamais facturé deux fois)
    if (action === "unlock_driver") {
      const { driverId } = data || {};
      if (!driverId) {
        return NextResponse.json({ error: "Identifiant conducteur requis." }, { status: 400 });
      }

      // Vérifier si déjà débloqué
      const { data: alreadyUnlocked } = await supabaseAdmin
        .from("unlocked_profiles")
        .select("id")
        .eq("company_id", company.id)
        .eq("driver_id", driverId)
        .maybeSingle();

      if (alreadyUnlocked) {
        return NextResponse.json({
          success: true,
          alreadyUnlocked: true,
          message: "Ce profil est déjà débloqué pour votre entreprise.",
        });
      }

      // Vérifier le solde de crédits
      const currentCredits = Number(company.credits_balance || 0);
      if (currentCredits < 1) {
        return NextResponse.json({
          error: "Solde insuffisant. Vous devez acquérir des crédits ou souscrire un forfait pour débloquer ce candidat.",
          needsCredits: true,
        }, { status: 402 });
      }

      // Déduction stricte de 1 crédit et enregistrement
      const newBalance = currentCredits - 1;
      const { error: unlockErr } = await supabaseAdmin
        .from("unlocked_profiles")
        .insert({
          company_id: company.id,
          driver_id: driverId,
          credits_spent: 1,
        });

      if (unlockErr) {
        return NextResponse.json({ error: "Échec du déblocage: " + unlockErr.message }, { status: 500 });
      }

      // Mettre à jour le solde entreprise
      await supabaseAdmin
        .from("companies")
        .update({ credits_balance: newBalance })
        .eq("id", company.id);

      // Récupérer les coordonnées complètes du candidat
      const { data: driverData } = await supabaseAdmin
        .from("drivers")
        .select("*")
        .eq("id", driverId)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        message: "Profil candidat débloqué avec succès.",
        newCreditsBalance: newBalance,
        driver: driverData,
      });
    }

    // 2. SOUSCRIRE OU CHANGER D'ABONNEMENT
    if (action === "subscribe_plan") {
      const { planId, paymentMethod = "card" } = data || {};
      if (!planId) {
        return NextResponse.json({ error: "Identifiant de forfait requis." }, { status: 400 });
      }

      const { data: plan } = await supabaseAdmin
        .from("commercial_plans")
        .select("*")
        .eq("id", planId)
        .maybeSingle();

      if (!plan) {
        return NextResponse.json({ error: "Forfait introuvable." }, { status: 404 });
      }

      const orderNumber = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const priceEur = Number(plan.price_eur);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Clôturer les anciens abonnements actifs
      await supabaseAdmin
        .from("company_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("company_id", company.id)
        .eq("status", "active");

      // Créer nouvel abonnement
      const creditsToAdd = Number(plan.monthly_credits || 0);
      const newCreditsBalance = (company.credits_balance || 0) + creditsToAdd;

      const { data: subData, error: subErr } = await supabaseAdmin
        .from("company_subscriptions")
        .insert({
          company_id: company.id,
          plan_id: plan.id,
          status: "active",
          price_paid: priceEur,
          credits_balance: creditsToAdd,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_gifted: false,
        })
        .select()
        .single();

      if (subErr) {
        return NextResponse.json({ error: subErr.message }, { status: 500 });
      }

      // Enregistrer la commande
      await supabaseAdmin.from("commercial_orders").insert({
        order_number: orderNumber,
        company_id: company.id,
        company_name: company.company_name,
        company_email: company.email,
        order_type: "subscription",
        product_name: `Abonnement ${plan.name} (30 jours)`,
        product_id: plan.id,
        amount_eur: priceEur,
        total_paid: priceEur,
        is_paid: true,
        status: "paid",
        payment_method: paymentMethod,
        payment_reference: `SIMU-${Date.now()}`,
        paid_at: new Date().toISOString(),
        metadata: { plan_id: plan.id, monthly_credits: creditsToAdd },
      });

      // Mettre à jour l'entreprise
      await supabaseAdmin.from("companies").update({
        subscription_plan: plan.id,
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
        credits_balance: newCreditsBalance,
        is_subscription_gifted: false,
      }).eq("id", company.id);

      // Notification Telegram
      await notifyCommercialPurchase({
        orderNumber,
        orderType: "subscription",
        companyName: company.company_name,
        companyEmail: company.email,
        productName: `Forfait ${plan.name}`,
        amountEur: priceEur,
        subscriptionDetails: {
          planName: plan.name,
          period: "Mensuel",
          startedAt: new Date().toLocaleDateString("fr-FR"),
          expiresAt: expiresAt.toLocaleDateString("fr-FR"),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Abonnement ${plan.name} activé avec succès !`,
        orderNumber,
        plan: plan.name,
        newCreditsBalance,
      });
    }

    // 3. ACHETER DES CRÉDITS (5 pour 19 €, 15 pour 49 €, 40 pour 99 €)
    if (action === "buy_credits") {
      const { packSize, paymentMethod = "card" } = data || {};
      const PACKS: Record<number, { price: number; name: string }> = {
        5: { price: 19, name: "Pack 5 crédits" },
        15: { price: 49, name: "Pack 15 crédits" },
        40: { price: 99, name: "Pack 40 crédits" },
      };

      const pack = PACKS[Number(packSize)];
      if (!pack) {
        return NextResponse.json({ error: "Pack de crédits invalide." }, { status: 400 });
      }

      const orderNumber = `CRD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCreditsBalance = (company.credits_balance || 0) + Number(packSize);

      // Enregistrer la commande
      await supabaseAdmin.from("commercial_orders").insert({
        order_number: orderNumber,
        company_id: company.id,
        company_name: company.company_name,
        company_email: company.email,
        order_type: "credits",
        product_name: pack.name,
        quantity: Number(packSize),
        amount_eur: pack.price,
        total_paid: pack.price,
        is_paid: true,
        status: "paid",
        payment_method: paymentMethod,
        payment_reference: `SIMU-${Date.now()}`,
        paid_at: new Date().toISOString(),
        metadata: { credits_added: Number(packSize) },
      });

      // Créditer l'entreprise
      await supabaseAdmin
        .from("companies")
        .update({ credits_balance: newCreditsBalance })
        .eq("id", company.id);

      // Notification Telegram
      await notifyCommercialPurchase({
        orderNumber,
        orderType: "credits",
        companyName: company.company_name,
        companyEmail: company.email,
        productName: pack.name,
        amountEur: pack.price,
      });

      return NextResponse.json({
        success: true,
        message: `${packSize} crédits ajoutés à votre compte !`,
        orderNumber,
        newCreditsBalance,
      });
    }

    // 4. COMMANDER UNE MISSION DE RECHERCHE DE CHAUFFEURS
    if (action === "order_search_mission") {
      const {
        driverCount = 1,
        permitRequired,
        vehicleType,
        regions = [],
        contractType = "CDI",
        experienceRequired,
        startDate,
        isUrgent = false,
        description,
        paymentMethod = "card",
      } = data || {};

      let priceEur = 149;
      if (Number(driverCount) === 3) priceEur = 399;
      else if (Number(driverCount) > 3) priceEur = Number(driverCount) * 129;

      const missionNumber = `MIS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Enregistrer la commande financière
      const { data: orderData } = await supabaseAdmin.from("commercial_orders").insert({
        order_number: orderNumber,
        company_id: company.id,
        company_name: company.company_name,
        company_email: company.email,
        order_type: "search_mission",
        product_name: `Mission de recherche (${driverCount} conducteur(s) ${permitRequired || "SPL"})`,
        amount_eur: priceEur,
        total_paid: priceEur,
        is_paid: true,
        status: "paid",
        payment_method: paymentMethod,
        payment_reference: `SIMU-${Date.now()}`,
        paid_at: new Date().toISOString(),
      }).select().single();

      // Enregistrer la mission
      await supabaseAdmin.from("driver_search_missions").insert({
        mission_number: missionNumber,
        company_id: company.id,
        company_name: company.company_name,
        company_email: company.email,
        order_id: orderData?.id || null,
        driver_count: Number(driverCount),
        permit_required: permitRequired,
        vehicle_type: vehicleType,
        regions: Array.isArray(regions) ? regions : [regions],
        contract_type: contractType,
        experience_required: experienceRequired,
        start_date: startDate,
        is_urgent: Boolean(isUrgent),
        description,
        price_eur: priceEur,
        status: "paid", // Payée et prête pour le sourcing
      });

      // Notification Telegram
      await notifyCommercialPurchase({
        orderNumber,
        orderType: "search_mission",
        companyName: company.company_name,
        companyEmail: company.email,
        productName: `Mission de recherche (${driverCount} conducteur(s))`,
        amountEur: priceEur,
        searchMissionDetails: {
          missionType: `Recherche ${permitRequired || "Conducteur"} (${contractType})`,
          driverCount: Number(driverCount),
          regions: Array.isArray(regions) ? regions : [regions],
        },
      });

      return NextResponse.json({
        success: true,
        message: "Mission de recherche commandée avec succès !",
        missionNumber,
        orderNumber,
      });
    }

    // 5. COMMANDER UNE CAMPAGNE PUBLICITAIRE
    if (action === "order_ad_campaign") {
      const { campaignType, title, logoUrl, targetUrl, paymentMethod = "card" } = data || {};
      const PRICES: Record<string, { price: number; name: string }> = {
        banner_logo: { price: 29, name: "Logo dans le bandeau défilant (30 jours)" },
        priority_logo: { price: 59, name: "Logo prioritaire (30 jours)" },
        featured_company: { price: 99, name: "Entreprise à la une (30 jours)" },
      };

      const adInfo = PRICES[campaignType];
      if (!adInfo) {
        return NextResponse.json({ error: "Type de campagne invalide." }, { status: 400 });
      }

      const orderNumber = `PUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabaseAdmin.from("commercial_orders").insert({
        order_number: orderNumber,
        company_id: company.id,
        company_name: company.company_name,
        company_email: company.email,
        order_type: "ad_campaign",
        product_name: adInfo.name,
        amount_eur: adInfo.price,
        total_paid: adInfo.price,
        is_paid: true,
        status: "paid",
        payment_method: paymentMethod,
        payment_reference: `SIMU-${Date.now()}`,
        paid_at: new Date().toISOString(),
      });

      await supabaseAdmin.from("advertising_campaigns").insert({
        company_id: company.id,
        company_name: company.company_name,
        campaign_type: campaignType,
        title: title || company.company_name,
        logo_url: logoUrl || null,
        target_url: targetUrl || null,
        price_eur: adInfo.price,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      // Notification Telegram
      await notifyCommercialPurchase({
        orderNumber,
        orderType: "ad_campaign",
        companyName: company.company_name,
        companyEmail: company.email,
        productName: adInfo.name,
        amountEur: adInfo.price,
      });

      return NextResponse.json({
        success: true,
        message: "Campagne publicitaire souscrite avec succès !",
        orderNumber,
      });
    }

    // 6. TCHAT PRIVÉ AVEC CONDUCTEUR DÉBLOQUÉ
    if (action === "send_chat_message") {
      const { driverId, message } = data || {};
      if (!driverId || !message || !String(message).trim()) {
        return NextResponse.json({ error: "Conducteur et message requis." }, { status: 400 });
      }

      // Vérifier que le candidat est bien débloqué
      const { data: unlocked } = await supabaseAdmin
        .from("unlocked_profiles")
        .select("id")
        .eq("company_id", company.id)
        .eq("driver_id", driverId)
        .maybeSingle();

      if (!unlocked) {
        return NextResponse.json({ error: "Ce profil doit être débloqué avant de pouvoir lui envoyer un message." }, { status: 403 });
      }

      const { data: inserted, error: chatErr } = await supabaseAdmin
        .from("company_chat_messages")
        .insert({
          company_id: company.id,
          driver_id: driverId,
          sender_type: "company",
          message: String(message).trim(),
        })
        .select()
        .single();

      if (chatErr) {
        return NextResponse.json({ error: chatErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: inserted });
    }

    if (action === "get_chat_messages") {
      const { driverId } = data || {};
      if (!driverId) {
        return NextResponse.json({ error: "Identifiant conducteur requis." }, { status: 400 });
      }

      const { data: messages } = await supabaseAdmin
        .from("company_chat_messages")
        .select("*")
        .eq("company_id", company.id)
        .eq("driver_id", driverId)
        .order("created_at", { ascending: true });

      return NextResponse.json({ success: true, messages: messages || [] });
    }

    return NextResponse.json({ error: "Action commerciale non reconnue." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/company/commercial error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
