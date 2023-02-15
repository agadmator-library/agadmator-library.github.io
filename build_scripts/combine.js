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
        switch (text) {
            case "1-0":
                return 1
            case "0-1":
                return -1
            case "½-½":
                return 0
            default:
                return null
        }
    }

    function translateChesstempoComResult(text) {
        switch (text) {
            case "w":
                return 1
            case "b":
                return -1
            case "d":
                return 0
            default:
                return null
        }
    }

    return chessComResult && chessComResult.result
        ? translateChessComResult(chessComResult.result)
        : (chesstempoComResult ? translateChesstempoComResult(chesstempoComResult.result) : null)
}

function getYear(id) {
    const game = dbRead(NAMESPACE_VIDEO_GAME, id)
    if (!game.playerWhite) {
        return null
    }
    const chessComResult = dbRead(NAMESPACE_CHESS_COM, id)
    const chesstempoComResult = dbRead(NAMESPACE_CHESSTEMPO_COM, id)

    return chessComResult && chessComResult.year && chessComResult.year !== "0"
        ? parseInt(chessComResult.year)
        : (chesstempoComResult && chesstempoComResult.date ? parseInt(chesstempoComResult.date.substring(0, 4)) : null)
}

function removeNulls(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

export function combine() {
    const db = {
        players: [],
        videos: []
    }
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

        let wId = null
        if (game && game.playerWhite) {
            wId = db.players.includes(game.playerWhite) ? db.players.indexOf(game.playerWhite) : db.players.push(game.playerWhite)
        }
        let bId = null
        if(game && game.playerBlack) {
            bId = db.players.includes(game.playerBlack) ? db.players.indexOf(game.playerBlack) : db.players.push(game.playerBlack)
        }

        db.videos.push(removeNulls({
            d: new Date(videoSnippet.publishedAt).getTime() / 1000,
            t: videoSnippet.title,
            id: videoSnippet.videoId,
            g: game ? removeNulls({w: wId, b: bId, r: getResult(id), y: getYear(id)}) : null
        }))

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

