import {loadNewMovies} from "./loadNewMovies.js";
import {loadChessComInfoForId} from "./loadChessComInfo.js";
import {loadChesstempoInfoForId} from "./loadChesstempoInfo.js";
import {extractPgnForId} from "./extractPGN.js";
import {combine} from "./combine.js";

async function checkForUpdates() {
    const newIds = await loadNewMovies();

    if (newIds.length === 0) {
        return 0
    }

    for (const id of newIds) {
        extractPgnForId(id)

        try {
            await loadChessComInfoForId(id)
        } catch (e) {
            console.error(`Error loading chess.com info: ${e}`)
        }

        try {
            await loadChesstempoInfoForId(id)
        } catch (e) {
            console.error(`Error loading chesstempo.com info: ${e}`)
        }
    }

    combine()
}

await checkForUpdates();

