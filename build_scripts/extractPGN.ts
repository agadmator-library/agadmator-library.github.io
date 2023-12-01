import {pgnRead, pgnWrite} from 'kokopu'
import cleanPgn from "./pgnCleaner.js";
import {extractPlayersFromDescription} from "./players/playersExtractor.js";
import getPlayersForId from "./players/playersOverrides.js";
import {database, NAMESPACE_VIDEO_SNIPPET} from "./db.js";
import {pgnOverrides} from "./pgnOverrides.js";
import {dateOverrides} from "./dateOverrides.js";
import _ from "lodash"

export type DescriptionGame = {
    pgn?: string,
    fen?: string,
    playerWhite?: string,
    playerBlack?: string,
    date?: string
}

enum PgnSource {
    OVERRIDE = 0,
    LINE = 1
}

function translateMonth(month: string) {
    const months = new Map<string, number>([
        ["Jan", 1],
        ["Feb", 2],
        ["Mar", 3],
        ["Apr", 4],
        ["May", 5],
        ["Jun", 6],
        ["Jul", 7],
        ["Aug", 8],
        ["Sept", 9],
        ["Sep", 9],
        ["Oct", 10],
        ["Nov", 11],
        ["Dec", 12]
    ])
    if (!months.has(month)) {
        throw `Invalid month: ${month}`
    }
    return _.padStart(`${months.get(month)}`, 2, '0')
}
function extractDateFromDescription(id: string, linesAbove: string): string | undefined {
    if (dateOverrides[id]) {
        return dateOverrides[id]
    }

    linesAbove = linesAbove.split('\n')
        .filter(line => !line.match(/game\s+of\s+the\s+day/))
        .join('\n')

    const pgnNotesRegex = /\[Date\s+"(\d+[.-]\d+[.-]\d+)"]/g
    let pgnNotesMatchResult = linesAbove.match(pgnNotesRegex)
    if (pgnNotesMatchResult) {
        linesAbove = pgnNotesMatchResult[0].replaceAll('"', " ")
    }

    const yyyyMMddRegex = /\s((1[4-9]\d\d)|(20\d\d))[.-](\d|0\d|1[0-2])[.-]([0-2]\d|3[01]|\d)/g
    let date = (linesAbove.match(yyyyMMddRegex) || [])
        .map(matched => _.trim(matched))
        .map(matched => matched.replaceAll(".", "-"))
        .map(matched => {
            let split = matched.split("-");
            return `${split[0]}-${_.padStart(split[1], 2, '0')}-${_.padStart(split[2], 2, '0')}`
        })[0]

    if (!date) {
        const ddMMyyyyRegex = /\s(\d|[0-2]\d|3[01])[.-](\d|0\d|1[0-2])[.-]((1[4-9]\d\d)|(20\d\d))/g
        date = (linesAbove.match(ddMMyyyyRegex) || [])
            .map(matched => _.trim(matched))
            .map(matched => matched.replaceAll(".", "-"))
            .map(matched => {
                let split = matched.split("-");
                return `${split[2]}-${_.padStart(split[1], 2, '0')}-${_.padStart(split[0], 2, '0')}`
            })[0]
    }

    if (!date) {
        const monthddyyyyRegex = /\s(Jan|Feb|Mar|Apr|Jul|Aug|Sept|Sep|Oct|Nov|Dec)[.-](\d|0\d|1[0-2])[.-]((1[4-9]\d\d)|(20\d\d))/g
        date = (linesAbove.match(monthddyyyyRegex) || [])
            .map(matched => _.trim(matched))
            .map(matched => matched
                .replaceAll(/(Jan|Feb|Mar|Apr|Jul|Aug|Sept|Sep|Oct|Nov|Dec)/g, month => translateMonth(month))
            )
            .map(matched => matched.replaceAll(".", "-"))
            .map(matched => {
                let split = matched.split("-");
                return `${split[2]}-${_.padStart(split[0], 2, '0')}-${_.padStart(split[1], 2, '0')}`
            })[0]
    }

    if (!date) {
        const lineRegex = /.*\((1[4-9]\d\d|20\d\d)\).*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)-(\d{1,2}|\?\?)\s*\n/
        let lineRegexMatch = linesAbove.match(lineRegex);
        if (lineRegexMatch) {
            return `${lineRegexMatch[1]}-${translateMonth(lineRegexMatch[2])}-${lineRegexMatch[3]}`
        }
    }

    if (!date) {
        const lineRegex = /.*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)-(\d{1,2}|\?\?)\s+\((1[4-9]\d\d|20\d\d)\).*\n/
        let lineRegexMatch = linesAbove.match(lineRegex);
        if (lineRegexMatch) {
            return `${lineRegexMatch[3]}-${translateMonth(lineRegexMatch[1])}-${lineRegexMatch[2]}`
        }
    }


    if (!date) {
        const lineRegex = /\n\D*\((1[4-9]\d\d|20\d\d)\)\D*\n/
        let lineRegexMatch = linesAbove.match(lineRegex);
        if (lineRegexMatch) {
            return `${lineRegexMatch[1]}-??-??`
        }
    }

    return date
}

function extractGames(description: string, id: string): DescriptionGame[] {
    description = description.replaceAll("\n. e4 c6 2.", "\n1. e4 c6 2.")

    const pgns = getPgns(id, description)

    let players = getPlayersForId(id)
    let date: string | undefined = undefined
    if (players) {
        return [{
            pgn: pgns && pgns[0] ? pgns[0].pgn : undefined,
            fen: pgns && pgns[0] ? pgns[0].fen : undefined,
            playerWhite: players.white,
            playerBlack: players.black,
            date: extractDateFromDescription(id, description)
        }]
    }

    if (pgns.length > 0) {
        const descriptionLines = description.split("\n");
        let previousPgnLineIdx = -1
        return pgns.map(pgnExtractionResult => {
            if (pgnExtractionResult.lineIdx) {
                const linesAbove = descriptionLines.slice(previousPgnLineIdx + 1, pgnExtractionResult.lineIdx + 1).join("\n") + "\n";
                players = extractPlayersFromDescription(id, linesAbove)
                date = extractDateFromDescription(id, linesAbove)
                previousPgnLineIdx = pgnExtractionResult.lineIdx
            } else {
                players = extractPlayersFromDescription(id, description)
                date = extractDateFromDescription(id, description)
            }

            let game: any = {}
            game.pgn = pgnExtractionResult.pgn
            game.fen = pgnExtractionResult.fen
            if (players) {
                game.playerWhite = players.white
                game.playerBlack = players.black
            }
            if (date) {
                game.date = date
            }
            return game
        })
    } else {
        players = extractPlayersFromDescription(id, description)
        date = extractDateFromDescription(id, description)
        let game: any = {}

        if (players) {
            game.playerWhite = players.white
            game.playerBlack = players.black
        }
        if (date) {
            game.date = date
        }

        return [game]
    }
}

type PgnExtraction = {
    source?: PgnSource,
    pgn?: string,
    fen?: string,
    lineIdx?: number
}

function getPgns(id: string, description: string): PgnExtraction[] {
    if (pgnOverrides[id]) {
        const kokopuParse = parseUsingKokopu(pgnOverrides[id]);
        if (!kokopuParse) {
            throw `${id} Failed to parse PGN from override`
        }
        return [
            {
                source: PgnSource.OVERRIDE,
                pgn: kokopuParse.pgn,
                fen: kokopuParse.fen
            }
        ]
    } else {
        const pgnRegex = /\n\s*(PGN: )?11?\.(?!\.)(?! Ian).+\n/mg
        let matchArray = description.match(pgnRegex)

        const resultArray: PgnExtraction[] = []
        if (matchArray != null) {
            matchArray
                .filter(pgn => pgn !== undefined)
                .filter(pgn => pgn !== null)
                .forEach(pgn => {
                    const fixedPgn = cleanPgn(pgn)
                    let parsedGame = parseUsingKokopu(fixedPgn);
                    if (parsedGame) {
                        let descriptionLines = description.split("\n");
                        let line = descriptionLines.find(line => line.indexOf(_.trim(pgn)) >= 0);
                        let initialLineIndex = undefined
                        if (line) {
                            initialLineIndex = descriptionLines.indexOf(line);
                        }

                        if (line && initialLineIndex) {
                            let lineIndex = initialLineIndex
                            let previousPgn = pgn
                            if (lineIndex >= 0) {
                                while (true) {
                                    if (lineIndex === descriptionLines.length - 1) {
                                        break
                                    }
                                    previousPgn = cleanPgn(previousPgn + " " + descriptionLines[++lineIndex])
                                    let tmpParsed = parseUsingKokopu(previousPgn)
                                    if (!tmpParsed) {
                                        break
                                    } else {
                                        parsedGame = tmpParsed
                                    }
                                }
                            }
                        }
                        resultArray.push({
                            source: PgnSource.LINE,
                            pgn: parsedGame.pgn,
                            fen: parsedGame.fen,
                            lineIdx: initialLineIndex
                        })
                    }
                })
        }
        return resultArray
    }
}

type KokopuParseResult = {
    pgn: string,
    fen: string
}

function parseUsingKokopu(pgn: string): KokopuParseResult | undefined {
    try {
        const database = pgnRead(pgn)
        const parsedPgn = pgnWrite(database.game(0))
            .replaceAll("\n", " ")
            .replaceAll(/\s{2,}/g, " ")
            .replaceAll(/\[.+]|\n/g, "")
            .replaceAll(/^\s+/g, "")

        const fen = database.game(0).finalPosition().fen()
        return {
            pgn: _.trim(parsedPgn),
            fen: fen
        }
    } catch (e) {
        if (pgn.endsWith("1/2-1/2")) {
            return undefined
        }
        let tmp = parseUsingKokopu(pgn + "1/2-1/2");
        return tmp == null
            ? undefined
            : {
                pgn: _.trim(tmp.pgn.replaceAll("1/2-1/2", "")),
                fen: tmp.fen
            }
    }
}

export function extractPgnForId(id: string) {
    const videoSnippet = database.read(NAMESPACE_VIDEO_SNIPPET, id)
    if (!videoSnippet) {
        return
    }

    let games = extractGames(videoSnippet.description, id);
    if (games.length > 0) {
        games = games.filter(game => game.playerWhite)
    }
    database.saveDescriptionGames(id, games)
}

export function extractPgnForAll() {
    database.getAllIds().forEach(id => {
        extractPgnForId(id);
    })
}
