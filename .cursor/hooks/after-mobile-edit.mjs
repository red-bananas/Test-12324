#!/usr/bin/env node
/** After edits under apps/mobile/, remind to run tests if logic touched. */
import { readFileSync } from "node:fs";

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath =
  payload.file_path ?? payload.path ?? payload.filePath ?? payload.editedFile ?? "";

if (!filePath.includes("apps/mobile/")) {
  process.exit(0);
}

const logicPattern = /\/(game|lib|hooks|components)\//;
if (!logicPattern.test(filePath)) {
  process.exit(0);
}

console.log(
  JSON.stringify({
    user_message:
      "Mobile app file edited. Run tests in the app dir: npm run typecheck && npm test",
  }),
);
