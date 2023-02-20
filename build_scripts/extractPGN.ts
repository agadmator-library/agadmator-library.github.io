import {pgnRead, pgnWrite} from 'kokopu'
import cleanPgn from "./pgnCleaner.js";
import {extractPlayersFromDescription} from "./players/playersExtractor.js";
import getPlayersForId from "./players/playersOverrides.js";
import {database, NAMESPACE_VIDEO_SNIPPET} from "./db.js";
import {pgnOverrides} from "./pgnOverrides.js";
import _ from "lodash"

export type Game = {
    pgn?: string,
    fen?: string,
    playerWhite?: string,
    playerBlack?: string
}

function extractGames(description: string, id: string): Game[] {
    description = description.replaceAll("\n. e4 c6 2.", "\n1. e4 c6 2.")

    const pgns = getPgns(id, description)

    let players = getPlayersForId(id)

    if (players) {
        return [{
            pgn: pgns && pgns[0] ? pgns[0].pgn : undefined,
            fen: pgns && pgns[0] ? pgns[0].fen : undefined,
            playerWhite: players.white,
            playerBlack: players.black
        }]
    }

    if (pgns.length > 0) {
        const descriptionLines = description.split("\n");
        let previousPgnLineIdx = -1
        return pgns.map(pgnExtractionResult => {
            if (pgnExtractionResult.lineIdx) {
                players = extractPlayersFromDescription(id, descriptionLines.slice(previousPgnLineIdx + 1, pgnExtractionResult.lineIdx + 1).join("\n") + "\n")
                previousPgnLineIdx = pgnExtractionResult.lineIdx
            } else {
                players = extractPlayersFromDescription(id, description)
            }

            let game: any = {}
            game.pgn = pgnExtractionResult.pgn
            game.fen = pgnExtractionResult.fen
            if (players) {
                game.playerWhite = players.white
                game.playerBlack = players.black
            }
            return game
        })
    } else {
        players = extractPlayersFromDescription(id, description)
        let game: any = {}

        if (players) {
            game.playerWhite = players.white
            game.playerBlack = players.black
        }

        return [game]
    }
}

enum PgnSource {
    OVERRIDE,
    LINE
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
            pgn: parsedPgn,
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
                pgn: tmp.pgn.replaceAll("1/2-1/2", ""),
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
    if (games.length > 1) {
        games = games.filter(game => game.playerWhite)
    }
    if (games.length > 0) {
        database.saveVideoGames(id, games)
    }
}

export function extractPgnForAll() {
    database.getAllIds().forEach(id => {
        extractPgnForId(id);
    })
}
