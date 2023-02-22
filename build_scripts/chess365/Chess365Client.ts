import {RateLimiter} from "../util/RateLimiter.js";
import axios from "axios"
import * as cheerio from "cheerio";
import _ from "lodash";
import {BaseGame} from "../BaseGame.js"

class Chess365Client {
    private rateLimiter: RateLimiter = new RateLimiter(3_000)

    public async fetchGames(fen: string): Promise<Chess365Game[]> {
        await this.rateLimiter.assertDelay()

        const data = {
            'FEN': fen,
            'search_position': '1',
            'search_position2': '1',
            'fen_d': fen,
            'search_opt': '2',
            'cbase': '0'
        }
        const config = {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
            },
            timeout: 10000
        };

        const response = await axios.postForm('https://www.365chess.com/opening.php', data, config)

        const $ = cheerio.load(response.data)
        const tableRows = await $('#result1 tbody tr')

        const resultArray: Chess365Game[] = []

        tableRows
            .each((i, el) => {
                const row = $(el)

                const playerWhiteAElem = $(row.find('td a')[0])
                let playerWhiteMatch = playerWhiteAElem?.attr('href')?.match('.*players/([^/]*)')
                let playerWhite = playerWhiteAElem?.text()
                if (playerWhiteMatch && playerWhiteMatch.length === 2) {
                    playerWhite = playerWhiteMatch[1].replaceAll("_", " ")
                }

                const playerBlackAElem = $(row.find('td a')[1])
                let playerBlackMatch = playerBlackAElem.attr('href')?.match('.*players/([^/]*)');
                let playerBlack = playerBlackAElem.text()
                if (playerBlackMatch && playerBlackMatch.length === 2) {
                    playerBlack = playerBlackMatch[1].replaceAll("_", " ")
                }

                const resultAElem = $(row.find('td a')[2])
                const href = resultAElem.attr('href')
                const result = _.trim(resultAElem.text())
                const movesCountText = row.find('#col-mov').text()
                const eco = _.trim(row.find('#col-eco').text())
                const yearText = row.find('#col-dat').text()
                const tournament = _.trim($(row.find('td')[8]).text())

                if (!href || !playerWhite || !playerBlack || !result || !movesCountText) {
                    return
                }
                const movesCount = parseInt(movesCountText)
                const year = yearText ? parseInt(yearText) : undefined

                resultArray.push({
                        retrievedAt: new Date(),
                        href: href,
                        playerWhite: playerWhite,
                        playerBlack: playerBlack,
                        result: result,
                        movesCount: movesCount,
                        year: year,
                        eco: eco,
                        tournament: tournament
                    }
                )
            })

        return resultArray
    }
}

export const chess365Client = new Chess365Client()

type Chess365Game = BaseGame & {
    href: string,
    result: string,
    movesCount: number,
    year?: number,
    eco?: string,
    tournament?: string
}
