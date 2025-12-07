import fs from "node:fs/promises"
import { google } from "googleapis";
import readOgRomBinaryGameState from "./gameStateParsing/game-state/read-og-rom-game-state.js"

/////////////////////
// google auth setup
/////////////////////

const getServiceAccountJSON = await fs.readFile("./serviceKeys.json");
const serviceAccount = JSON.parse(getServiceAccountJSON)

// Initialize the Sheets API client in the main thread
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const spreadSheetId = process.env.spreadSheetId

/////////////////
// read game data
/////////////////

const buffer = await fs.readFile("./NHL_95.state30")

const gameFileBuffer = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength
);

const gameData = await readOgRomBinaryGameState(gameFileBuffer)