import _ from "lodash";
import {database, NAMESPACE_CHESSTEMPO_COM} from "../db.js";
import {chesstempoClient} from "./ChesstempoClient.js";
import {testIfSamePlayers, testIfSimilarPlayers} from "../BaseGame.js";

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
            chesstempoGames = chesstempoGames.filter(chesstempoGame => testIfSimilarPlayers(chesstempoGame, game))

            if (chesstempoGames.length > 1) {
                chesstempoGames = chesstempoGames.filter(chesstempoGame => testIfSamePlayers(chesstempoGame, game))
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
