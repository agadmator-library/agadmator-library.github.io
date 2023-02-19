import * as cheerio from 'cheerio';
import {dbRead, dbSave, NAMESPACE_CHESS_COM, NAMESPACE_VIDEO_GAME} from "./db.js";
import {ChessComClient} from "./ChessComClient.js";


async function getGamesRows(url, id) {
    let fetchedHtml = await fetch(url, {signal: AbortSignal.timeout(15000)})
    if (!fetchedHtml.ok) {
        console.log(id + " failed to fetch")
        throw "failed to fetch"
    }

    let text = await fetchedHtml.text()
    let $ = cheerio.load(text)
    return $('tbody tr.master-games-master-game')
}

export async function loadChessComInfoForId(id, force) {
    if (!dbRead(NAMESPACE_CHESS_COM, id) || force) {
        const game = dbRead(NAMESPACE_VIDEO_GAME, id)

        if (!game || !game.fen || !game.playerWhite || !game.playerBlack) {
            return;
        }

        let chessComGames = await new ChessComClient().fetchGames(game.fen, game.playerWhite, game.playerBlack)

        let fromFen = false
        if (chessComGames.length === 0) {
            console.log(`${id} Searching using only fen`)
            chessComGames = await new ChessComClient().fetchGames(game.fen)
            fromFen = true
        }

        if (chessComGames.length === 0) {
            console.log(`${id} Game not found`)
            dbSave(NAMESPACE_CHESS_COM, id, {
                reason: "NOT_FOUND",
                retrievedAt: new Date().toISOString(),
            })
            return;
        } else if (chessComGames.length > 1) {
            console.log(`${id} More than one game found`)
            dbSave(NAMESPACE_CHESS_COM, id, {
                reason: "AMBIGUOUS",
                retrievedAt: new Date().toISOString(),
            })
            return;
        }

        let firstGameRow = chessComGames[0]

        if (fromFen) {
            console.log(firstGameRow)
        }

        dbSave(NAMESPACE_CHESS_COM, id, firstGameRow)
    }
}

await loadChessComInfoForId("4ONdu4cEeGA", true)
