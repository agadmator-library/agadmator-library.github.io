import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import _ from "lodash";

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

const pgns = {}
const allPgns = []
fs.readdirSync(__dirname + '/../db/video-snippet').forEach(fileName => {
    const videoSnippet = JSON.parse(fs.readFileSync(__dirname + '/../db/video-snippet/' + fileName, {encoding: 'utf8'}));
    let games = []
    if (fs.existsSync(__dirname + '/../db/video-games/' + fileName)) {
        games = JSON.parse(fs.readFileSync(__dirname + '/../db/video-games/' + fileName, {encoding: 'utf8'}));
    }

    if (games[0] && games[0].pgn) {
        pgns[videoSnippet.videoId] = games[0].pgn
        allPgns.push(games[0].pgn)
    }
})
fs.writeFileSync(__dirname + '/../pgns.json', JSON.stringify(pgns))

let openings = JSON.parse(fs.readFileSync(__dirname + '/../openings.json', {encoding: 'utf8'}))
    .filter(opening => {
        return _.some(allPgns, videoPgn => _.startsWith(videoPgn, opening.moves))
    })
    .map(opening => {
        return {
            name: `${opening.eco} - ${opening.name}`,
            moves: opening.moves
        }
    })
fs.writeFileSync(__dirname + '/../openings-slim.json', JSON.stringify(openings))
