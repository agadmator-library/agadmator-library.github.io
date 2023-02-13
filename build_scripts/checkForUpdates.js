import {loadNewMovies} from "./loadNewMovies.js";
import {loadInfoFromChessComForId} from "./loadGameInfoFromChessCom.js";
import {loadInfoFromChesstempoForId} from "./loadGameInfoFromChessTempo.js";
import {extractPgnForId} from "./extractPGN.js";
import {combine} from "./combine.js";

async function checkForUpdates() {
    const newIds = await loadNewMovies();

    if (newIds.length === 0) {
        return 0
    }

    for (const id of newIds) {
        extractPgnForId(id)
        await loadInfoFromChessComForId(id)
        await loadInfoFromChesstempoForId(id)
    }

    combine()
}

await checkForUpdates();

