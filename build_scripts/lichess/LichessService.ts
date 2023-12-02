import {database, NAMESPACE_LICHESS_GAME_EVAL, NAMESPACE_LICHESS_GAME_ID} from "../db.js";
import {ImportGameOutResponse, lichessClient} from "./LichessClient.js";

class LichessService {
    public async importGames(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_LICHESS_GAME_ID, id) || force) {
            const games = database.readDescriptionGames(id);
            if (games.length === 0) {
                return
            }

            const lichessGamesIds = []
            for (let game of games) {
                if (game.pgn) {
                    lichessGamesIds.push(await lichessClient.importGame(game.pgn))
                } else {
                    lichessGamesIds.push({})
                }
            }

            database.save(NAMESPACE_LICHESS_GAME_ID, id, lichessGamesIds)
        }
    }

    public async exportGames(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_LICHESS_GAME_EVAL, id) || force) {
            const gamesIds = database.read(NAMESPACE_LICHESS_GAME_ID, id) as ImportGameOutResponse[]
            const gamesEvals = []
            for (let gameId of gamesIds) {
                if (gameId.id) {
                    gamesEvals.push(await lichessClient.exportGame(gameId.id))
                } else {
                    gamesEvals.push({})
                }
            }

            database.save(NAMESPACE_LICHESS_GAME_EVAL, id, gamesEvals)
        }
    }
}

export const lichessService = new LichessService()
