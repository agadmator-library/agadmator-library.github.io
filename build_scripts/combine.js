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

export function combine() {
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
            return _.some(allPgns, videoPgn => _.startsWith(videoPgn, opening.pgn))
        })
        .map(opening => {
            return {
                name: `${opening.eco} - ${opening.name}`,
                moves: opening.pgn
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

    const b4 = []
    dbGetAllIds().forEach(id => {
        const game = dbRead(NAMESPACE_VIDEO_GAME, id)
        if (!game || !game.pgn) {
            return
        }

        const b4Played = /\d\.\s+b4/.test(game.pgn)
        if (b4Played) {
            b4.push(id)
        }
    })
    fs.writeFileSync(__dirname + '/../b4.json', JSON.stringify(b4))
}

combine();

