-- 1. Supprimer l'index en double sur public.jobs
DROP INDEX IF EXISTS public.idx_jobs_active_approved;

-- 2. Activer RLS sur public.job_applications (Supprime l'alerte CRITICAL)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 3. Activer RLS sur public.support_messages (Supprime l'alerte CRITICAL)
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 4. Sécuriser public.companies :
-- Permettre la lecture publique des fiches entreprises (/entreprises/[slug])
-- et supprimer l'insertion anonyme directe 'WITH CHECK (true)'
DROP POLICY IF EXISTS "Allow anon inserts on companies" ON public.companies;
DROP POLICY IF EXISTS "Public read companies" ON public.companies;
CREATE POLICY "Public read companies" ON public.companies 
  FOR SELECT TO public 
  USING (true);

-- 5. Sécuriser public.drivers :
-- Supprimer l'insertion anonyme directe 'WITH CHECK (true)'
-- (toutes les inscriptions passent par l'API sécurisée /api/auth/register avec validation)
DROP POLICY IF EXISTS "Allow anon inserts on drivers" ON public.drivers;

-- 6. Sécuriser public.site_analytics :
-- Supprimer la permission publique 'WITH CHECK (true)' (le tracking passe par /api/analytics/track côté serveur)
DROP POLICY IF EXISTS "Allow public insert on site_analytics" ON public.site_analytics;

-- 7. Sécuriser public.support_tickets :
-- Supprimer la permission publique 'WITH CHECK (true)' (les tickets passent par /api/support côté serveur)
DROP POLICY IF EXISTS "Allow public insert on support_tickets" ON public.support_tickets;
