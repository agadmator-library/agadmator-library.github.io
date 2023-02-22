import {chessComService} from "../chessCom/ChessComService.js";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";
import {extractPgnForId} from "../extractPGN.js";
import {combine} from "../combine.js";
import {database, NAMESPACE_VIDEO_SNIPPET} from "../db.js";
import {chess365Service} from "../chess365/Chess365Service.js";
import {lichessMastersService} from "../lichessMasters/LichessMastersService.js";

async function refreshVideo() {
    let videoId: string | null | undefined = process.env.VIDEO_ID

    if (videoId && videoId.indexOf("/") >= 0) {
        const url = new URL(videoId);
        videoId = url.searchParams.get("v")
    }

    if (!videoId) {
        throw `VIDEO_ID missing`
    }

    const videoSnippet = database.read(NAMESPACE_VIDEO_SNIPPET, videoId);

    if (!videoSnippet) {
        throw `Video not found: ${videoId}`
    }

    extractPgnForId(videoId)
    await chessComService.loadInfoForId(videoId, true)
    await chesstempoService.loadInfoForId(videoId, true)
    await chess365Service.loadInfoForId(videoId, true)
    await lichessMastersService.loadInfoForId(videoId, true)

    combine()
}

await refreshVideo();

