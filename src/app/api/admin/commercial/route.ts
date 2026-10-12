import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { notifyGiftedSubscription } from "@/lib/telegram/notifier";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azxwqcdnwkolodxwsqoq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Administrateur requis." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // today, 7d, 30d, month, year, all

    // Calcul de la plage de dates
    const now = new Date();
    let startDate: Date;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else if (period === "all") {
      startDate = new Date(2020, 0, 1);
    } else {
      // 30d par défaut
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startIso = startDate.toISOString();

    // 1. Récupération des données réelles en parallèle
    const [
      companiesRes,
      ordersRes,
      subscriptionsRes,
      plansRes,
      unlocksRes,
      jobsRes,
      missionsRes,
      campaignsRes,
      taxRes,
      auditRes,
    ] = await Promise.all([
      supabaseAdmin.from("companies").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("commercial_orders").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("company_subscriptions").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("commercial_plans").select("*").order("price_eur", { ascending: true }),
      supabaseAdmin.from("unlocked_profiles").select("id, company_id, driver_id, unlocked_at"),
      supabaseAdmin.from("jobs").select("id, company_id, status, is_active"),
      supabaseAdmin.from("driver_search_missions").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("advertising_campaigns").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("tax_settings").select("*").eq("id", "default").maybeSingle(),
      supabaseAdmin.from("commercial_audit_logs").select("*").order("created_at", { ascending: false }).limit(25),
    ]);

    const allCompanies = companiesRes.data || [];
    const allOrders = ordersRes.data || [];
    const allSubs = subscriptionsRes.data || [];
    const allPlans = plansRes.data || [];
    const allUnlocks = unlocksRes.data || [];
    const allJobs = jobsRes.data || [];
    const allMissions = missionsRes.data || [];
    const allCampaigns = campaignsRes.data || [];

    // Filtrer les commandes sur la période
    const periodOrders = allOrders.filter((o) => new Date(o.created_at) >= startDate);
    const paidPeriodOrders = periodOrders.filter((o) => o.status === "paid" && o.is_paid);

    // Chiffre d'affaires encaissé réel (uniquement les commandes payées, sans les 0€ offerts)
    const collectedRevenueEur = paidPeriodOrders.reduce((sum, o) => sum + Number(o.total_paid || o.amount_eur || 0), 0);

    // Répartition des revenus par type de produit
    const revenueByType = {
      subscription: paidPeriodOrders.filter((o) => o.order_type === "subscription").reduce((sum, o) => sum + Number(o.total_paid || 0), 0),
      credits: paidPeriodOrders.filter((o) => o.order_type === "credits").reduce((sum, o) => sum + Number(o.total_paid || 0), 0),
      search_mission: paidPeriodOrders.filter((o) => o.order_type === "search_mission").reduce((sum, o) => sum + Number(o.total_paid || 0), 0),
      ad_campaign: paidPeriodOrders.filter((o) => o.order_type === "ad_campaign").reduce((sum, o) => sum + Number(o.total_paid || 0), 0),
      job_post: paidPeriodOrders.filter((o) => o.order_type === "job_post" || o.order_type === "job_boost").reduce((sum, o) => sum + Number(o.total_paid || 0), 0),
    };

    // Indicateurs entreprises & abonnements
    const totalCompanies = allCompanies.length;
    const giftedCompanies = allCompanies.filter((c) => c.is_subscription_gifted && c.subscription_plan !== "decouverte").length;
    const paidActiveCompanies = allCompanies.filter((c) => !c.is_subscription_gifted && c.subscription_plan && c.subscription_plan !== "decouverte").length;
    const freeCompanies = totalCompanies - paidActiveCompanies - giftedCompanies;

    const subsByPlan = {
      decouverte: allCompanies.filter((c) => !c.subscription_plan || c.subscription_plan === "decouverte").length,
      recruteur: allCompanies.filter((c) => c.subscription_plan === "recruteur").length,
      transport_pro: allCompanies.filter((c) => c.subscription_plan === "transport_pro").length,
      flotte_reseau: allCompanies.filter((c) => c.subscription_plan === "flotte_reseau").length,
    };

    const cancelledOrExpiredSubs = allSubs.filter((s) => s.status === "cancelled" || s.status === "expired").length;
    const creditsPurchasesCount = paidPeriodOrders.filter((o) => o.order_type === "credits").length;
    const unlockedProfilesCount = allUnlocks.length;
    const paidCampaignsCount = allCampaigns.filter((c) => c.status === "active").length;
    const searchMissionsCount = allMissions.length;

    // Agréger les statistiques par entreprise pour le tableau
    const companiesDetails = allCompanies.map((c) => {
      const companyOrders = allOrders.filter((o) => o.company_id === c.id);
      const companyPaidOrders = companyOrders.filter((o) => o.status === "paid" && o.is_paid);
      const totalPaidEur = companyPaidOrders.reduce((sum, o) => sum + Number(o.total_paid || 0), 0);
      const lastOrder = companyOrders[0] || null;
      const unlocksCount = allUnlocks.filter((u) => u.company_id === c.id).length;
      const activeJobsCount = allJobs.filter((j) => j.company_id === c.id && j.status === "approved" && j.is_active).length;

      return {
        id: c.id,
        name: c.company_name,
        email: c.email,
        phone: c.phone || "",
        city: c.city || "",
        postalCode: c.postal_code || "",
        siret: c.siret || "",
        createdAt: c.created_at,
        subscriptionPlan: c.subscription_plan || "decouverte",
        subscriptionStatus: c.subscription_status || "active",
        subscriptionExpiresAt: c.subscription_expires_at || null,
        creditsBalance: c.credits_balance || 0,
        isGifted: Boolean(c.is_subscription_gifted),
        giftedReason: c.gifted_reason || "",
        totalPaidEur,
        unlocksCount,
        activeJobsCount,
        lastPurchaseDate: lastOrder ? lastOrder.created_at : null,
      };
    });

    // Données pour graphiques dans le temps (30 derniers jours)
    const chartMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      chartMap[key] = { date: label, revenue: 0, ordersCount: 0 };
    }

    paidPeriodOrders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split("T")[0];
      if (chartMap[key]) {
        chartMap[key].revenue += Number(o.total_paid || 0);
        chartMap[key].ordersCount += 1;
      }
    });

    const chartData = Object.values(chartMap);

    return NextResponse.json({
      success: true,
      period,
      kpis: {
        totalCompanies,
        paidActiveCompanies,
        giftedCompanies,
        freeCompanies,
        subsByPlan,
        cancelledOrExpiredSubs,
        creditsPurchasesCount,
        unlockedProfilesCount,
        paidCampaignsCount,
        searchMissionsCount,
        collectedRevenueEur,
        revenueByType,
      },
      chartData,
      recentOrders: allOrders.slice(0, 20),
      companies: companiesDetails,
      plans: allPlans,
      taxSettings: taxRes.data || {
        is_vat_exempt: true,
        vat_legal_notice: "TVA non applicable, art. 293 B du CGI",
        company_legal_name: "TruckMatch",
      },
      missions: allMissions,
      campaigns: allCampaigns,
      auditLogs: auditRes.data || [],
    });
  } catch (err: any) {
    console.error("GET /api/admin/commercial error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé. Administrateur requis." }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    // 1. ATTRIBUER UN ABONNEMENT OFFERT (0 € de CA, sans transaction payée, avec audit log)
    if (action === "gift_subscription") {
      const { companyId, planId, durationDays = 30, reason, notes } = data || {};

      if (!companyId || !planId) {
        return NextResponse.json({ error: "Entreprise et forfait requis." }, { status: 400 });
      }

      if (!reason || !String(reason).trim()) {
        return NextResponse.json({ error: "Le motif de l'attribution offerte est obligatoire." }, { status: 400 });
      }

      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (!company) {
        return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
      }

      const { data: plan } = await supabaseAdmin
        .from("commercial_plans")
        .select("*")
        .eq("id", planId)
        .maybeSingle();

      if (!plan) {
        return NextResponse.json({ error: "Forfait introuvable." }, { status: 404 });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(durationDays));

      // Crédits mensuels inclus
      const creditsToAdd = Number(plan.monthly_credits || 0);
      const newCreditsBalance = (company.credits_balance || 0) + creditsToAdd;

      // Clôturer les anciens abonnements
      await supabaseAdmin
        .from("company_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("company_id", company.id)
        .eq("status", "active");

      // Créer l'abonnement offert (price_paid = 0, is_gifted = true)
      await supabaseAdmin.from("company_subscriptions").insert({
        company_id: company.id,
        plan_id: plan.id,
        status: "active",
        is_gifted: true,
        gifted_reason: String(reason).trim(),
        gifted_by_admin: session.email,
        gifted_notes: notes ? String(notes).trim() : null,
        price_paid: 0, // ZÉRO euro payé
        credits_balance: creditsToAdd,
        auto_renew: false,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      // Mettre à jour l'entreprise
      await supabaseAdmin.from("companies").update({
        subscription_plan: plan.id,
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
        credits_balance: newCreditsBalance,
        is_subscription_gifted: true,
        gifted_reason: String(reason).trim(),
        gifted_notes: notes ? String(notes).trim() : null,
      }).eq("id", company.id);

      // Traçabilité Audit Log
      await supabaseAdmin.from("commercial_audit_logs").insert({
        admin_email: session.email,
        action: "gift_subscription",
        target_company_id: company.id,
        target_company_name: company.company_name,
        details: {
          plan_id: plan.id,
          plan_name: plan.name,
          duration_days: durationDays,
          reason,
          notes,
          credits_added: creditsToAdd,
        },
      });

      // Notification Telegram DISTINCTE (signifie explicitement 0 € CA)
      await notifyGiftedSubscription({
        companyName: company.company_name,
        companyEmail: company.email,
        planName: plan.name,
        reason: String(reason).trim(),
        durationDays: Number(durationDays),
        adminEmail: session.email,
      });

      return NextResponse.json({
        success: true,
        message: `Forfait ${plan.name} offert avec succès à ${company.company_name} pour ${durationDays} jours !`,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // 2. RÉVOQUER UN ABONNEMENT OFFERT
    if (action === "revoke_gift") {
      const { companyId, reason = "Révocation administrative" } = data || {};
      if (!companyId) {
        return NextResponse.json({ error: "Identifiant entreprise requis." }, { status: 400 });
      }

      const { data: company } = await supabaseAdmin.from("companies").select("*").eq("id", companyId).maybeSingle();
      if (!company) {
        return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
      }

      await supabaseAdmin
        .from("company_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("company_id", company.id)
        .eq("status", "active");

      await supabaseAdmin.from("companies").update({
        subscription_plan: "decouverte",
        subscription_status: "active",
        subscription_expires_at: null,
        is_subscription_gifted: false,
        gifted_reason: null,
      }).eq("id", company.id);

      await supabaseAdmin.from("commercial_audit_logs").insert({
        admin_email: session.email,
        action: "revoke_gift",
        target_company_id: company.id,
        target_company_name: company.company_name,
        details: { reason },
      });

      return NextResponse.json({
        success: true,
        message: `Abonnement offert révoqué pour ${company.company_name}. Compte repassé en Découverte.`,
      });
    }

    // 3. MISE À JOUR DE LA CONFIGURATION FISCALE (Micro-Entreprise)
    if (action === "update_tax_settings") {
      const {
        regime,
        isVatExempt,
        vatLegalNotice,
        vatNumber,
        companyLegalName,
        companySiret,
        companyAddress,
        companyBillingEmail,
      } = data || {};

      const { data: updated, error: taxErr } = await supabaseAdmin
        .from("tax_settings")
        .upsert({
          id: "default",
          regime: regime || "micro_entreprise",
          is_vat_exempt: Boolean(isVatExempt),
          vat_legal_notice: vatLegalNotice || "TVA non applicable, art. 293 B du CGI",
          vat_number: vatNumber || "",
          company_legal_name: companyLegalName || "TruckMatch",
          company_siret: companySiret || "",
          company_address: companyAddress || "",
          company_billing_email: companyBillingEmail || "jobs@truckmatch.fr",
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (taxErr) {
        return NextResponse.json({ error: taxErr.message }, { status: 500 });
      }

      await supabaseAdmin.from("commercial_audit_logs").insert({
        admin_email: session.email,
        action: "update_tax",
        details: { isVatExempt, vatLegalNotice, companyLegalName },
      });

      return NextResponse.json({
        success: true,
        message: "Configuration fiscale mise à jour avec succès.",
        taxSettings: updated,
      });
    }

    // 4. MISE À JOUR DU TARIF D'UN FORFAIT
    if (action === "update_plan_pricing") {
      const { planId, priceEur, maxActiveJobs, monthlyCredits } = data || {};
      if (!planId) {
        return NextResponse.json({ error: "Identifiant de forfait requis." }, { status: 400 });
      }

      const { data: updated, error: planErr } = await supabaseAdmin
        .from("commercial_plans")
        .update({
          price_eur: Number(priceEur),
          max_active_jobs: Number(maxActiveJobs),
          monthly_credits: Number(monthlyCredits),
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .select()
        .single();

      if (planErr) {
        return NextResponse.json({ error: planErr.message }, { status: 500 });
      }

      await supabaseAdmin.from("commercial_audit_logs").insert({
        admin_email: session.email,
        action: "update_plan",
        details: { planId, priceEur, maxActiveJobs, monthlyCredits },
      });

      return NextResponse.json({
        success: true,
        message: "Tarif du forfait mis à jour.",
        plan: updated,
      });
    }

    // 5. MISE À JOUR DU STATUT D'UNE MISSION DE RECHERCHE
    if (action === "update_mission_status") {
      const { missionId, status, adminNotes } = data || {};
      if (!missionId || !status) {
        return NextResponse.json({ error: "Mission et statut requis." }, { status: 400 });
      }

      const { error: misErr } = await supabaseAdmin
        .from("driver_search_missions")
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", missionId);

      if (misErr) {
        return NextResponse.json({ error: misErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Statut de la mission mis à jour." });
    }

    return NextResponse.json({ error: "Action administrative commerciale non reconnue." }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/commercial error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
