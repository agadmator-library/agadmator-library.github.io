import * as cheerio from "cheerio";
import {RateLimiter} from "../util/RateLimiter.js";
import {BaseGame} from "../BaseGame.js"

class ChessComClient {
    private rateLimiter: RateLimiter = new RateLimiter(15_000)

    public async fetchGames(fen: string): Promise<ChessComGame[]> {
        await this.rateLimiter.assertDelay()

        let url = `https://www.chess.com/games/search?fen=${fen}`

        let fetchedHtml = await fetch(url, {signal: AbortSignal.timeout(15000)})
        if (!fetchedHtml.ok) {
            throw `Failed to retrieve data from chess.com. Status: ${fetchedHtml.status}}`
        }

        let text = await fetchedHtml.text()
        const $ = cheerio.load(text)
        const tableRows = await $('tbody tr.master-games-master-game')

        const resultArray: ChessComGame[] = []

        tableRows
            .each((i, el) => {
                const row = $(el)
                const href = row.find("a").first().attr("href")
                const playerWhite = row.find(".master-games-username").first().text()
                const playerBlack = row.find(".master-games-username").last().text()
                const result = row.find("td:nth-of-type(2) a.master-games-text-middle").first().attr("title");
                const movesCountText = row.find("td:nth-of-type(3) a.master-games-text-middle").first().attr("title")
                const yearText = row.find("td:nth-of-type(4) a.master-games-text-middle").first().attr("title");

                if (!href || !playerWhite || !playerBlack || !result || !movesCountText) {
                    return
                }
                const movesCount = parseInt(movesCountText)
                const year = yearText && yearText !== "0" ? parseInt(yearText) : undefined

                resultArray.push({
                        retrievedAt: new Date(),
                        href: href,
                        playerWhite: playerWhite,
                        playerBlack: playerBlack,
                        result: result,
                        movesCount: movesCount,
                        year: year
                    }
                )
            })

        return resultArray
    }
}

type ChessComGame = BaseGame & {
    href: string,
    result: string,
    movesCount: number,
    year?: number
}

export const chessComClient = new ChessComClient()
