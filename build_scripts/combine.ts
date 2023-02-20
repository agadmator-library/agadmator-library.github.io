import fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import _ from "lodash";
import {database, NAMESPACE_CHESS_COM, NAMESPACE_CHESSTEMPO_COM, NAMESPACE_VIDEO_SNIPPET} from './db.js'
import {pgnRead} from 'kokopu'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultDir = `${__dirname}/../generated`

function writeResultFile(fileName: string, object: any) {
    fs.writeFileSync(`${resultDir}/${fileName}`, JSON.stringify(object))
}

function getResult(id: string) {
    const chessComResult = database.read(NAMESPACE_CHESS_COM, id)
    const chesstempoComResult = database.read(NAMESPACE_CHESSTEMPO_COM, id)

    function translateChessComResult(text: string | undefined | null) {
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

    return chessComResult && chessComResult.result
        ? translateChessComResult(chessComResult.result)
        : (chesstempoComResult ? translateChesstempoComResult(chesstempoComResult.result) : null)
}

function getYear(id: string): number | null | undefined {
    const games = database.readVideoGames(id)
    const game = games && games[0] ? games[0] : null
    if (!game || !game.playerWhite) {
        return null
    }
    const chessComResult = database.read(NAMESPACE_CHESS_COM, id)
    const chesstempoComResult = database.read(NAMESPACE_CHESSTEMPO_COM, id)

    return chessComResult && chessComResult.year && chessComResult.year !== "0"
        ? parseInt(chessComResult.year)
        : (chesstempoComResult && chesstempoComResult.date ? parseInt(chesstempoComResult.date.substring(0, 4)) : null)
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
            g: games.map((game, idx) => {
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

    const b4: string[] = []
    database.getAllIds().forEach((id: string) => {
        database.readVideoGames(id)
            .filter(game => game.pgn)
            .filter(game => /\d\.\s+b4/.test(game.pgn ? game.pgn : ""))
            .forEach(game => b4.push(id))
    })
    writeResultFile("b4.json", b4)
}

combine();

