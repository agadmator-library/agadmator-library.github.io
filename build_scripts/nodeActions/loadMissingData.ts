import {
    database,
    NAMESPACE_CHESS365,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_LICHESS_MASTERS
} from "../db.js";
import {chessComService} from "../chessCom/ChessComService.js";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";
import {chess365Service} from "../chess365/Chess365Service.js";
import {lichessMastersService} from "../lichessMasters/LichessMastersService.js";

async function loadMissingChessComInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const games = database.readDescriptionGames(id)
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
            const games = database.readDescriptionGames(id)
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

async function loadMissingChess365Info() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const games = database.readDescriptionGames(id)
            const game = games && games[0] ? games[0] : null
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_CHESS365, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        try {
            await chess365Service.loadInfoForId(id)
        } catch (e) {
            console.error(`Failed to download 365chess.com info for video ${id}: ${e}`)
        }
    }
}

async function loadMissingLichessMastersInfo() {
    let videosWithMissingInfo = database.getAllIds()
        .filter(id => {
            const games = database.readDescriptionGames(id)
            const game = games && games[0] ? games[0] : null
            return game && game.fen && game.playerWhite && game.playerBlack && !database.read(NAMESPACE_LICHESS_MASTERS, id)
        })
        .slice(0, 10);

    for (const id of videosWithMissingInfo) {
        try {
            await lichessMastersService.loadInfoForId(id)
        } catch (e) {
            console.error(`Failed to download lichess masters info for video ${id}: ${e}`)
        }
    }
}

await Promise.all([loadMissingChessComInfo(), loadMissingChesstempoInfo(), loadMissingChess365Info(), loadMissingLichessMastersInfo()])
