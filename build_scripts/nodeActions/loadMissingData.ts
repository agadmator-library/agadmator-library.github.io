import {database, NAMESPACE_CHESS_COM, NAMESPACE_CHESSTEMPO_COM} from "../db.js";
import {chessComService} from "../chessCom/ChessComService.js";
import {combine} from "../combine.js";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";

async function loadMissingChessComInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const games = database.readVideoGames(id)
            const game = games && games[0] ? games[0] : null
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_CHESS_COM, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        try {
            await chessComService.loadInfoForId(id)
        } catch (e) {
            console.error(`Failed to download chess.com info for video ${id}: ${e}`)
        }
    }
}

async function loadMissingChesstempoInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const games = database.readVideoGames(id)
            const game = games && games[0] ? games[0] : null
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_CHESSTEMPO_COM, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        try {
            await chesstempoService.loadInfoForId(id)
        } catch (e) {
            console.error(`Failed to download chesstempo.com info for video ${id}: ${e}`)
        }
    }
}

await Promise.all([loadMissingChessComInfo(), loadMissingChesstempoInfo()])

combine()
