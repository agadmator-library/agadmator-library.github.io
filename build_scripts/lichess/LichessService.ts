import {database, NAMESPACE_LICHESS_GAME_ID} from "../db.js";
import {lichessClient} from "./LichessClient.js";

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
}

export const lichessService = new LichessService()
