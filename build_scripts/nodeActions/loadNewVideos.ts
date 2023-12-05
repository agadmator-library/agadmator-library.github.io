import {loadNewMovies} from "../loadNewMovies.js";
import {chessComService} from "../chessCom/ChessComService.js";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";
import {chess365Service} from "../chess365/Chess365Service.js";
import {extractPgnForId} from "../extractPGN.js";
import {lichessMastersService} from "../lichessMasters/LichessMastersService.js";
import {stockfishService} from "../stockfish/StockfishService.js";
import {lichessService} from "../lichess/LichessService.js";

async function loadNewVideos() {
    const newIds = await loadNewMovies();

    if (newIds.length === 0) {
        return 0
    }

    for (const id of newIds) {
        await extractPgnForId(id)

        try {
            await chessComService.loadInfoForId(id)
        } catch (e) {
            console.error(`Error loading chess.com info: ${e}`)
        }

        try {
            await chesstempoService.loadInfoForId(id)
        } catch (e) {
            console.error(`Error loading chesstempo.com info: ${e}`)
        }

        try {
            await chess365Service.loadInfoForId(id)
        } catch (e) {
            console.error(`Error loading 365chess.com info: ${e}`)
        }

        try {
            await lichessMastersService.loadInfoForId(id)
        } catch (e) {
            console.error(`Error loading lichess masters info: ${e}`)
        }

        try {
            await lichessService.importGames(id)
        } catch (e) {
            console.error(`Error importing lichess game: ${e}`)
        }
    }

    await stockfishService.evaluate(newIds)
}

await loadNewVideos();

