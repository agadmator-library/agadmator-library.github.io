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

const resultDir = `${__dirname}/../generated`

function writeResultFile(fileName, object) {
    fs.writeFileSync(`${resultDir}/${fileName}`, JSON.stringify(object))
}

function getResult(id) {
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

    return chessComResult && chessComResult.result
        ? translateChessComResult(chessComResult.result)
        : (chesstempoComResult ? chesstempoComResult.result : null)
}

function getYear(id) {
    const chessComResult = dbRead(NAMESPACE_CHESS_COM, id)
    const chesstempoComResult = dbRead(NAMESPACE_CHESSTEMPO_COM, id)

    return chessComResult && chessComResult.year && chessComResult.year !== "0"
        ? chessComResult.year
        : (chesstempoComResult && chesstempoComResult.date ? chesstempoComResult.date.substring(0, 4) : null)
}

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
            game: game ? {w: game.playerWhite, b: game.playerBlack, result: getResult(id), year: getYear(id)} : null
        })

        if (game && game.pgn) {
            pgns[videoSnippet.videoId] = game.pgn
            allPgns.push(game.pgn)
        }

    })
    writeResultFile("db.json", db)
    writeResultFile("pgns.json", pgns)

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
    writeResultFile("openings-slim.json", openings)

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
    writeResultFile("b4.json", b4)
}

combine();

