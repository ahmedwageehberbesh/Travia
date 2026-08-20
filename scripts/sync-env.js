/**
 * Reads .env and writes js/env-config.js for the browser app.
 * Usage: npm run env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const outPath = path.join(root, "js", "env-config.js");
const examplePath = path.join(root, "js", "env-config.example.js");

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

let vars = {};
if (fs.existsSync(envPath)) {
  vars = parseEnv(fs.readFileSync(envPath, "utf8"));
} else {
  console.warn("⚠  .env not found — copy .env.example to .env and add your API key.");
}

const geminiKey = vars.GEMINI_API_KEY || "";

const content = `/** Auto-generated from .env — do not commit if it contains secrets (gitignored). */
export const ENV = {
  GEMINI_API_KEY: ${JSON.stringify(geminiKey)},
};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, "utf8");

if (!fs.existsSync(examplePath)) {
  fs.copyFileSync(outPath, examplePath);
}

if (geminiKey) {
  console.log("✓ env-config.js updated (GEMINI_API_KEY set)");
} else {
  console.log("✓ env-config.js updated (GEMINI_API_KEY empty — add it to .env)");
}
