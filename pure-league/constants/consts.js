import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Convert ES module URL to path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pureFilePath = path.join(__dirname, "..", "public", "pure_bot_constants.json");
const readPureFile = fs.readFileSync(pureFilePath, "utf-8");

// parse pure leagues json file of settings
const pure_consts = JSON.parse(readPureFile);

export { pure_consts }