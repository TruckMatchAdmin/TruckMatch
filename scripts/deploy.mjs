import { execSync } from "child_process";

const SERVER = "ubuntu@152.228.137.4";
const REMOTE_DIR = "/var/www/truckmatch";

console.log("🚀 Début du déploiement vers le VPS OVH (TruckMatch)...");

try {
  console.log("📦 1. Vérification et commit des modifications locales...");
  try {
    execSync("git add -A", { stdio: "inherit" });
    execSync('git commit -m "chore: auto-deploy update"', { stdio: "inherit" });
  } catch {
    // Rien à committer
  }

  console.log("⬆️  2. Push des commits locaux vers origin/main...");
  execSync("git push origin main", { stdio: "inherit" });

  console.log("🌐 2. Connexion SSH et mise à jour sur le serveur...");
  const remoteCommands = [
    `cd ${REMOTE_DIR}`,
    "git checkout -- package-lock.json",
    "git pull origin main",
    "npm run build",
    "pm2 restart truckmatch",
    "pm2 status"
  ].join(" && ");

  execSync(`ssh -o BatchMode=yes ${SERVER} "${remoteCommands}"`, { stdio: "inherit" });

  console.log("\n✅ Déploiement réussi avec succès sur https://truckmatch.fr !");
} catch (error) {
  console.error("\n❌ Erreur lors du déploiement:", error.message);
  process.exit(1);
}
