import cleanPlayerName from "./playerNameCleaner.js";
import getPlayersForId from "./playersOverrides.js";

function isValidPlayerName(name) {
    return name
        && name !== "?"
}

export function extractPlayersFromDescription(id, description) {
    let players = extractFromWhiteAndBlackPgnNotes(description)
    const searchAboveRegExp = [
        /\s+[pP][gG][nN]\s+(.*article.*)?[hH][eE][rR][eE]\s+http|Click here for pgn/,
        /\s+\[FEN\s+".*"]/,
        new RegExp("https://chess24\.com/en/watch/live-tournaments/"),
        /GAME here /
    ]
    searchAboveRegExp.forEach(regExp => {
        if (!players) {
            const match = description.match(regExp)
            if (match) {
                players = extractPlayers(id, description, match[0])
            }
        }
    })

    return players
}

function extractFromWhiteAndBlackPgnNotes(description) {
    const regex = /\[[wW]hite\s+"(?<playerWhite>.*)"]\s*\[[bB]lack\s+"(?<playerBlack>.*)"]/
    const match = description.match(regex)

    if (match && match.groups && isValidPlayerName(match.groups.playerWhite) && isValidPlayerName(match.groups.playerBlack)) {
        return {
            white: cleanPlayerName(match.groups.playerWhite),
            black: cleanPlayerName(match.groups.playerBlack)
        }
    }
    return null
}

export function extractPlayers(id, description, pgn) {
    let players = getPlayersForId(id)
    if (!players && !pgn) {
        players = extractPlayersFromDescription(id, description)
    }

    if (!players) {
        let linesBeforePgn = description.substring(0, description.indexOf(pgn)).split("\n")
            .slice(-5)
            .filter(value => value.indexOf("You are awesome") < 0)
            .filter(value => value.indexOf("URS-ch sf ") < 0)
            .filter(value => value.indexOf("Buy ") < 0 && value.indexOf("book here") < 0)
            .filter(value => value.indexOf("Also, check out ") < 0)
            .filter(value => value.indexOf(" game I mention") < 0)
            .filter(value => value.indexOf("Caro-Kann,") < 0)
            .filter(value => value.indexOf("Nimzo-Indian,") < 0)
            .filter(value => value.indexOf("Watch  Impressions here") < 0)
            .filter(value => value.indexOf("Challenge Luka on Lichess") < 0)
            .filter(value => value.indexOf("Candidate's Legendary game here") < 0)
            .filter(value => value.indexOf("Check out") < 0)
            .filter(value => value.indexOf("Game 3 here") < 0)
            .filter(value => value.indexOf("Photo of ") < 0)
            .filter(value => value.indexOf("Photo on ") < 0)
            .filter(value => value.indexOf("LIVE here") < 0)
            .filter(value => value.indexOf("game 4 here") < 0)
            .filter(value => value.indexOf("game from this ") < 0)
            .filter(value => value.indexOf("Tata Steel Masters , Wijk aan Zee NED") < 0)
            .filter(value => value.indexOf("Lichess Titled Arena") < 0)
            .filter(value => value.indexOf("the games from Morphy") < 0)
            .filter(value => value.indexOf("Watch ") <= 0)
            .filter(value => !/Watch.*vs.*here/g.test(value))
            .filter(value => !/Link.*to.*game/g.test(value))
            .filter(value => !/\[FEN\s/g.test(value))
            .filter(value => !/1\. e4/g.test(value))
            .map(value => value
                .replaceAll(/\(\d+\)/g, "") // player rankings
                .replaceAll(/\d{3,4}/g, "") // date
                .replaceAll(/\d-\d/g, "") // result
                .replaceAll("1//2", "")
                .replaceAll("#agadmator ", "")
                .replaceAll(/https?:\S+/g, "") // urls
                .replaceAll("Live Chess (Chess.com) ", "")
                .replaceAll(". Partida Fnal. Got Talent España", "")
                .replaceAll(/Game \d+: /g, "")
                .replaceAll(/Round\s+\d+/g, "")
                .replaceAll("\r", "")
                .replaceAll("vs. ", "vs ")
                .replaceAll("vsWei", "vs Wei")
                .replaceAll("vsMagnus", "vs Magnus")
            )
            .filter(value => /.+( - |\svs\s|\sVS\s).+/.test(value))
            .filter(value => value.length < 70)

        if (linesBeforePgn[0]) {
            const splitted = linesBeforePgn[0].split(/ - |\svs\s|\sVS\s/g);
            players = {
                white: cleanPlayerName(splitted[0]),
                black: cleanPlayerName(splitted[1])
            }
        } else {
            console.error(`Failed to extract player names for ${id}`)
            console.error(description.substring(0, description.indexOf(pgn)).split("\n")
                .filter(value => value !== "")
                .slice(-5))
        }
    }

    return players
}
