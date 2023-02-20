import {database, NAMESPACE_CHESS_COM, NAMESPACE_CHESSTEMPO_COM, NAMESPACE_VIDEO_GAME} from "../db.js";
import {chessComService} from "../loadChessComInfo.js";
import {loadChesstempoInfoForId} from "../loadChesstempoInfo.js";
import {combine} from "../combine.js";

async function loadMissingChessComInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const game = database.read(NAMESPACE_VIDEO_GAME, id)
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_CHESS_COM, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        console.log(id)
        try {
            await chessComService.loadChessComInfoForId(id)
        } catch (e) {
            console.error(`Failed to download chess.com info for video ${id}: ${e}`)
        }
    }
}

async function loadMissingChesstempoInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const game = database.read(NAMESPACE_VIDEO_GAME, id)
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_CHESSTEMPO_COM, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        console.log(id)
        try {
            await loadChesstempoInfoForId(id)
        } catch (e) {
            console.error(`Failed to download chesstempo.com info for video ${id}: ${e}`)
        }
    }
}

await Promise.all([loadMissingChessComInfo(), loadMissingChesstempoInfo()])

combine()
