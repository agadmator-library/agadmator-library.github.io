import cleanPlayerName from "../players/playerNameCleaner.js";
import _ from "lodash";
import {database, NAMESPACE_CHESSTEMPO_COM} from "../db.js";
import {chesstempoClient} from "./ChesstempoClient.js";
import {levenshteinEditDistance} from "levenshtein-edit-distance";

class ChesstempoService {
    public async loadInfoForId(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_CHESSTEMPO_COM, id) || force) {
            const games = database.readVideoGames(id);
            const game = games && games[0] ? games[0] : null

            if (!game || !game.fen) {
                return;
            }

            const chesstempoResponse = await chesstempoClient.fetch(game);

            let chesstempoGames = _.uniqBy(chesstempoResponse.games, (game: any) => game.game_id);
            chesstempoGames = chesstempoGames.filter(chesstempoGame => {
                const wArray = cleanPlayerName(chesstempoGame.playerWhite).split(" ").sort()
                const bArray = cleanPlayerName(chesstempoGame.playerBlack).split(" ").sort()
                const gameWArray = game.playerWhite ? game.playerWhite.split(" ").sort() : []
                const gameBArray = game.playerBlack ? game.playerBlack.split(" ").sort() : []
                const w = wArray.join(" ")
                const b = bArray.join(" ")
                const gameW = gameWArray.join(" ")
                const gameB = gameBArray.join(" ")

                const matchWhite = _.intersection(wArray, gameWArray).length === Math.min(wArray.length, gameWArray.length)
                    || levenshteinEditDistance(gameW, w) < Math.max(w.length, gameW.length) * 0.3
                const matchBlack = _.intersection(bArray, gameBArray).length === Math.min(bArray.length, gameBArray.length)
                    || levenshteinEditDistance(gameB, b) < Math.max(b.length, gameB.length) * 0.3
                return matchWhite || matchBlack
            })

            if (chesstempoGames.length > 1) {
                chesstempoGames = chesstempoGames.filter(chesstempoGame =>
                    cleanPlayerName(chesstempoGame.playerWhite) === game.playerWhite
                    && cleanPlayerName(chesstempoGame.playerBlack) === game.playerBlack
                )
            }

            if (chesstempoGames.length === 0) {
                console.log(`ChesstempoService: ${id} Game not found`)
                database.save(NAMESPACE_CHESSTEMPO_COM, id, {
                    reason: "NOT_FOUND",
                    retrievedAt: new Date(),
                })
            } else if (chesstempoGames.length > 1 || chesstempoResponse.totalResults > 50) {
                console.log(`ChesstempoService: ${id} More than one game found`)
                database.save(NAMESPACE_CHESSTEMPO_COM, id, {
                    reason: "AMBIGUOUS",
                    retrievedAt: new Date(),
                })
            } else {
                database.save(NAMESPACE_CHESSTEMPO_COM, id, chesstempoGames[0])
            }
        }
    }
}

export const chesstempoService = new ChesstempoService()
