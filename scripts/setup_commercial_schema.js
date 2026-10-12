import { executeSql } from "./db.mjs";

const sql = `
-- 1. Configuration Fiscale (Micro-Entreprise)
CREATE TABLE IF NOT EXISTS tax_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  regime TEXT NOT NULL DEFAULT 'micro_entreprise',
  is_vat_exempt BOOLEAN NOT NULL DEFAULT true,
  vat_legal_notice TEXT NOT NULL DEFAULT 'TVA non applicable, art. 293 B du CGI',
  vat_number TEXT DEFAULT '',
  vat_rate NUMERIC DEFAULT 0,
  company_legal_name TEXT NOT NULL DEFAULT 'TruckMatch',
  company_siret TEXT DEFAULT '',
  company_address TEXT DEFAULT '',
  company_billing_email TEXT NOT NULL DEFAULT 'jobs@truckmatch.fr',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tax_settings (id, regime, is_vat_exempt, vat_legal_notice, company_legal_name, company_billing_email)
VALUES ('default', 'micro_entreprise', true, 'TVA non applicable, art. 293 B du CGI', 'TruckMatch', 'jobs@truckmatch.fr')
ON CONFLICT (id) DO NOTHING;

-- 2. Grille Commerciale & Tarifs
CREATE TABLE IF NOT EXISTS commercial_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_eur NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'month',
  max_active_jobs INT NOT NULL DEFAULT 0,
  monthly_credits INT NOT NULL DEFAULT 0,
  has_chat BOOLEAN NOT NULL DEFAULT false,
  has_advanced_search BOOLEAN NOT NULL DEFAULT false,
  has_ad_banner BOOLEAN NOT NULL DEFAULT false,
  priority_badge TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO commercial_plans (id, name, price_eur, max_active_jobs, monthly_credits, has_chat, has_advanced_search, has_ad_banner, priority_badge, features)
VALUES
('decouverte', 'Découverte', 0, 0, 0, false, false, false, 'Gratuit', '["Page entreprise & logo", "Coordonnées publiques des candidats", "Achat crédits à l''unité"]'::jsonb),
('recruteur', 'Recruteur', 39, 2, 3, true, true, false, 'Essentiel', '["Jusqu''à 2 offres actives", "3 crédits déblocage / mois", "Tchat direct conducteurs", "Coordonnées complètes débloquées"]'::jsonb),
('transport_pro', 'Transport Pro', 79, 5, 10, true, true, true, 'Populaire', '["Jusqu''à 5 offres actives", "10 crédits déblocage / mois", "Recherche avancée vivier", "Logo bandeau & mise en avant", "Tchat direct conducteurs"]'::jsonb),
('flotte_reseau', 'Flotte & Réseau', 149, 15, 25, true, true, true, 'Premium', '["Jusqu''à 15 offres actives", "25 crédits déblocage / mois", "Visibilité maximale", "Tarif préférentiel missions", "Support prioritaire dédié"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_eur = EXCLUDED.price_eur,
  max_active_jobs = EXCLUDED.max_active_jobs,
  monthly_credits = EXCLUDED.monthly_credits,
  has_chat = EXCLUDED.has_chat,
  features = EXCLUDED.features;

-- 3. Colonnes d'extension sur la table companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'decouverte',
  ADD COLUMN IF NOT EXISTS credits_balance INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_subscription_gifted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gifted_reason TEXT,
  ADD COLUMN IF NOT EXISTS gifted_notes TEXT;

-- 4. Abonnements Entreprises (Historique & Statuts)
CREATE TABLE IF NOT EXISTS company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES commercial_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  is_gifted BOOLEAN NOT NULL DEFAULT false,
  gifted_reason TEXT,
  gifted_by_admin TEXT,
  gifted_notes TEXT,
  price_paid NUMERIC NOT NULL DEFAULT 0,
  credits_balance INT NOT NULL DEFAULT 0,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Commandes & Transactions Commerciales
CREATE TABLE IF NOT EXISTS commercial_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT,
  company_email TEXT,
  order_type TEXT NOT NULL, -- 'subscription', 'credits', 'job_post', 'job_boost', 'ad_campaign', 'search_mission', 'gifted_subscription'
  product_name TEXT NOT NULL,
  product_id TEXT,
  quantity INT NOT NULL DEFAULT 1,
  amount_eur NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded', 'gifted'
  payment_method TEXT DEFAULT 'card', -- 'card', 'transfer', 'gifted', 'demo_direct'
  payment_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 6. Profils Débloqués (Un même candidat ne doit pas être facturé 2 fois !)
CREATE TABLE IF NOT EXISTS unlocked_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  credits_spent INT NOT NULL DEFAULT 1,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_company_driver_unlock UNIQUE (company_id, driver_id)
);

-- 7. Tchat Privé Entreprise <-> Chauffeur Débloqué
CREATE TABLE IF NOT EXISTS company_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'company' | 'driver'
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Missions de Recherche de Chauffeurs
CREATE TABLE IF NOT EXISTS driver_search_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_number TEXT UNIQUE NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT,
  company_email TEXT,
  order_id UUID REFERENCES commercial_orders(id) ON DELETE SET NULL,
  driver_count INT NOT NULL DEFAULT 1,
  permit_required TEXT,
  vehicle_type TEXT,
  regions JSONB DEFAULT '[]'::jsonb,
  contract_type TEXT,
  experience_required TEXT,
  start_date TEXT,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  price_eur NUMERIC NOT NULL DEFAULT 149,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- 'pending_payment', 'paid', 'searching', 'shortlisted', 'completed', 'cancelled', 'refunded'
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Campagnes Publicitaires Entreprises
CREATE TABLE IF NOT EXISTS advertising_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT,
  campaign_type TEXT NOT NULL, -- 'banner_logo', 'priority_logo', 'featured_company'
  title TEXT NOT NULL,
  logo_url TEXT,
  target_url TEXT,
  price_eur NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- 'pending_payment', 'active', 'paused', 'expired'
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Audit Log Commercial (Traçabilité des abonnements offerts et opérations sensibles)
CREATE TABLE IF NOT EXISTS commercial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'gift_subscription', 'revoke_gift', 'update_plan', 'update_tax', 'refund_order'
  target_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  target_company_name TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performances et requêtes analytiques rapides
CREATE INDEX IF NOT EXISTS idx_commercial_orders_company ON commercial_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_status ON commercial_orders(status);
CREATE INDEX IF NOT EXISTS idx_commercial_orders_created ON commercial_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_lookup ON unlocked_profiles(company_id, driver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pair ON company_chat_messages(company_id, driver_id);
CREATE INDEX IF NOT EXISTS idx_search_missions_company ON driver_search_missions(company_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_company ON advertising_campaigns(company_id);
`;

executeSql(sql)
  .then(() => {
    console.log("✅ Toutes les tables commerciales TruckMatch ont été créées avec succès !");
  })
  .catch((err) => {
    console.error("❌ Erreur SQL:", err.message);
    process.exit(1);
  });
