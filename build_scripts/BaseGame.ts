import {Game} from "./extractPGN.js";
import cleanPlayerName from "./players/playerNameCleaner.js";
import _ from "lodash";
import {levenshteinEditDistance} from "levenshtein-edit-distance";

export type BaseGame = {
    retrievedAt: Date,
    playerWhite: string,
    playerBlack: string
}

export function testIfSimilarPlayers(baseGame: BaseGame, game: Game): boolean {
    const wArray = cleanPlayerName(baseGame.playerWhite).split(" ").sort()
    const bArray = cleanPlayerName(baseGame.playerBlack).split(" ").sort()
    const gameWArray = game.playerWhite ? game.playerWhite.split(" ").sort() : []
    const gameBArray = game.playerBlack ? game.playerBlack.split(" ").sort() : []
    const w = wArray.join(" ")
    const b = bArray.join(" ")
    const gameW = gameWArray.join(" ")
    const gameB = gameBArray.join(" ")

    const matchWhite = _.intersection(wArray, gameWArray).length === Math.min(wArray.length, gameWArray.length)
        || levenshteinEditDistance(gameW, w) < Math.max(w.length, gameW.length) * 0.3
    const matchBlack = _.intersection(bArray, gameBArray).length === Math.min(bArray.length, gameBArray.length)
        || levenshteinEditDistance(gameB, b) < Math.max(b.length, gameB.length) * 0.3
    return matchWhite || matchBlack
}

export function testIfSamePlayers(baseGame: BaseGame, game: Game): boolean {
    return cleanPlayerName(baseGame.playerWhite) === game.playerWhite
        && cleanPlayerName(baseGame.playerBlack) === game.playerBlack
}
