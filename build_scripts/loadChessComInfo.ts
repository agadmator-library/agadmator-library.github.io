import {database, NAMESPACE_CHESS_COM, NAMESPACE_VIDEO_GAME} from "./db.js";
import {chessComClient} from "./ChessComClient.js";
import _ from "lodash";
import cleanPlayerName from "./playerNameCleaner.js";
import {levenshteinEditDistance} from "levenshtein-edit-distance";


class ChessComService {
    public async loadChessComInfoForId(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_CHESS_COM, id) || force) {
            const game = database.read(NAMESPACE_VIDEO_GAME, id)

            if (!game || !game.fen || !game.playerWhite || !game.playerBlack) {
                return;
            }
            console.log(`ChessComService: ${id} searching for games`)

            let chessComGames = await chessComClient.fetchGames(game.fen)
            console.log(game)
            console.log(chessComGames)
            chessComGames = _.uniqBy(chessComGames, chessComGame => {
                const playerWhite = cleanPlayerName(chessComGame.playerWhite)
                const playerBlack = cleanPlayerName(chessComGame.playerBlack)
                return `${playerWhite}|${playerBlack}|${game.movesCount}`
            })
            chessComGames = chessComGames.filter(chessComGame => {
                const wArray = cleanPlayerName(chessComGame.playerWhite).split(" ").sort()
                const bArray = cleanPlayerName(chessComGame.playerBlack).split(" ").sort()
                const gameWArray = game.playerWhite.split(" ").sort()
                const gameBArray = game.playerBlack.split(" ").sort()
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
            if (chessComGames.length > 1) {
                chessComGames = chessComGames.filter(chessComGame =>
                    cleanPlayerName(chessComGame.playerWhite) === game.playerWhite
                    && cleanPlayerName(chessComGame.playerBlack) === game.playerBlack
                )
            }

            if (chessComGames.length === 0) {
                console.log(`ChessComService: ${id} Game not found`)
                database.save(NAMESPACE_CHESS_COM, id, {
                    reason: "NOT_FOUND",
                    retrievedAt: new Date().toISOString(),
                })
                return;
            } else if (chessComGames.length > 1) {
                console.log(`ChessComService: ${id} More than one game found`)
                database.save(NAMESPACE_CHESS_COM, id, {
                    reason: "AMBIGUOUS",
                    retrievedAt: new Date().toISOString(),
                })
                return;
            } else {
                database.save(NAMESPACE_CHESS_COM, id, chessComGames[0])
            }
        }
    }
}

export const chessComService = new ChessComService()
