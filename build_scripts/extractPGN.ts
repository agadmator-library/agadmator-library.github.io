import {pgnRead, pgnWrite} from 'kokopu'
import cleanPgn from "./pgnCleaner.js";
import {extractPlayersFromDescription} from "./playersExtractor.js";
import getPlayersForId from "./playersOverrides.js";
import {database, NAMESPACE_VIDEO_GAME, NAMESPACE_VIDEO_SNIPPET} from "./db.js";
import {pgnOverrides} from "./pgnOverrides.js";
import _ from "lodash"

function extractGame(description: string, id: string): any {
    description = description.replaceAll("\n. e4 c6 2.", "\n1. e4 c6 2.")

    let players = getPlayersForId(id)
    if (!players) {
        players = extractPlayersFromDescription(id, description)
    }
    let pgn = getPgn(id, description)

    let game: any = {}

    if (pgn) {
        game.pgn = pgn.pgn
        game.fen = pgn.fen
    }
    if (players) {
        game.playerWhite = players.white
        game.playerBlack = players.black
    }

    return game
}

function getPgn(id: string, description: string) {
    if (pgnOverrides[id]) {
        return parseUsingKokopu(pgnOverrides[id])
    } else {
        const pgnRegex = /\n\s*(PGN: )?11?\.(?!\.)(?! Ian).+\n/
        let matchArray = pgnRegex.exec(description)

        if (matchArray != null) {
            return matchArray
                .filter(pgn => pgn !== undefined)
                .filter(pgn => pgn !== null)
                .map(pgn => {
                    const fixedPgn = cleanPgn(pgn)
                    let parsedGame = parseUsingKokopu(fixedPgn);
                    if (parsedGame) {
                        let descriptionLines = description.split("\n");
                        let line = descriptionLines.find(line => line.indexOf(_.trim(pgn)) >= 0);
                        if (line) {
                            let lineIndex = descriptionLines.indexOf(line);
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
                    }
                    return parsedGame
                })
                .find(it => true)
        }
    }
    return undefined
}

function parseUsingKokopu(pgn: string): any | undefined {
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
            return null
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

    let game = extractGame(videoSnippet.description, id);
    if (game && Object.keys(game).length > 0) {
        database.save(NAMESPACE_VIDEO_GAME, id, game)
    }
}

export function extractPgnForAll() {
    database.getAllIds().forEach(id => {
        extractPgnForId(id);
    })
}
