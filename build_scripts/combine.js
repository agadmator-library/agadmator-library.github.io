import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = []

fs.readdirSync(__dirname + '/../db/video-snippet').forEach(fileName => {
    const videoSnippet = JSON.parse(fs.readFileSync(__dirname + '/../db/video-snippet/' + fileName, {encoding: 'utf8'}));
    let games = []
    if (fs.existsSync(__dirname + '/../db/video-games/' + fileName)) {
        games = JSON.parse(fs.readFileSync(__dirname + '/../db/video-games/' + fileName, {encoding: 'utf8'}));
    }

    db.push({
        date: videoSnippet.publishedAt,
        title: videoSnippet.title,
        id: videoSnippet.videoId,
        game: games.length > 0 ? {w: games[0].playerWhite, b: games[0].playerBlack} : null
    })
})

fs.writeFileSync(__dirname + '/../db.json', JSON.stringify(db))
