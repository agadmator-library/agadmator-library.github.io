import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import _ from "lodash";
import {
    database,
    NAMESPACE_CHESS365,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_LICHESS_MASTERS,
    NAMESPACE_VIDEO_SNIPPET
} from './db.js'
import {pgnRead} from 'kokopu'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultDir = `${__dirname}/../generated`

function writeResultFile(fileName: string, object: any) {
    fs.writeFileSync(`${resultDir}/${fileName}`, JSON.stringify(object))
}

function getResult(id: string) {
    function translateChessComOrChess365Result(text: string | undefined | null) {
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

    function translateChesstempoComResult(text: string | undefined | null) {
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

    function translateLichessMastersResult(text: string | undefined | null) {
        switch (text) {
            case "white":
                return 1
            case "black":
                return -1
            default:
                return "d"
        }
    }

    const chessComEntry = database.read(NAMESPACE_CHESS_COM, id)
    if (chessComEntry?.result) {
        return translateChessComOrChess365Result(chessComEntry.result)
    }

    const chesstempoEntry = database.read(NAMESPACE_CHESSTEMPO_COM, id)
    if (chesstempoEntry?.result) {
        return translateChesstempoComResult(chesstempoEntry.result)
    }

    const chess365Entry = database.read(NAMESPACE_CHESS365, id)
    if (chess365Entry?.result) {
        return translateChessComOrChess365Result(chess365Entry.result)
    }

    const lichessMastersEntry = database.read(NAMESPACE_LICHESS_MASTERS, id)
    if (lichessMastersEntry?.id) {
        return translateLichessMastersResult(lichessMastersEntry.winner)
    }

    return null
}

function getYear(id: string): number | null | undefined {
    const games = database.readVideoGames(id)
    const game = games && games[0] ? games[0] : null
    if (!game || !game.playerWhite) {
        return null
    }

    const chessComEntry = database.read(NAMESPACE_CHESS_COM, id)
    if (chessComEntry?.year) {
        return parseInt(chessComEntry.year)
    }

    const chesstempoEntry = database.read(NAMESPACE_CHESSTEMPO_COM, id)
    if (chesstempoEntry && chesstempoEntry.date) {
        return parseInt(chesstempoEntry.date.substring(0, 4))
    }

    const chess365Entry = database.read(NAMESPACE_CHESS365, id)
    if (chess365Entry?.year) {
        return chess365Entry?.year
    }

    const lichessMastersEntry = database.read(NAMESPACE_LICHESS_MASTERS, id)
    return lichessMastersEntry?.year
}

function removeNulls(obj: any): any {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

type DB = {
    players: string[],
    videos: any[]
}

export function combine() {
    const db: DB = {
        players: [],
        videos: []
    }
    const pgnsInVideo: any = {}
    const allPgns: string[] = []
    database.getAllIds().forEach((id: string) => {
        const videoSnippet = database.read(NAMESPACE_VIDEO_SNIPPET, id)
        if (!videoSnippet) {
            return
        }

        const games = database.readVideoGames(id)

        db.videos.push(removeNulls({
            d: new Date(videoSnippet.publishedAt).getTime() / 1000,
            t: videoSnippet.title,
            id: videoSnippet.videoId,
            g: games
                .filter(game => Object.keys(game).length > 0)
                .map((game, idx) => {
                let wId = null
                if (game && game.playerWhite) {
                    wId = db.players.indexOf(game.playerWhite) >= 0 ? db.players.indexOf(game.playerWhite) : db.players.push(game.playerWhite) - 1
                }
                let bId = null
                if (game && game.playerBlack) {
                    bId = db.players.indexOf(game.playerBlack) >= 0 ? db.players.indexOf(game.playerBlack) : db.players.push(game.playerBlack) - 1
                }

                if (game.pgn) {
                    if (!pgnsInVideo[videoSnippet.videoId]) {
                        pgnsInVideo[videoSnippet.videoId] = []
                    }
                    pgnsInVideo[videoSnippet.videoId].push(game.pgn)

                    allPgns.push(game.pgn)
                }

                const result = idx === 0 ? getResult(id) : null
                const year = idx === 0 ? getYear(id) : null

                return removeNulls({w: wId, b: bId, r: result, y: year})
            })
        }))


    })
    writeResultFile("db.json", db)
    writeResultFile("pgns.json", pgnsInVideo)

    const positions: any = {
        videos: []
    }
    Object.keys(pgnsInVideo).forEach(videoId => {
        const videoArrayId = positions.videos.push(videoId) - 1
        pgnsInVideo[videoId].forEach((pgn: string) => {
            pgnRead(pgn + " 1-0")
                .game(0)
                .mainVariation()
                .nodes()
                .slice(2, 14)
                .forEach(node => {
                    const fen = node.position().fen().replaceAll(/ - \d+ \d+/g, "")
                    if (!positions[fen]) {
                        positions[fen] = []
                    }
                    positions[fen].push(videoArrayId)
                })
        })

    })
    writeResultFile("positions.json", positions)

    let openings = JSON.parse(fs.readFileSync(__dirname + '/../openings.json', {encoding: 'utf8'}))
        .filter((opening: any) => {
            return _.some(allPgns, videoPgn => _.startsWith(videoPgn, opening.pgn))
        })
        .map((opening: any) => {
            return {
                name: `${opening.eco} - ${opening.name}`,
                moves: opening.pgn
            }
        })
    writeResultFile("openings-slim.json", openings)
}

combine();
