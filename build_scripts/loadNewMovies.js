import {google} from "googleapis";
import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    .data
    .items
    .find(value => value.contentDetails.relatedPlaylists.uploads != null)
    .contentDetails
    .relatedPlaylists
    .uploads

console.log("Downloading playlist items")

let playlistItemsResponse = await youtube.playlistItems.list({
    playlistId: uploadPlaylistId,
    maxResults: 10,
    part: ['snippet']
});
let reachedExisting = false
const downloadedVideosIds = []
do {
    const now = new Date().toISOString()
    playlistItemsResponse.data.items
        .filter(playlistItem => playlistItem.snippet.resourceId.videoId != null)
        .forEach(playlistItem => {
            const toSave = {
                schemaVersion: 1,
                retrievedAt: now,
                publishedAt: playlistItem.snippet.publishedAt,
                title: playlistItem.snippet.title,
                description: playlistItem.snippet.description,
                thumbnail: playlistItem.snippet.thumbnails,
                videoId: playlistItem.snippet.resourceId.videoId
            }
            const filePath = __dirname + '/../db/video-snippet/' + toSave.videoId + '.json'
            if (!fs.existsSync(filePath)) {
                downloadedVideosIds.push(toSave.videoId)
                fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2))
            } else {
                reachedExisting = true
            }
        })
    if (!reachedExisting) {
        playlistItemsResponse = await youtube.playlistItems.list({
            playlistId: uploadPlaylistId,
            maxResults: 50,
            part: ['snippet'],
            pageToken: playlistItemsResponse.data.nextPageToken,
        })
    }
} while (!reachedExisting && playlistItemsResponse.data.nextPageToken != null)

console.log('Downloaded ' + downloadedVideosIds.length + ' videos')
console.log('Downloaded videos ids are: ' + JSON.stringify(downloadedVideosIds))


