import axios from 'axios';
import cleanPlayerName from "./playerNameCleaner.js";
import _ from "lodash";
import {dbRead, dbSave, NAMESPACE_CHESSTEMPO_COM, NAMESPACE_VIDEO_GAME} from "./db.js";

export async function loadChesstempoInfoForId(id, force) {
    if (!dbRead(NAMESPACE_CHESSTEMPO_COM, id) || force) {
        const game = dbRead(NAMESPACE_VIDEO_GAME, id)

        if (!game || !game.fen) {
            return;
        }

        const requestBody = {
            startIndex: "0",
            results: "50",
            currentFen: game.fen,
            sort: "date",
            dir: "desc",
            pieceColour: "either",
            gameResult: "any",
            subsetMinRating: "all",
            gamesForPos: "1"
        }

        const responseBody = await axios.postForm('https://old.chesstempo.com/requests/gameslist.php', requestBody,
            {
                timeout: 15000,
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            })
            .then(res => {
                if (res.status !== 200) {
                    throw "Fail " + res.status + " " + res.statusText
                }
                return res.data
            })

        let foundGame = null

        if (responseBody.result.total_games === 0) {
            console.log(`${id} Game not found`)
            dbSave(NAMESPACE_CHESSTEMPO_COM, id, {
                reason: "NOT_FOUND",
                retrievedAt: new Date().toISOString(),
            })
            return;
        } else if (responseBody.result.total_games > 1) {

            let uniqueGames = _.uniqBy(responseBody.result.games, game => game.game_id);

            if (uniqueGames.length === 1 && responseBody.result.total_games < 50) {
                foundGame = uniqueGames[0]
            } else {
                let resultsForPlayers = uniqueGames
                    .filter(gameFromResponse => {
                        return gameFromResponse.white && gameFromResponse.black && game.playerWhite === cleanPlayerName(gameFromResponse.white) && game.playerBlack === cleanPlayerName(gameFromResponse.black)
                    })

                if (responseBody.result.total_games < 50 && resultsForPlayers.length === 1) {
                    foundGame = resultsForPlayers[0]
                } else {
                    console.log(`${id} More than one game found`)
                    dbSave(NAMESPACE_CHESSTEMPO_COM, id, {
                        reason: "AMBIGUOUS",
                        retrievedAt: new Date().toISOString(),
                    })
                    return;
                }
            }
        } else {
            foundGame = responseBody.result.games[0]
        }

        const chessTempoEntry = {
            retrievedAt: new Date().toISOString(),
            id: foundGame.game_id,
            playerWhite: foundGame.white,
            playerBlack: foundGame.black,
            result: foundGame.result,
            movesCount: foundGame.num_moves,
            date: foundGame.date,
            site: foundGame.site,
            event: foundGame.event,
            round: foundGame.round,
            eco: foundGame.eco,
            openingName: foundGame.opening_name
        }

        dbSave(NAMESPACE_CHESSTEMPO_COM, id, chessTempoEntry)
    }
}
