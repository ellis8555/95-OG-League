////////////////
// required vars
////////////////

// sheet params
const raw_standings_col_start = "A"
const streak_col = "G"

export default async function updateCoachesStreaks({sheets, homeCoach, awayCoach, homeTeamScore, awayTeamScore}){

    ////////////////////////
    // begin fetching streak
    ////////////////////////

    // get correct rows in standings sheet to update a teams streak
    const range = `RawStandings!${raw_standings_col_start}:${streak_col}`

    const managers_res = await sheets.spreadsheets.values.get({ // this gets every row in RawSchedule
        spreadsheetId,
        range,
    })

    if(managers_res.status !== 200 || managers_res.statusText !== "OK"){
        throw new Error("Error in reading standings sheet in order to get coaches row")
    }

    const rawStandingsData = managers_res.data.values
    let homeCoachesRawStandings
    let awayCoachesRawStandings
    let homeCoachFound = false
    let awayCoachFound = false

    for(let i = 0; i < rawStandingsData.length; i++){
        if(rawStandingsData[i][0] === homeCoach){
            homeCoachesRawStandings = i+1;
            homeCoachFound = true
        }
        if(rawStandingsData[i][0] === awayCoach){
            awayCoachesRawStandings = i+1;
            awayCoachFound = true
        }
        if(homeCoachFound && awayCoachFound){
            break
        }
    }

    if(!homeCoachFound){
        throw new Error("Home teams coach not found.")
    }
    if(!awayCoachFound){
        throw new Error("Away teams coach not found.")
    }

    const previousHomeCoachesStreak = rawStandingsData[homeCoachesRawStandings-1][6]
    const previousAwayCoachesStreak = rawStandingsData[awayCoachesRawStandings-1][6]

    // assign coaches name which will be used for updating streak column further down
    // these are assigned in upcoming coaches forEach loop
    let homeTeamResult
    let awayTeamResult
    let updatedHomeCoachesStreak
    let updatedAwayCoachesStreak

    // update each teams streak
    // assign result status to each team
    if(+homeTeamScore > +awayTeamScore){
        homeTeamResult = "W";
        awayTeamResult = "L";
    } else if (+homeTeamScore < +awayTeamScore){
        homeTeamResult = "L";
        awayTeamResult = "W";
    } else {
        homeTeamResult = "T";
        awayTeamResult = "T";
    }

    // set home teams streak
    if(previousHomeCoachesStreak === "-" || !previousHomeCoachesStreak){
        updatedHomeCoachesStreak = "1" + homeTeamResult
    } else {
        const currentHomeStreak = previousHomeCoachesStreak
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
            updatedHomeCoachesStreak = updatedStreakLength.toString() + updatedStreaktype
    }

    // set away teams streak
    if(previousAwayCoachesStreak === "-"|| !previousAwayCoachesStreak){
        updatedAwayCoachesStreak = "1" + awayTeamResult
    } else {
        const currentAwayStreak = previousAwayCoachesStreak
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
            updatedAwayCoachesStreak = updatedStreakLength.toString() + updatedStreaktype
    }

    // each managers temp object with streak and row number in sheets create and send updated data
    const updateStreakRequests = []
    let indexNum = 0
    const streaksArray = [updatedHomeCoachesStreak, updatedAwayCoachesStreak]
    const teamsIndex = [homeCoachesRawStandings, awayCoachesRawStandings]
    streaksArray.forEach(streak => {
        updateStreakRequests.push({
            range: `RawStandings!${streak_col}${teamsIndex[indexNum]}`,
            values: [
                [streak], // Update only streak column (streak_col variable) in RawStandings
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
}