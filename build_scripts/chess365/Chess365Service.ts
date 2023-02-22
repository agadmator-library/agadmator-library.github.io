import {database, NAMESPACE_CHESS365} from "../db.js";
import _ from "lodash";
import cleanPlayerName from "../players/playerNameCleaner.js";
import {chess365Client} from "./Chess365Client.js";
import {testIfSamePlayers, testIfSimilarPlayers} from "../BaseGame.js";

class Chess365Service {

    public async loadInfoForId(id: string, force: boolean = false) {
        if (!database.read(NAMESPACE_CHESS365, id) || force) {
            const games = database.readVideoGames(id);
            const game = games && games[0] ? games[0] : null

            if (!game || !game.fen || !game.playerWhite || !game.playerBlack) {
                return;
            }
            console.log(`Chess365Service: ${id} searching for games`)

            let chess365Games = await chess365Client.fetchGames(game.fen)
            chess365Games = _.uniqBy(chess365Games, chess365Game => {
                const playerWhite = cleanPlayerName(chess365Game.playerWhite)
                const playerBlack = cleanPlayerName(chess365Game.playerBlack)
                return `${playerWhite}|${playerBlack}|${chess365Game.movesCount}`
            })
            chess365Games = chess365Games.filter(chess365Game => testIfSimilarPlayers(chess365Game, game))
            if (chess365Games.length > 1) {
                chess365Games = chess365Games.filter(chess365Game => testIfSamePlayers(chess365Game, game))
            }

            if (chess365Games.length === 0) {
                console.log(`Chess365Service: ${id} Game not found`)
                database.save(NAMESPACE_CHESS365, id, {
                    reason: "NOT_FOUND",
                    retrievedAt: new Date().toISOString(),
                })
                return;
            } else if (chess365Games.length > 1) {
                console.log(`Chess365Service: ${id} More than one game found`)
                database.save(NAMESPACE_CHESS365, id, {
                    reason: "AMBIGUOUS",
                    retrievedAt: new Date().toISOString(),
                })
                return;
            } else {
                database.save(NAMESPACE_CHESS365, id, chess365Games[0])
            }
        }
    }
}

export const chess365Service = new Chess365Service()
