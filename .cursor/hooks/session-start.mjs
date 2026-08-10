#!/usr/bin/env node
/** Reminds agents: mobile Play Store factory — read mobile-dev-cycle skill. */
import { readFileSync } from "node:fs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  // stdin optional
}

const context = [
  "Auto-App: mobile Play Store factory (primary lane).",
  "Read .cursor/skills/mobile-dev-cycle/SKILL.md before mobile work.",
  "Web archived; extensions maintenance-only.",
  "Human approves spec before code; ask before new npm install.",
  "Device testing: npm run android (USB dev build), not Expo Go for ads.",
].join(" ");

try {
  const payload = input ? JSON.parse(input) : {};
  console.log(
    JSON.stringify({
      ...payload,
      additional_context: context,
    }),
  );
} catch {
  console.log(JSON.stringify({ additional_context: context }));
}
