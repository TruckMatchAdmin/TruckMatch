// Test suite for TruckMatch Commercial System
// Abonnements, crédits, déblocage profils, abonnements offerts, fiscalité micro-entreprise, Telegram

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 TRUCKMATCH COMMERCIAL TEST SUITE');
  console.log('====================================================');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [TEST ${total}] PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ [TEST ${total}] FAIL: ${message}`);
    }
  }

  try {
    // 1. Fiscalité micro-entreprise & Grille tarifaire
    console.log('\n--- 1. Fiscalité Micro-Entreprise & Tarifs ---');
    const { data: taxSettings } = await supabase.from('tax_settings').select('*').limit(1).single();
    assert(taxSettings !== null, 'Paramètres fiscaux disponibles en base');
    assert(taxSettings.regime === 'micro_entreprise', 'Régime fiscal configuré en micro-entreprise');
    assert(taxSettings.is_vat_exempt === true, 'Franchise en base de TVA active (is_vat_exempt = true)');
    assert(taxSettings.vat_legal_notice.includes('293 B du CGI'), 'Mention légale conforme art. 293 B du CGI présente');

    const { data: plans } = await supabase.from('commercial_plans').select('*');
    assert(plans && plans.length === 4, '4 forfaits configurés (decouverte, recruteur, transport_pro, flotte_reseau)');

    const recruteurPlan = plans.find(p => p.id === 'recruteur');
    const proPlan = plans.find(p => p.id === 'transport_pro');
    const flottePlan = plans.find(p => p.id === 'flotte_reseau');
    assert(Number(recruteurPlan.price_eur) === 39, 'Forfait Recruteur fixé à 39 € net à payer');
    assert(Number(proPlan.price_eur) === 79, 'Forfait Transport Pro fixé à 79 € net à payer');
    assert(Number(flottePlan.price_eur) === 149, 'Forfait Flotte & Réseau fixé à 149 € net à payer');

    // 2. Entreprise de test
    console.log('\n--- 2. Achat de Crédits & Solde ---');
    const testEmail = `test-carrier-${Date.now()}@truckmatch-test.fr`;
    const testSiret = String(Math.floor(10000000000000 + Math.random() * 89999999999999));
    const { data: company, error: compErr } = await supabase.from('companies').insert({
      company_name: 'Transports Test Automatisé SAS',
      contact_first_name: 'Jean',
      contact_last_name: 'Dupont',
      address: '10 Rue de la Logistique',
      siret: testSiret,
      email: testEmail,
      phone: '06 11 22 33 44',
      city: 'Lyon',
      postal_code: '69002',
      credits_balance: 0,
      subscription_plan: 'decouverte',
      subscription_status: 'active'
    }).select().single();

    assert(company && !compErr, 'Entreprise de test créée');
    assert(company.credits_balance === 0, 'Solde initial à 0 crédit');

    // Simuler achat pack 15 crédits (49 €)
    const { data: creditOrder, error: orderErr } = await supabase.from('commercial_orders').insert({
      company_id: company.id,
      company_name: company.company_name,
      company_email: company.email,
      order_number: `ORD-TEST-${Date.now()}`,
      order_type: 'credits',
      product_name: 'Pack 15 crédits',
      quantity: 15,
      amount_eur: 49,
      vat_amount: 0,
      total_paid: 49,
      is_paid: true,
      status: 'paid',
      payment_method: 'card',
      payment_reference: 'pay_test_tok_123',
      paid_at: new Date().toISOString()
    }).select().single();

    assert(creditOrder && !orderErr, 'Commande de 15 crédits créée avec statut paid');
    assert(Number(creditOrder.amount_eur) === 49, 'Montant de 49.00 € correctement enregistré');

    // Créditer l'entreprise
    const { data: compUpdated } = await supabase
      .from('companies')
      .update({ credits_balance: company.credits_balance + creditOrder.quantity })
      .eq('id', company.id)
      .select().single();

    assert(compUpdated.credits_balance === 15, 'Solde de l\'entreprise mis à jour à 15 crédits');

    // 3. Déblocage candidat & Protection double facturation
    console.log('\n--- 3. Déblocage Profil Candidat & Débit ---');
    let { data: driver } = await supabase.from('drivers').select('id, first_name, last_name, phone').limit(1).single();
    if (!driver) {
      const { data: newDriver } = await supabase.from('drivers').insert({
        first_name: 'Michel',
        last_name: 'Routier',
        phone: '06 99 88 77 66',
        email: `driver-test-${Date.now()}@truckmatch-test.fr`,
        birth_date: '1990-05-15',
        address: '10 Rue de la Gare',
        city: 'Marseille',
        postal_code: '13001',
        permits: ['CE', 'C'],
        status: 'approved',
        is_approved: true
      }).select().single();
      driver = newDriver;
    }

    assert(driver !== null, 'Chauffeur candidat identifié pour le test');

    // Premier déblocage
    const { data: unlock1, error: unlockErr1 } = await supabase.from('unlocked_profiles').insert({
      company_id: company.id,
      driver_id: driver.id,
      credits_spent: 1
    }).select().single();

    assert(unlock1 && !unlockErr1, 'Premier déblocage réussi');

    // Débit du solde
    const { data: compAfterUnlock } = await supabase
      .from('companies')
      .update({ credits_balance: compUpdated.credits_balance - 1 })
      .eq('id', company.id)
      .select().single();

    assert(compAfterUnlock.credits_balance === 14, 'Exactement 1 crédit débité (solde = 14)');

    // Tentative de re-déblocage du MÊME chauffeur (doit être refusé par la contrainte UNIQUE)
    const { error: duplicateUnlockErr } = await supabase.from('unlocked_profiles').insert({
      company_id: company.id,
      driver_id: driver.id,
      credits_spent: 1
    });

    assert(duplicateUnlockErr !== null, 'Protection double facturation : refus d\'un second déblocage payant pour le même candidat');

    // 4. Attribution d'un abonnement offert (Règle impérative 0 € CA)
    console.log('\n--- 4. Abonnement Offert par l\'Administration ---');
    const giftExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Mettre à jour l'entreprise avec le forfait offert
    const { data: compGifted, error: giftErr } = await supabase
      .from('companies')
      .update({
        subscription_plan: 'transport_pro',
        subscription_status: 'active',
        subscription_expires_at: giftExpiresAt,
        is_subscription_gifted: true,
        gifted_reason: 'Partenariat de lancement',
        gifted_notes: 'Validation accordée par Gabin',
        credits_balance: compAfterUnlock.credits_balance + 10 // 10 crédits inclus dans Transport Pro
      })
      .eq('id', company.id)
      .select().single();

    assert(compGifted && !giftErr, 'Forfait Transport Pro attribué avec succès');
    assert(compGifted.is_subscription_gifted === true, 'Abonnement clairement identifié comme offert (is_subscription_gifted = true)');
    assert(compGifted.credits_balance === 24, '10 crédits inclus dans Transport Pro ajoutés au solde (14 + 10 = 24)');

    // Audit log
    const { data: auditLog, error: auditErr } = await supabase.from('commercial_audit_logs').insert({
      action: 'gift_subscription',
      target_company_id: company.id,
      admin_email: 'jobs@truckmatch.fr',
      details: {
        plan: 'transport_pro',
        reason: 'Partenariat de lancement',
        duration_days: 30
      }
    }).select().single();

    assert(auditLog && !auditErr, 'Journal d\'audit commercial enregistré avec motif et admin responsable');

    // Vérifier qu'AUCUNE commande payante n'a été créée pour cet abonnement offert
    const { data: zeroOrdersForGift } = await supabase
      .from('commercial_orders')
      .select('*')
      .eq('company_id', company.id)
      .eq('order_type', 'subscription');

    assert(!zeroOrdersForGift || zeroOrdersForGift.length === 0, 'Règle impérative 0 € CA : Aucune fausse facture ni fausse commande payée générée pour l\'abonnement offert');

    // 5. Recherche de chauffeurs & Campagne publicitaire
    console.log('\n--- 5. Missions de Recherche & Publicité ---');
    const { data: mission, error: missErr } = await supabase.from('driver_search_missions').insert({
      mission_number: `MIS-TEST-${Date.now()}`,
      company_id: company.id,
      company_name: company.company_name,
      company_email: company.email,
      driver_count: 3,
      permit_required: 'CE',
      contract_type: 'CDI',
      regions: ['Auvergne-Rhône-Alpes'],
      price_eur: 399,
      status: 'paid'
    }).select().single();

    assert(mission && !missErr, 'Mission de recherche (3 chauffeurs, 399 €) créée avec statut paid');

    const { data: campaign, error: campErr } = await supabase.from('advertising_campaigns').insert({
      company_id: company.id,
      company_name: company.company_name,
      campaign_type: 'featured_company',
      title: 'Entreprise à la une',
      price_eur: 99,
      status: 'active'
    }).select().single();

    assert(campaign && !campErr, 'Campagne publicitaire (Entreprise à la une, 99 €) créée avec statut active');

    // 6. Nettoyage de l'entreprise de test
    console.log('\n--- 6. Nettoyage Données de Test ---');
    await supabase.from('driver_search_missions').delete().eq('id', mission.id);
    await supabase.from('advertising_campaigns').delete().eq('id', campaign.id);
    await supabase.from('commercial_audit_logs').delete().eq('id', auditLog.id);
    await supabase.from('unlocked_profiles').delete().eq('id', unlock1.id);
    await supabase.from('commercial_orders').delete().eq('id', creditOrder.id);
    await supabase.from('companies').delete().eq('id', company.id);
    console.log('🧹 Données de test purgées avec succès');

    console.log('\n====================================================');
    console.log(`📊 RÉSULTAT TEST SUITE: ${passed} / ${total} TESTS RÉUSSIS (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================');

  } catch (err) {
    console.error('Erreur critique pendant la suite de tests:', err);
  }
}

runTestSuite();
