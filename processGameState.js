import fs from "node:fs/promises"
import { google } from 'googleapis';
import readOgRomBinaryGameState from "./gameStateParsing/game-state/read-og-rom-game-state.js"
import appendGoogleSheetsData from "./google-sheets/appendGoogleSheetsData.js"
import updateCoachesStreaks from "./google-sheets/coachesStreaks.js"

async function processGameState(){

  /////////////////
  // google auth
  /////////////////

  // // puss' auth
  // const raw = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  // const credentials = { ...raw, private_key: raw.private_key.replace(/\\n/g, '\n') };
  // const auth = new google.auth.GoogleAuth({
  //   credentials,
  //   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  // });
  // const sheets = google.sheets({ version: 'v4', auth });

      // Initialize the Sheets API client in the main thread
    const serviceAccount = {
        type: "service_account",
        project_id: "next-auth-testing-447315",
        private_key_id: "854bc8ca129d8230e0e534041ab723c4efa9d650",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxJrEJsO8JXpUy\nNHYqtgK3hY7AfO8LSfBLIMxRC8pMiYhL3DRZh1ziehFHin1tinsJg6KJ56sEYBwR\n8VXGRrm2i0o1USpLpk92jdBXoyxNqtyL3lx2eC2X/h0gjZvVdMdvhAb7UGNEog/A\nA14JIaWt6WEoX/cDx0AyFRlHaRvQJRx1GM1AC0yrH4jl99qo6toMdiaRlgs3BDbM\nOHC1F1o8jAMvrs0e4HRdermjpwvogo8l7/U8xErGfKiUxYnwS3DFctUKtRCyVoUd\npBlXfvYKhUfYgnS2FMxmHCopAHSH1Y7KUFbXotaXVA1xufMgH/wHfBF7gHP1zlXY\na3s6QyFnAgMBAAECggEAFKCLtrQqcS3ZM3pWVAzTbikYASPK9caLO0Q7Zih4Sscs\n3qBqXA5d62UJRApFJo8cWnRAZcxa5myGeDRgp3CuySmY33Ju+VYJJKXIn5u5WeXO\nPl8K5ySBMpR9McAraARsAHkgEv0+QcyZBuOdfHS1hPWKwZfC/Gaj+/Dm+6Cqg2bN\nOvs+b/HYUvrZ0FnP4WNb94EKKgrw6Bo1zNcdmYjUv0/B28euOxWDpkYEZF0lqbeH\n4ybWyR1bJ8L/ThkUNAKq9GM9Qu0EO2OzLjuOSJ5Ac7MkIP+npN2bNoVJjVgjlf+g\nvZdAmk8zuqoxGkHq5hiuOcU+VPnxQXXlABm78VecoQKBgQDYW7N9kZX7kaozu7Aa\nOYQGcq4tyTWq+skWErsfyJvSFyrW6znldsZ4g9RZEoWJ5HJvWhNV2oZyOMO06Th5\nZmLJPUvdVzlzPXqrVV2VUEvc/6cPhWnDKDlH9ZCpx49zxtd9d43XrpPQWtmkV92p\nRZ3gdPjveZ+9jrK0XqkhKiP09wKBgQDRm/rRXon5E7dCm1BdmQ8487AY4oGfgRD2\nSRM5fGLmClLPFpzknJpyFAiU41ZgrKHM2CY6RgYDl0dB7tWM5VRo5aRpuRwIhqy7\nJ+TxUdMVODzc5z+4nXtvXhxSs5NkLwVKAtEMvrhWLyEDvUTiStbFPWMGSjJb6XfN\nsPQZ4mDLEQKBgBZzxbelMQxPPHtr4cWG7HWC1yJ3O/OHXPDGdtbAibMOpmpxNKvk\nXIpLG/E2Y9dAdsOpdFI3gDZAP8b5YNvwTRYXH1VT5OlZmu5GyJRjJcxEV4Db1nLj\nLLaT/DQyOmfIXbpuerDENCCuHOHaIG2dhNmzKdYoJ/SS52aiYCjJ57tXAoGAR8bs\nCsoe4SY5ORvKV2LUbaI1CTB3RtGBp3S6mpLXowKh/Lw3malu0eW+Uo3OxGgZN/ZE\nkOvtn0ksY42PnyHg19LbjECRMvI7MBOnOGPWrouFe/fMQEHdRPOrKz7HGCVp4EA6\nqeydXxXgblFfx0XtabltsXey6vp1xf/0dvCoSKECgYAQcAr313+oHZ7v6Fi5xMOo\nc9qUJM4PXOx2NSYDf1XkoZjbE/tbsK/hQZJ9MbC6vZbRkf3XQvTuAI2P5BKqmTyN\nhdlg8rd1yCjv4PHEy/qQtsiTppJMzAeVx42glgJ5hdYV+c8HBME6WY1CxYa9srHh\nuolDkTj37O26eo8e5F24yA==\n-----END PRIVATE KEY-----\n",
        client_email: "nhl95-689@next-auth-testing-447315.iam.gserviceaccount.com",
        client_id: "101940305735240525140",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/nhl95-689%40next-auth-testing-447315.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
    }

    const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.spreadSheetId

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
  
  // const spreadsheetId = process.env.SPREADSHEET_ID
  
  const sheetsArgsObj = {
    sheets,
    spreadsheetId,
    romData
  }

  const infoForUpdatingStreak = {
    sheets,
    homeCoach : 'Puss',
    awayCoach : 'Heinz',
    homeTeamScore : 4,
    awayTeamScore : 5
}
  
  try {
    await appendGoogleSheetsData(sheetsArgsObj)
    await updateCoachesStreaks(infoForUpdatingStreak)
  } catch (error) {
      console.log('error in sending game data to google sheets')
  }
}

export default processGameState