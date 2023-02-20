import {google} from "googleapis";
import {database, NAMESPACE_VIDEO_SNIPPET} from "./db.js";

export async function loadNewMovies(): Promise<string[]> {
    console.log("Starting downloading new movies")

    let youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY
    });

    console.log("Downloading channel contentDetails")

    const channelContentDetails = await youtube.channels.list({
        forUsername: 'agadmator',
        part: ['contentDetails']
    });

    console.log("Downloaded channel contentDetails")

    const uploadPlaylistId = channelContentDetails
        ?.data
        ?.items
        ?.find(value => value?.contentDetails?.relatedPlaylists?.uploads)
        ?.contentDetails
        ?.relatedPlaylists
        ?.uploads

    if (!uploadPlaylistId) {
        throw "uploadPlaylistId is missing"
    }

    console.log("Downloading playlist items")

    let playlistItemsResponse = await youtube.playlistItems.list({
        playlistId: uploadPlaylistId,
        maxResults: 10,
        part: ['snippet']
    });

    if (!playlistItemsResponse) {
        throw "playlistItemsResponse is missing"
    }

    let reachedExisting = false
    const downloadedVideosIds: string[] = []
    do {
        const now = new Date().toISOString()
        playlistItemsResponse.data?.items
            ?.filter(playlistItem => playlistItem?.snippet?.resourceId?.videoId)
            .forEach(playlistItem => {
                if (!playlistItem.snippet?.resourceId?.videoId) {
                    return
                }

                const toSave = {
                    schemaVersion: 1,
                    retrievedAt: now,
                    publishedAt: playlistItem.snippet?.publishedAt,
                    title: playlistItem.snippet?.title,
                    description: playlistItem.snippet?.description,
                    thumbnail: playlistItem.snippet?.thumbnails,
                    videoId: playlistItem.snippet.resourceId.videoId
                }

                if (database.read(NAMESPACE_VIDEO_SNIPPET, toSave.videoId)) {
                    reachedExisting = true
                } else {
                    database.save(NAMESPACE_VIDEO_SNIPPET, toSave.videoId, toSave)
                    downloadedVideosIds.push(toSave.videoId)
                }
            })
        if (!playlistItemsResponse.data.nextPageToken) {
            return []
        }
        const pageToken: string = playlistItemsResponse.data.nextPageToken
        if (!reachedExisting) {
            playlistItemsResponse = await youtube.playlistItems.list({
                playlistId: uploadPlaylistId,
                maxResults: 50,
                part: ['snippet'],
                pageToken: pageToken,
            })
        }
    } while (!reachedExisting && playlistItemsResponse.data.nextPageToken != null)

    console.log('Downloaded ' + downloadedVideosIds.length + ' videos')
    console.log('Downloaded videos ids are: ' + JSON.stringify(downloadedVideosIds))

    return downloadedVideosIds
}
