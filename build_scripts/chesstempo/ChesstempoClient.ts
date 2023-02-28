import axios from "axios";
import {DescriptionGame} from "../extractPGN.js";
import {RateLimiter} from "../util/RateLimiter.js";
import {BaseGame} from "../BaseGame.js"

class ChesstempoClient {

    private rateLimiter: RateLimiter = new RateLimiter(10_000)

    public async fetch(game: DescriptionGame): Promise<ChesstempoResponse> {
        await this.rateLimiter.assertDelay()

        const requestBody = {
            startIndex: "0",
            results: "50",
            currentFen: game.fen,
            sort: "date",
            dir: "desc",
            pieceColour: "either",
            gameResult: "any",
            subsetMinRating: "all",
            gamesForPos: "1"
        }

        const responseBody = await axios.postForm('https://old.chesstempo.com/requests/gameslist.php', requestBody,
            {
                timeout: 10000,
                headers: {'content-type': 'application/x-www-form-urlencoded'}
            })
            .then(res => {
                if (res.status !== 200) {
                    throw "Fail " + res.status + " " + res.statusText
                }
                return res.data
            })


        const chesstempoGames: ChesstempoGame[] = responseBody.result
            .games
            .map((game: any) => {
                return {
                    retrievedAt: new Date(),
                    id: game.game_id,
                    playerWhite: game.white,
                    playerBlack: game.black,
                    result: game.result,
                    movesCount: game.num_moves,
                    date: game.date,
                    site: game.site,
                    event: game.event,
                    round: game.round,
                    eco: game.eco,
                    openingName: game.opening_name
                }
            })

        return {
            totalResults: responseBody.result.total_games,
            games: chesstempoGames
        }
    }
}

type ChesstempoGame = BaseGame & {
    id: number,
    result: string,
    movesCount: number,
    date?: string,
    site?: string,
    event?: string,
    round?: string,
    eco?: string,
    openingName?: string

}

type ChesstempoResponse = {
    totalResults: number,
    games: ChesstempoGame[]
}

export const chesstempoClient = new ChesstempoClient()
