#!/usr/bin/env node
/** Push main → gh-pages so GitHub Pages matches local design. */
import { execSync } from "node:child_process";

try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "pipe" });
} catch {
  console.error("Run from the repo root.");
  process.exit(1);
}

const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
if (branch !== "main") {
  console.warn(`Warning: on branch "${branch}", deploying current HEAD to gh-pages.`);
}

console.log("Deploying to GitHub Pages (main → gh-pages)...");
execSync("git push origin HEAD:gh-pages --force", { stdio: "inherit" });
console.log("Done. Site updates in ~1–2 min: https://ahmedwageehberbesh.github.io/Travia/");
