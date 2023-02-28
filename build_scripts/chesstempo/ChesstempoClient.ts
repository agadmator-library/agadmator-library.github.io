import axios from "axios";
import {DescriptionGame} from "../extractPGN.js";
import {RateLimiter} from "../util/RateLimiter.js";
import {BaseGame, Result} from "../BaseGame.js"

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
                return new ChesstempoGame(
                    new Date(),
                    game.white,
                    game.black,
                    game.game_id,
                    game.result,
                    game.num_moves,
                    game.date,
                    game.site,
                    game.event,
                    game.round,
                    game.eco,
                    game.opening_name
                )
            })

        return {
            totalResults: responseBody.result.total_games,
            games: chesstempoGames
        }
    }
}

class ChesstempoGame implements BaseGame {
    retrievedAt: Date
    playerWhite: string
    playerBlack: string
    id: number
    result: string
    movesCount: number
    date?: string
    site?: string
    event?: string
    round?: string
    eco?: string
    openingName?: string

    constructor(
        retrievedAt: Date,
        playerWhite: string,
        playerBlack: string,
        id: number,
        result: string,
        movesCount: number,
        date?: string,
        site?: string,
        event?: string,
        round?: string,
        eco?: string,
        openingName?: string
    ) {
        this.retrievedAt = retrievedAt
        this.playerWhite = playerWhite
        this.playerBlack = playerBlack
        this.id = id
        this.result = result
        this.movesCount = movesCount
        this.date = date
        this.site = site
        this.event = event
        this.round = round
        this.eco = eco
        this.openingName = openingName
    }

    getResult(): Result | undefined {
        return undefined;
    }
}

type ChesstempoResponse = {
    totalResults: number,
    games: ChesstempoGame[]
}

export const chesstempoClient = new ChesstempoClient()
