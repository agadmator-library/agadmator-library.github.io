import {loadNewMovies} from "../loadNewMovies.js";
import {chessComService} from "../chessCom/ChessComService.js";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";
import {extractPgnForId} from "../extractPGN.js";
import {combine} from "../combine.js";

async function loadNewVideos() {
    const newIds = await loadNewMovies();

    if (newIds.length === 0) {
        return 0
    }

    for (const id of newIds) {
        extractPgnForId(id)

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
    }

    combine()
}

await loadNewVideos();

