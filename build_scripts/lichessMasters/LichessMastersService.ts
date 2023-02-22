import {
    database,
    NAMESPACE_CHESS365,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_LICHESS_MASTERS
} from "../db.js";
import _ from "lodash";
import {testIfSamePlayers, testIfSimilarPlayers} from "../BaseGame.js";
import {lichessMasterClient} from "./LichessMastersClient.js";

class LichessMastersService {
    public async loadInfoForId(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_LICHESS_MASTERS, id) || force) {
            const games = database.readVideoGames(id);
            const game = games && games[0] ? games[0] : null

            if (!game || !game.fen) {
                return;
            }
            console.log(`LichessMastersService: ${id} searching for games`)


            const lichessMastersResponse = await lichessMasterClient.fetchGames(game.fen);

            let lichessMastersGames = _.uniqBy(lichessMastersResponse.games, (game: any) => game.game_id);
            lichessMastersGames = lichessMastersGames.filter(lichessGame => testIfSimilarPlayers(lichessGame, game))

            if (lichessMastersGames.length > 1) {
                lichessMastersGames = lichessMastersGames.filter(lichessGame => testIfSamePlayers(lichessGame, game))
            }

            if (lichessMastersGames.length === 0) {
                console.log(`LichessMastersService: ${id} Game not found`)
                database.save(NAMESPACE_LICHESS_MASTERS, id, {
                    reason: "NOT_FOUND",
                    retrievedAt: new Date(),
                })
            } else if (lichessMastersGames.length > 1 || lichessMastersResponse.total > 50) {
                console.log(`LichessMastersService: ${id} More than one game found`)
                database.save(NAMESPACE_LICHESS_MASTERS, id, {
                    reason: "AMBIGUOUS",
                    retrievedAt: new Date(),
                })
            } else {
                database.save(NAMESPACE_LICHESS_MASTERS, id, lichessMastersGames[0])
            }
        }
    }
}

export const lichessMastersService = new LichessMastersService()
