import { google } from 'googleapis';
import readOgRomBinaryGameState from "./gameStateParsing/game-state/read-og-rom-game-state.js"
import appendGoogleSheetsData from "./google-sheets/appendGoogleSheetsData.js"

async function processGameState({gameState, homeManager, awayManager}){

  /////////////////
  // google auth
  /////////////////

  const raw = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const credentials = { ...raw, private_key: raw.private_key.replace(/\\n/g, '\n') };
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  /////////////////
  // read game data
  /////////////////
  
  const romData = await readOgRomBinaryGameState(gameState)
  
  /////////////////////////
  // write to google sheets
  /////////////////////////
  
  const spreadsheetId = process.env.SPREADSHEET_ID
  
  const sheetsArgsObj = {
    sheets,
    spreadsheetId,
    romData, 
    homeManager,
    awayManager
  }

  try {
    await appendGoogleSheetsData(sheetsArgsObj)
  } catch (error) {
      console.log(error.message)
  }
}

export default processGameState