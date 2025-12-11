////////////////////////////////
// sheet range params for streak
////////////////////////////////

const raw_standings_col_start = "A"
const streak_col = "G"

//////////////
// google auth
//////////////

const raw = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const credentials = { ...raw, private_key: raw.private_key.replace(/\\n/g, '\n') };
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.SPREADSHEET_ID

////////////////////////
// begin fetching streak
////////////////////////

// get correct rows in standings sheet to update a teams streak
range = `RawStandings!${raw_standings_col_start}:${streak_col}`

const managers_res = await sheets.spreadsheets.values.get({ // this gets every row in RawSchedule
    spreadsheetId,
    range,
})

if(managers_res.status !== 200 || managers_res.statusText !== "OK"){
    throw new Error("Error in reading standings sheet in order to get coaches row")
}

const rawStandingsData = managers_res.data.values
let homeTeamsRawStandingsIndex
let awayTeamsRawStandingsIndex
let homeIndexFound = false
let awayIndexFound = false

for(let i = 0; i < rawStandingsData.length; i++){
    if(rawStandingsData[i][0] === currentSeason && rawStandingsData[i][3] === homeTeam){
        homeTeamsRawStandingsIndex = i+1;
        homeIndexFound = true
    }
    if(rawStandingsData[i][0] === currentSeason && rawStandingsData[i][3] === awayTeam){
        awayTeamsRawStandingsIndex = i+1;
        awayIndexFound = true
    }
    if(homeIndexFound && awayIndexFound){
        break
    }
}

const previousHomeStreak = rawStandingsData[homeTeamsRawStandingsIndex-1][8]
const previousAwayStreak = rawStandingsData[awayTeamsRawStandingsIndex-1][8]


// assign coaches name which will be used for updating streak column further down
// these are assigned in upcoming coaches forEach loop
let updatedHomeStreak
let updatedAwayStreak

// update each teams streak

// set home teams streak
if(previousHomeStreak === "-" || !previousHomeStreak){
    updatedHomeStreak = "1" + homeTeamResult
} else {
    const currentHomeStreak = previousHomeStreak
    const lengthOfStreakString = currentHomeStreak.length
        let previousStreakLength;
        let previousStreakType;
        let updatedStreakLength;
        let updatedStreaktype;
        //extract streakLength and streak type from previously set streak
        // if streak is single digit
        if(lengthOfStreakString === 2){
            previousStreakLength = currentHomeStreak.charAt(0);
            previousStreakType = currentHomeStreak.charAt(1)
        }
        // if streak is in double digits
        if(lengthOfStreakString === 3){
            previousStreakLength = currentHomeStreak.charAt(0) + currentHomeStreak.charAt(1)
            previousStreakType = currentHomeStreak.charAt(2)
        }
        // begin setting new streak strings
        if(homeTeamResult === "W"){
            if(previousStreakType === "W"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "W"
        }
        if(homeTeamResult === "L"){
            if(previousStreakType === "L"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "L"
        }
        if(homeTeamResult === "T"){
            if(previousStreakType === "T"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "T"
        }
        updatedHomeStreak = updatedStreakLength.toString() + updatedStreaktype
}

// set away teams streak
if(previousAwayStreak === "-"|| !previousAwayStreak){
    updatedAwayStreak = "1" + awayTeamResult
} else {
    const currentAwayStreak = previousAwayStreak
    const lengthOfStreakString = currentAwayStreak.length
        let previousStreakLength;
        let previousStreakType;
        let updatedStreakLength;
        let updatedStreaktype;
        //extract streakLength and streak type from previously set streak
        // if streak is single digit
        if(lengthOfStreakString === 2){
            previousStreakLength = currentAwayStreak.charAt(0);
            previousStreakType = currentAwayStreak.charAt(1)
        }
        // if streak is in double digits
        if(lengthOfStreakString === 3){
            previousStreakLength = currentAwayStreak.charAt(0) + currentAwayStreak.charAt(1)
            previousStreakType = currentAwayStreak.charAt(2)
        }
        // begin setting new streak strings
        if(awayTeamResult === "W"){
            if(previousStreakType === "W"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "W"
        }
        if(awayTeamResult === "L"){
            if(previousStreakType === "L"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "L"
        }
        if(awayTeamResult === "T"){
            if(previousStreakType === "T"){
                updatedStreakLength = +previousStreakLength + 1
            } else {
                updatedStreakLength = 1
            }
            updatedStreaktype = "T"
        }
        updatedAwayStreak = updatedStreakLength.toString() + updatedStreaktype
}

// each managers temp object with streak and row number in sheets create and send updated data
const updateStreakRequests = []
let indexNum = 0
const streaksArray = [updatedHomeStreak, updatedAwayStreak]
const teamsIndex = [homeTeamsRawStandingsIndex, awayTeamsRawStandingsIndex]
streaksArray.forEach(streak => {
    updateStreakRequests.push({
        range: `RawStandings!${streak_col}${teamsIndex[indexNum]}`,
        values: [
            [streak], // Update only streak column I in RawStandings
        ]
    })
    ++indexNum
})

await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
        data: updateStreakRequests,
        valueInputOption: "RAW", // Use "RAW" or "USER_ENTERED"
    },
})