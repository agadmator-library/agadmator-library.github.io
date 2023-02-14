import {loadChessComInfoForId} from "../loadChessComInfo.js";
import {loadChesstempoInfoForId} from "../loadChesstempoInfo.js";
import {extractPgnForId} from "../extractPGN.js";
import {combine} from "../combine.js";
import {dbRead, NAMESPACE_VIDEO_SNIPPET} from "../db.js";

async function refreshVideo() {
    let videoId = process.env.VIDEO_ID

    if (videoId && videoId.indexOf("/") >= 0) {
        const url = new URL(videoId);
        videoId = url.searchParams.v
    }

    if (!videoId) {
        throw `VIDEO_ID missing`
    }

    const videoSnippet = dbRead(NAMESPACE_VIDEO_SNIPPET, videoId);

    if (!videoSnippet) {
        throw `Video not found: ${videoId}`
    }

    extractPgnForId(videoId)
    await loadChessComInfoForId(videoId, true)
    await loadChesstempoInfoForId(videoId, true)

    combine()
}

await refreshVideo();

