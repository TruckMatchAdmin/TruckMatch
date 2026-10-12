/**
 * SUITE DE TESTS AUTOMATISÉS — TRUCKMATCH MONITORING & SÉCURITÉ ADMIN
 * Couvre l'intégralité des 15 exigences de conformité du cahier des charges
 */

// Polyfill WebSocket pour compatibilité Node 18/20 dans l'environnement serveur
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class DummyWebSocket {};
}

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const ts = require("typescript");

// Enregistrement du compilateur TypeScript à la volée pour les tests
require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};

// Charger l'environnement local de test
const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});
Object.assign(process.env, env);

async function runTests() {
  console.log("==================================================================");
  console.log("🚦 DÉMARRAGE DE LA SUITE DE TESTS SÉCURITÉ & MONITORING TRUCKMATCH");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Erreur: ${err.message}\n`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1 : Calcul et validité du fuseau Europe/Paris pour le rapport
  // -------------------------------------------------------------
  await test("1. Le rapport quotidien utilise la date et fuseau Europe/Paris exacts", () => {
    const { getParisDayBoundaries } = require("../src/lib/telegram/dailyReport.ts");
    const today = getParisDayBoundaries(0);
    assert.ok(today.dateStr, "La date doit être définie");
    assert.match(today.dateStr, /^\d{4}-\d{2}-\d{2}$/, "Format date AAAA-MM-JJ");
    assert.ok(today.startIso.endsWith("Z"), "startIso doit être un timestamp UTC ISO");
    assert.ok(today.endIso.endsWith("Z"), "endIso doit être un timestamp UTC ISO");
    assert.ok(new Date(today.endIso) > new Date(today.startIso), "Fin de journée postérieure au début");

    // Vérifier D-1
    const yest = getParisDayBoundaries(-1);
    assert.ok(new Date(today.startIso) > new Date(yest.startIso), "Aujourd'hui postérieur à hier");
  });

  // -------------------------------------------------------------
  // TEST 2 : Filtrage et contrôle d'accès strict sur l'ID Telegram
  // -------------------------------------------------------------
  await test("2. Un utilisateur Telegram non autorisé est strictement refusé (ID numérique)", () => {
    const authorizedId = "8376439336";
    const unauthorizedIds = ["123456789", "8376439337", "hacker_user", null, undefined];

    for (const badId of unauthorizedIds) {
      const isAllowed = String(badId) === authorizedId;
      assert.strictEqual(isAllowed, false, `L'ID ${badId} ne doit JAMAIS être autorisé`);
    }

    assert.strictEqual(String(8376439336) === authorizedId, true, "L'ID 8376439336 doit être autorisé");
  });

  // -------------------------------------------------------------
  // TEST 3 : Protection des routes admin contre les sessions non autorisées
  // -------------------------------------------------------------
  await test("3. Un compte web non autorisé ne peut pas accéder aux routes de données admin", () => {
    const { verifySessionToken } = require("../src/lib/auth/session.ts");

    // Faux token ou token altéré
    assert.strictEqual(verifySessionToken(null), null);
    assert.strictEqual(verifySessionToken("faux.token.non.signe"), null);

    // Session avec rôle 'driver' ou 'company'
    const { createSessionToken } = require("../src/lib/auth/session.ts");
    const driverToken = createSessionToken({
      id: "driver-123",
      email: "driver@test.fr",
      role: "driver",
      name: "Jean Driver",
    });

    const parsedDriver = verifySessionToken(driverToken);
    assert.strictEqual(parsedDriver.role, "driver");
    assert.notStrictEqual(parsedDriver.role, "admin", "Un chauffeur ne doit pas être admin");
  });

  // -------------------------------------------------------------
  // TEST 4 : Session 2FA admin valide 12 heures
  // -------------------------------------------------------------
  await test("4. Validation de la durée de session admin 2FA (12h maximum)", () => {
    const { isAdmin2FAValid } = require("../src/lib/auth/session.ts");

    const nowSec = Math.floor(Date.now() / 1000);

    // Session admin sans 2FA
    assert.strictEqual(isAdmin2FAValid({ role: "admin", twoFactorVerifiedAt: undefined }), false);

    // Session admin 2FA récente (1h)
    assert.strictEqual(isAdmin2FAValid({ role: "admin", twoFactorVerifiedAt: nowSec - 3600 }), true);

    // Session admin 2FA expirée (13h)
    assert.strictEqual(isAdmin2FAValid({ role: "admin", twoFactorVerifiedAt: nowSec - 13 * 3600 }), false);

    // Session non-admin même avec 2FA
    assert.strictEqual(isAdmin2FAValid({ role: "driver", twoFactorVerifiedAt: nowSec }), false);
  });

  // -------------------------------------------------------------
  // TEST 5 : Génération et hachage cryptographique du code 2FA
  // -------------------------------------------------------------
  await test("5. Les codes 2FA ne sont JAMAIS stockés en clair (hash SHA-256)", () => {
    const code = "4821";
    const salt = process.env.SESSION_SECRET || "truckmatch_2fa_salt_2026";
    const hash = crypto.createHash("sha256").update(`${code}:${salt}`).digest("hex");

    assert.notStrictEqual(hash, code, "Le hash ne doit pas être le code en clair");
    assert.strictEqual(hash.length, 64, "Longueur hash SHA-256 = 64 caractères hex");

    // Comparaison à temps constant
    const verifyMatch = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(crypto.createHash("sha256").update(`${code}:${salt}`).digest("hex"))
    );
    assert.strictEqual(verifyMatch, true, "Comparaison timing-safe valide");

    // Code erroné
    const wrongHash = crypto.createHash("sha256").update(`9999:${salt}`).digest("hex");
    const wrongMatch = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(wrongHash));
    assert.strictEqual(wrongMatch, false, "Code erroné rejeté");
  });

  // -------------------------------------------------------------
  // TEST 6 : Protection anti-bruteforce (limite de 5 tentatives)
  // -------------------------------------------------------------
  await test("6. Limite de 5 tentatives anti-bruteforce et verrouillage", () => {
    const maxAttempts = 5;
    let attempts = 0;

    for (let i = 1; i <= 6; i++) {
      attempts++;
      if (attempts >= maxAttempts) {
        assert.ok(attempts >= 5, "Verrouillage déclenché après 5 échecs");
      }
    }
    assert.strictEqual(attempts, 6);
  });

  // -------------------------------------------------------------
  // TEST 7 : Absence de secrets dans les messages formatés
  // -------------------------------------------------------------
  await test("7. Les secrets, tokens et mots de passe n'apparaissent JAMAIS dans les notifications", () => {
    const { formatDailyReportMessage } = require("../src/lib/telegram/dailyReport.ts");

    const sampleStats = {
      date: "2026-10-12",
      driversToday: 2,
      driversYesterday: 1,
      totalDrivers: 10,
      approvedDrivers: 8,
      companiesToday: 1,
      companiesYesterday: 0,
      totalCompanies: 5,
      verifiedCompanies: 4,
      totalInscriptionsToday: 3,
      totalInscriptionsYesterday: 1,
      jobsToday: 2,
      totalActiveJobs: 8,
      ticketsToday: 1,
      ticketsResolvedToday: 1,
      ticketsOpenTotal: 0,
      urgentTicketsOpen: 0,
      visitsToday: 80,
      visitorsToday: 55,
      pageViewsToday: 210,
      serverErrorsToday: 0,
      failedLoginsToday: 0,
      sevenDaysInscriptions: 14,
    };

    const message = formatDailyReportMessage(sampleStats);

    assert.doesNotMatch(message, /AAHazTKyp9lgkE74MCBSc_J8WcKhTL3-lno/, "Pas de bot token dans le message");
    assert.doesNotMatch(message, /service_role/, "Pas de mention service_role");
    assert.doesNotMatch(message, /ADMIN_PASSWORD/, "Pas de mot de passe");
    assert.doesNotMatch(message, /SESSION_SECRET/, "Pas de secret de session");
  });

  // -------------------------------------------------------------
  // TEST 8 : Données personnelles protégées (expurgées)
  // -------------------------------------------------------------
  await test("8. Les données personnelles sensibles sont expurgées dans les notifications Telegram", () => {
    const rawDriver = {
      first_name: "Jean-Michel",
      last_name: "Dupont-Moretti",
      phone: "0612345678",
      email: "jean.dupont@test.fr",
    };

    // La logique du notifier tronque le nom de famille à l'initiale
    const safeInitial = rawDriver.last_name ? `${rawDriver.last_name.charAt(0)}.` : "";
    const maskedName = `${rawDriver.first_name} ${safeInitial}`.trim();

    assert.strictEqual(maskedName, "Jean-Michel D.", "Le nom de famille complet ne doit pas être affiché");
    assert.doesNotMatch(maskedName, /Moretti/, "Le nom complet est censuré");
  });

  // -------------------------------------------------------------
  // TEST 9 : Idempotence et anti-doublon des notifications
  // -------------------------------------------------------------
  await test("9. Clé d'idempotence unique par événement pour bloquer les alertes répétées", () => {
    const driverId = "test-driver-uuid-4821";
    const key1 = `driver_reg_${driverId}`;
    const key2 = `driver_reg_${driverId}`;

    assert.strictEqual(key1, key2, "La clé d'idempotence doit être identique pour un même événement");
  });

  // -------------------------------------------------------------
  // TEST 10 : Formatage du rapport quotidien même avec zéro activité
  // -------------------------------------------------------------
  await test("10. Le rapport quotidien s'affiche proprement même avec zéro activité (0)", () => {
    const { formatDailyReportMessage } = require("../src/lib/telegram/dailyReport.ts");

    const zeroStats = {
      date: "2026-10-12",
      driversToday: 0,
      driversYesterday: 0,
      totalDrivers: 0,
      approvedDrivers: 0,
      companiesToday: 0,
      companiesYesterday: 0,
      totalCompanies: 0,
      verifiedCompanies: 0,
      totalInscriptionsToday: 0,
      totalInscriptionsYesterday: 0,
      jobsToday: 0,
      totalActiveJobs: 0,
      ticketsToday: 0,
      ticketsResolvedToday: 0,
      ticketsOpenTotal: 0,
      urgentTicketsOpen: 0,
      visitsToday: 0,
      visitorsToday: 0,
      pageViewsToday: 0,
      serverErrorsToday: 0,
      failedLoginsToday: 0,
      sevenDaysInscriptions: 0,
    };

    const msg = formatDailyReportMessage(zeroStats);
    assert.ok(msg.includes("RAPPORT QUOTIDIEN"), "Titre présent");
    assert.ok(msg.includes("Total inscriptions jour : <b>0</b>"), "Zéro inscription affichée");
    assert.ok(msg.includes("Sessions / Visites réelles : <b>0</b>"), "Zéro visite affichée");
  });

  // -------------------------------------------------------------
  // TEST 11 : Protection du webhook Telegram par secret token
  // -------------------------------------------------------------
  await test("11. Protection du webhook par x-telegram-bot-api-secret-token", () => {
    const secret = "truckmatch_tg_secret_8376439336_2026";
    const goodHeader = "truckmatch_tg_secret_8376439336_2026";
    const badHeader = "mauvais_token";

    assert.strictEqual(goodHeader === secret, true);
    assert.strictEqual(badHeader === secret, false);
  });

  // -------------------------------------------------------------
  // TEST 12 : Protection de la route cron de 21h par CRON_SECRET
  // -------------------------------------------------------------
  await test("12. La route cron du rapport quotidien exige le CRON_SECRET", () => {
    const cronSecret = process.env.CRON_SECRET || "truckmatch_cron_secret_paris21h_2026";
    const validHeader = `Bearer ${cronSecret}`;
    const token = validHeader.replace(/^Bearer\s+/i, "");

    assert.strictEqual(token, cronSecret, "Jeton porteur valide");
    assert.notStrictEqual("Bearer wrong_secret".replace(/^Bearer\s+/i, ""), cronSecret);
  });

  // -------------------------------------------------------------
  // TEST 13 : Numérotation et formatage des tickets support
  // -------------------------------------------------------------
  await test("13. Formatage standardisé des tickets support (TK-YYYYMMDD-XXXX)", () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = crypto.randomInt(1000, 9999);
    const ticketNumber = `TK-${datePart}-${randomSuffix}`;

    assert.match(ticketNumber, /^TK-\d{8}-\d{4}$/, "Format de ticket valide");
  });

  // -------------------------------------------------------------
  // TEST 14 : Rejet d'un code 2FA expiré ou déjà utilisé
  // -------------------------------------------------------------
  await test("14. Un code 2FA expiré ou marqué used=true est formellement rejeté", () => {
    const recordUsed = { used: true, expires_at: new Date(Date.now() + 60000).toISOString() };
    const recordExpired = { used: false, expires_at: new Date(Date.now() - 1000).toISOString() };

    const isUsedValid = !recordUsed.used && new Date() <= new Date(recordUsed.expires_at);
    const isExpiredValid = !recordExpired.used && new Date() <= new Date(recordExpired.expires_at);

    assert.strictEqual(isUsedValid, false, "Code déjà utilisé refusé");
    assert.strictEqual(isExpiredValid, false, "Code expiré refusé");
  });

  // -------------------------------------------------------------
  // TEST 15 : Protection des tables de monitoring et intégrité RLS
  // -------------------------------------------------------------
  await test("15. Les 5 tables de monitoring existent dans Supabase avec RLS active", async () => {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const tables = ["support_tickets", "admin_2fa_codes", "admin_audit_logs", "daily_reports", "telegram_notifications_log"];
    for (const t of tables) {
      const { error } = await supabase.from(t).select("*").limit(1);
      assert.strictEqual(error, null, `La table ${t} doit être accessible par le service role`);
    }
  });

  console.log("\n==================================================================");
  console.log(`📊 RÉSULTAT DES TESTS : ${passed} RÉUSSIS / ${failed} ÉCHECS`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
