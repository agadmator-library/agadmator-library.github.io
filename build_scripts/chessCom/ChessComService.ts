import {database, NAMESPACE_CHESS_COM} from "../db.js";
import {chessComClient} from "./ChessComClient.js";
import _ from "lodash";
import cleanPlayerName from "../players/playerNameCleaner.js";
import {testIfSamePlayers, testIfSimilarPlayers} from "../BaseGame.js";


class ChessComService {
    public async loadInfoForId(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_CHESS_COM, id) || force) {
            const games = database.readDescriptionGames(id);
            const game = games && games[0] ? games[0] : null

            if (!game || !game.fen || !game.playerWhite || !game.playerBlack) {
                return;
            }
            console.log(`ChessComService: ${id} searching for games`)

            let chessComGames = await chessComClient.fetchGames(game.fen)
            chessComGames = _.uniqBy(chessComGames, chessComGame => {
                const playerWhite = cleanPlayerName(chessComGame.playerWhite)
                const playerBlack = cleanPlayerName(chessComGame.playerBlack)
                return `${playerWhite}|${playerBlack}|${chessComGame.movesCount}`
            })
            chessComGames = chessComGames.filter(chessComGame => testIfSimilarPlayers(chessComGame, game))
            if (chessComGames.length > 1) {
                chessComGames = chessComGames.filter(chessComGame => testIfSamePlayers(chessComGame, game))
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
