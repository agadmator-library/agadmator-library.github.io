import {dbGetAllIds, dbRead, NAMESPACE_CHESS_COM, NAMESPACE_CHESSTEMPO_COM, NAMESPACE_VIDEO_GAME} from "../db.js";
import {loadChessComInfoForId} from "../loadChessComInfo.js";
import {loadChesstempoInfoForId} from "../loadChesstempoInfo.js";
import {combine} from "../combine.js";

async function loadMissingChessComInfo() {
    let videosWithMissingInfo = dbGetAllIds()
        .filter(id => {
            const game = dbRead(NAMESPACE_VIDEO_GAME, id)
            return game && game.fen && game.playerWhite && game.playerBlack && !dbRead(NAMESPACE_CHESS_COM, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        console.log(id)
        try {
            await loadChessComInfoForId(id)
        } catch (e) {
            console.error(`Failed to download chess.com info for video ${id}: ${e}`)
        }
    }
}

async function loadMissingChesstempoInfo() {
    let videosWithMissingInfo = dbGetAllIds()
        .filter(id => {
            const game = dbRead(NAMESPACE_VIDEO_GAME, id)
            return game && game.fen && game.playerWhite && game.playerBlack && !dbRead(NAMESPACE_CHESSTEMPO_COM, id)
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
