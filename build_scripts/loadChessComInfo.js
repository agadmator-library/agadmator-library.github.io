import * as cheerio from 'cheerio';
import {dbRead, dbSave, NAMESPACE_CHESS_COM, NAMESPACE_VIDEO_GAME} from "./db.js";


let first = true

async function getGamesRows(url, id) {
    let fetchedHtml = await fetch(url)
    if (!fetchedHtml.ok) {
        console.log(id + " failed to fetch")
        throw "failed to fetch"
    }

    let text = await fetchedHtml.text()
    let $ = cheerio.load(text)
    return $('tbody tr.master-games-master-game')
}

export async function loadChessComInfoForId(id) {
    if (!dbRead(NAMESPACE_CHESS_COM, id)) {
        const game = dbRead(NAMESPACE_VIDEO_GAME, id)

        if (!game || !game.fen || !game.playerWhite || !game.playerBlack) {
            return;
        }

        if (!first) {
            await new Promise(r => setTimeout(r, 5000)) // 12 requests per minute
        }
        first = false

        let url = `https://www.chess.com/games/search?p1=${game.playerWhite}&p2=${game.playerBlack}&fen=${game.fen}`

        let gamesRows = await getGamesRows(url, id)

        let fromFen = false
        if (gamesRows.length === 0) {
            await new Promise(r => setTimeout(r, 5000)) // 12 requests per minute
            console.log(`${id} Searching using only fen`)
            url = `https://www.chess.com/games/search?fen=${game.fen}`
            gamesRows = await getGamesRows(url, id);
            fromFen = true
        }

        if (gamesRows.length === 0) {
            console.log(`${id} Game not found`)
            dbSave(NAMESPACE_CHESS_COM, id, {
                reason: "NOT_FOUND",
                retrievedAt: new Date().toISOString(),
            })
            return;
        } else if (gamesRows.length > 1) {
            console.log(`${id} More than one game found`)
            dbSave(NAMESPACE_CHESS_COM, id, {
                reason: "AMBIGUOUS",
                retrievedAt: new Date().toISOString(),
            })
            return;
        }

        let firstGameRow = gamesRows.first();

        const chessComEntry = {
            retrievedAt: new Date().toISOString(),
            href: firstGameRow.find("a").first().attr("href"),
            playerWhite: firstGameRow.find(".master-games-username")[0].firstChild.data,
            playerBlack: firstGameRow.find(".master-games-username")[1].firstChild.data,
            result: firstGameRow.find("td:nth-of-type(2) a.master-games-text-middle").first().attr("title"),
            movesCount: firstGameRow.find("td:nth-of-type(3) a.master-games-text-middle").first().attr("title"),
            year: firstGameRow.find("td:nth-of-type(4) a.master-games-text-middle").first().attr("title")
        }

        if (fromFen) {
            console.log(chessComEntry)
        }

        dbSave(NAMESPACE_CHESS_COM, id, chessComEntry)
    }
}
