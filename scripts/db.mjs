import fs from "fs";
import path from "path";

// Charger les variables depuis .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let token = process.env.SUPABASE_ACCESS_TOKEN;
let projectRef = "azxwqcdnwkolodxwsqoq";

if (!token && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("SUPABASE_ACCESS_TOKEN=")) {
      token = trimmed.split("=")[1].trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      const url = trimmed.split("=")[1].trim();
      const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
      if (match) projectRef = match[1];
    }
  }
}

if (!token) {
  console.error("Erreur: SUPABASE_ACCESS_TOKEN introuvable dans .env.local");
  process.exit(1);
}

export async function executeSql(query) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur Supabase (${response.status}): ${errText}`);
  }

  return await response.json();
}

// Exécution directe CLI
if (process.argv[1]?.endsWith("db.mjs") || process.argv[1]?.endsWith("db.js")) {
  const arg = process.argv[2];
  if (!arg) {
    console.log("Usage: node scripts/db.js \"SELECT 1;\" ou node scripts/db.js chemin/vers/fichier.sql");
    process.exit(0);
  }

  let sql = arg;
  if (fs.existsSync(arg)) {
    sql = fs.readFileSync(arg, "utf-8");
    console.log(`Exécution du fichier: ${arg}`);
  } else {
    console.log(`Exécution de la requête: ${sql}`);
  }

  executeSql(sql)
    .then((result) => {
      console.log("Succès ! Résultat :");
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
