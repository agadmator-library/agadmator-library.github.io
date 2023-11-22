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
    NAMESPACE_STOCKFISH_EVAL,
    NAMESPACE_VIDEO_CONTENT_DETAILS,
    NAMESPACE_VIDEO_SNIPPET
} from './db.js'
import {pgnRead} from 'kokopu'
import {parse} from 'tinyduration'
import {EvaluationResult} from "./stockfish/StockfishService";
import {fenShortener} from "./util/FenShortener.js";
import objectHash from 'object-hash'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultDir = `${__dirname}/../generated`

function writeResultFile(fileName: string, object: any) {
    fs.writeFileSync(`${resultDir}/${fileName}`, JSON.stringify(object))
}

function getResult(id: string, idx: number) {
    if (idx !== 0) {
        return null
    }
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

    let game = database.readDescriptionGames(id)[0]
    if (game && game.pgn) {
        if (game.pgn.endsWith("1-0")) {
            return 1
        }
        if (game.pgn.endsWith("0-1")) {
            return -1
        }
        if (game.pgn.endsWith("1/2-1/2")) {
            return 0
        }
        if (/^.*\d+\.\s[QNRB]?\d?x?[a-h]\d#$/.test(game.pgn)) {
            return 1
        }
        if (/^.*\d+\.\s.{2,5}\s[QNRB]?\d?x?[a-h]\d#$/.test(game.pgn)) {
            return -1
        }
    }

    const evaluations = database.read(NAMESPACE_STOCKFISH_EVAL, id)
    if (evaluations && evaluations[0]) {
        const evaluation = <EvaluationResult>evaluations[0]
        const perspective = game.fen?.includes(" w ") ? 1 : -1

        if (evaluation.mate !== null && evaluation.mate >= 0) {
            return perspective
        } else if (evaluation.mate != null) {
            return 0 - perspective
        } else if (evaluation.cp !== null && evaluation.cp >= 100) {
            return perspective
        } else if (evaluation.cp !== null && evaluation.cp <= -100) {
            return 0 - perspective
        } else if (evaluation.cp !== null && evaluation.cp in [-10, 10]) {
            return 0
        }
    }

    return null
}

function getDate(id: string, idx: number): string | null | undefined {
    const games = database.readDescriptionGames(id)
    const game = games && games[idx] ? games[idx] : null
    if (!game || !game.playerWhite) {
        return null
    }

    const chesstempoEntry = database.read(NAMESPACE_CHESSTEMPO_COM, id)
    if (chesstempoEntry && chesstempoEntry.date) {
        const split = chesstempoEntry.date.replaceAll(".", "-").split("-");
        return `${split[0]}-${_.padStart(split[1], 2, '0')}-${_.padStart(split[2], 2, '0')}`
    }

    if (game.date) {
        return game.date
    }

    const lichessMastersEntry = database.read(NAMESPACE_LICHESS_MASTERS, id)
    if (lichessMastersEntry?.month) {
        return `${lichessMastersEntry.month}-??`
    }
    if (lichessMastersEntry?.year) {
        return `${lichessMastersEntry.year}-??-??`
    }

    const chess365Entry = database.read(NAMESPACE_CHESS365, id)
    if (chess365Entry?.year) {
        return `${chess365Entry.year}-??-??`
    }

    const chessComEntry = database.read(NAMESPACE_CHESS_COM, id)
    if (chessComEntry?.year && chessComEntry.year !== "0") {
        return `${chessComEntry.year}-??-??`
    }

    return undefined
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
    const videoLength: any = {}
    const allPgns: string[] = []
    database.getAllIds().forEach((id: string) => {
        const videoSnippet = database.read(NAMESPACE_VIDEO_SNIPPET, id)
        if (!videoSnippet) {
            return
        }

        let videoContentDetails = database.read(NAMESPACE_VIDEO_CONTENT_DETAILS, id)
        if (videoContentDetails?.duration) {
            const duration = parse(videoContentDetails.duration);
            videoLength[id] = (duration.hours ? duration.hours * 60 : 0) + (duration.minutes ? duration.minutes : 0)
        }

        const games = database.readDescriptionGames(id)

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

                    const result = getResult(id, idx)
                    const date = getDate(id, idx)

                    return removeNulls({w: wId, b: bId, r: result, d: date})
                }),
            l: videoLength[videoSnippet.videoId]
        }))
    })


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
                .slice(2, 16)
                .forEach(node => {
                    const fen = node.position().fen().replaceAll(/ - \d+ \d+/g, "")
                    const shortFen = fenShortener.shrink(fen)
                    if (!positions[shortFen]) {
                        positions[shortFen] = videoArrayId
                    } else if (Array.isArray(positions[shortFen])) {
                        positions[shortFen].push(videoArrayId)
                    } else {
                        positions[shortFen] = [positions[shortFen]]
                        positions[shortFen].push(videoArrayId)
                    }
                })
        })
    })


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

    fs.readdirSync(resultDir).forEach(name => {
        if (name.endsWith(".json")) {
            fs.unlinkSync(`${resultDir}/${name}`)
        }
    })

    let dbFileName = `db-${objectHash(db)}.json`;
    writeResultFile(dbFileName, db)
    let pgnsFileName = `pgns-${objectHash(pgnsInVideo)}.json`;
    writeResultFile(pgnsFileName, pgnsInVideo)
    let positionsFileName = `positions-${objectHash(positions)}.json`;
    writeResultFile(positionsFileName, positions)
    let openingsSlimFileName = `openings-slim-${objectHash(openings)}.json`;
    writeResultFile(openingsSlimFileName, openings)

    const references = {
        db: dbFileName,
        pgns: pgnsFileName,
        positions: positionsFileName,
        openingsSlim: openingsSlimFileName
    }

    if (!fs.existsSync(`${resultDir}/js`)){
        fs.mkdirSync(`${resultDir}/js`);
    }
    fs.writeFileSync(`${resultDir}/js/references-${objectHash(references)}.js`, `window.__references=${JSON.stringify(references, null, 2)}`)

    let indexContent = fs.readFileSync(`${resultDir}/../index.html`, {encoding: 'utf8'});
    indexContent = indexContent.replaceAll(/src="generated\/js\/references-[a-z0-9]+.js"/g, `src=\"generated/js/references-${objectHash(references)}.js\"`)
    fs.writeFileSync(`${resultDir}/../index.html`, indexContent)
}
