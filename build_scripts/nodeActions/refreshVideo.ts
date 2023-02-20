import {chessComService} from "../loadChessComInfo.js";
import {loadChesstempoInfoForId} from "../loadChesstempoInfo.js";
import {extractPgnForId} from "../extractPGN.js";
import {combine} from "../combine.js";
import {database, NAMESPACE_VIDEO_SNIPPET} from "../db.js";

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
    await chessComService.loadChessComInfoForId(videoId, true)
    await loadChesstempoInfoForId(videoId, true)

    combine()
}

await refreshVideo();

