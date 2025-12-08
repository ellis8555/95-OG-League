import fs from "node:fs/promises"
import { google } from "googleapis";
import readOgRomBinaryGameState from "./gameStateParsing/game-state/read-og-rom-game-state.js"
import appendGoogleSheetsData from "./google-sheets/appendGoogleSheetsData.js"

/////////////////////
// google auth setup
/////////////////////

const getServiceAccountJSON = await fs.readFile("./serviceKeys.json");
const serviceAccount = JSON.parse(getServiceAccountJSON)

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/////////////////
// read game data
/////////////////

const buffer = await fs.readFile("./NHL_95.state30")

const gameFileBuffer = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength
);

const romData = await readOgRomBinaryGameState(gameFileBuffer)

/////////////////////////
// write to google sheets
/////////////////////////

const spreadsheetId = process.env.spreadSheetId

const sheetsArgsObj = {
  sheets,
  spreadsheetId,
  romData
}

try {
  await appendGoogleSheetsData(sheetsArgsObj)
} catch (error) {
    console.log('error in sending game data to google sheets')
}