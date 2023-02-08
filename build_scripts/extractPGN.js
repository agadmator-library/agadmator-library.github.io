import * as fs from "fs";
import {pgnRead, pgnWrite} from 'kokopu'
import path from 'path';
import cleanPgn from "./pgnCleaner.js";
import {fileURLToPath} from 'url';
import {extractPlayers, extractPlayersFromDescription} from "./playersExtractor.js";
import _ from "lodash";
import getPlayersForFileName from "./playersOverrides.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractGames(description, fileName) {
    description = description.replaceAll("\n. e4 c6 2.", "\n1. e4 c6 2.")
    const pgnRegex = /\n\s*11?\.(?!\.).+\n/
    let matchArray = pgnRegex.exec(description)
    const games = []

    if (matchArray != null) {
        matchArray
            .filter(pgn => pgn !== undefined)
            .filter(pgn => pgn !== null)
            .forEach(pgn => {
                const fixedPgn = cleanPgn(pgn)
                let players = extractPlayers(fileName, description, pgn)
                if (!players) {
                    players = extractPlayersFromDescription(fileName, description)
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
        let players = getPlayersForFileName(fileName)
        if (!players) {
            players = extractPlayersFromDescription(fileName, description)
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

fs.readdirSync(__dirname + '/../db/video-snippet').forEach(fileName => {
    //if (!fs.existsSync(__dirname + '/../db/video-games/' + fileName )) {
    const videoSnippet = JSON.parse(fs.readFileSync(__dirname + '/../db/video-snippet/' + fileName, {encoding: 'utf8'}));

    let games = extractGames(videoSnippet.description, fileName);
    fs.writeFileSync(__dirname + '/../db/video-games/' + fileName, JSON.stringify(games, null, 2))
    //}
})

//fs.writeFileSync(__dirname + '/../allPlayers.json', JSON.stringify(_.uniq(allPlayers).sort(), null, 2))
