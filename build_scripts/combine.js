import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import _ from "lodash";
import {
    dbGetAllIds,
    dbRead,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_VIDEO_GAME,
    NAMESPACE_VIDEO_SNIPPET
} from './db.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = []
const pgns = {}
const allPgns = []

dbGetAllIds().forEach(id => {
    const videoSnippet = dbRead(NAMESPACE_VIDEO_SNIPPET, id)
    if (!videoSnippet) {
        return
    }

    let game = dbRead(NAMESPACE_VIDEO_GAME, id)
    if (!game) {
        game = null
    }

    db.push({
        date: videoSnippet.publishedAt,
        title: videoSnippet.title,
        id: videoSnippet.videoId,
        game: game ? {w: game.playerWhite, b: game.playerBlack} : null
    })

    if (game && game.pgn) {
        pgns[videoSnippet.videoId] = game.pgn
        allPgns.push(game.pgn)
    }

})

fs.writeFileSync(__dirname + '/../db.json', JSON.stringify(db))
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


const results = {}
dbGetAllIds().forEach(id => {
    const chessComResult = dbRead(NAMESPACE_CHESS_COM, id)
    const chesstempoComResult = dbRead(NAMESPACE_CHESSTEMPO_COM, id)

    function translateChessComResult(text) {
        if (text === "1-0") {
            return "w"
        } else if (text === "0-1") {
            return "b"
        } else if (text === "½-½") {
            return "d"
        } else {
            return null
        }
    }

    const result = chessComResult && chessComResult.result
        ? translateChessComResult(chessComResult.result)
        : (chesstempoComResult ? chesstempoComResult.result : null)

    if (result) {
        results[id] = result
    }
})
fs.writeFileSync(__dirname + '/../results.json', JSON.stringify(results))

// fs.readdirSync(__dirname + '/../db/chess-com-games').forEach(fileName => {
//     const chessCom = JSON.parse(fs.readFileSync(__dirname + '/../db/chess-com-games/' + fileName, {encoding: 'utf8'}));
//     dbSave(NAMESPACE_CHESS_COM, fileName.replaceAll(".json", ""), chessCom)
// })

// fs.readdirSync(__dirname + '/../db/chess-tempo-games').forEach(fileName => {
//     const chessTempo = JSON.parse(fs.readFileSync(__dirname + '/../db/chess-tempo-games/' + fileName, {encoding: 'utf8'}));
//     dbSave(NAMESPACE_CHESSTEMPO_COM, fileName.replaceAll(".json", ""), chessTempo)
// })
