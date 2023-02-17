import {pgnRead, pgnWrite} from 'kokopu'
import cleanPgn from "./pgnCleaner.js";
import {extractPlayers, extractPlayersFromDescription} from "./playersExtractor.js";
import _ from "lodash";
import getPlayersForId from "./playersOverrides.js";
import {dbGetAllIds, dbRead, dbSave, NAMESPACE_VIDEO_GAME, NAMESPACE_VIDEO_SNIPPET} from "./db.js";

function extractGames(description, id) {
    description = description.replaceAll("\n. e4 c6 2.", "\n1. e4 c6 2.")
    const pgnRegex = /\n\s*(PGN: )?11?\.(?!\.).+\n/
    let matchArray = pgnRegex.exec(description)
    const games = []

    if (matchArray != null) {
        matchArray
            .filter(pgn => pgn !== undefined)
            .filter(pgn => pgn !== null)
            .forEach(pgn => {
                const fixedPgn = cleanPgn(pgn)
                let players = extractPlayers(id, description, pgn)
                if (!players) {
                    players = extractPlayersFromDescription(id, description)
                }
                const game = parseUsingKokopu(fixedPgn)

                const result = {}

                if (game) {
                    result.pgn = game.pgn
                    result.fen = game.fen
                }
                if (players) {
                    result.playerWhite = players.white
                    result.playerBlack = players.black
                }

                if (!_.isEmpty(result)) {
                    games.push(result)
                }
            })
    } else {
        let players = getPlayersForId(id)
        if (!players) {
            players = extractPlayersFromDescription(id, description)
        }

        if (players) {
            games.push({
                playerWhite: players.white,
                playerBlack: players.black
            })
        }
    }
    return games
}

function parseUsingKokopu(pgn) {
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
            ? null
            : {
                pgn: tmp.pgn.replaceAll("1/2-1/2", ""),
                fen: tmp.fen
            }
    }
}

export function extractPgnForId(id) {
    const videoSnippet = dbRead(NAMESPACE_VIDEO_SNIPPET, id)
    if (!videoSnippet) {
        return
    }

    let games = extractGames(videoSnippet.description, id);
    if (games.length > 0) {
        dbSave(NAMESPACE_VIDEO_GAME, id, games[0])
    }
}

export function extractPgnForAll() {
    dbGetAllIds().forEach(id => {
        extractPgnForId(id);
    })
}
