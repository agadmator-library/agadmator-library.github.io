import {combine} from "../combine.js";
import {database} from "../db.js";

let videoId: string | null | undefined = process.env.VIDEO_ID

if (videoId && videoId.indexOf("/") >= 0) {
    const url = new URL(videoId);
    videoId = url.searchParams.get("v")
}

if (!videoId) {
    throw `VIDEO_ID missing`
}

database.delete(videoId)

combine()
