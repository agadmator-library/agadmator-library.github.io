import {RateLimiter} from "../util/RateLimiter.js";
import axios from "axios"
import {BaseGame, Result} from "../BaseGame.js";

class LichessMastersClient {
    private rateLimiter: RateLimiter = new RateLimiter(10_000)

    public async fetchGames(fen: string): Promise<LichessMastersResponse> {
        await this.rateLimiter.assertDelay()

        const url = `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}`
        const config = {
            headers: {
                'Accept': 'application/json'
            }
        }

        const response = await axios.get(url, config)

        return {
            total: (response.data.white + response.data.draws + response.data.black) as number,
            games: response.data.topGames.map((responseGame: any) => {
                return new LichessMastersGame(
                    new Date(),
                    responseGame.white.name,
                    responseGame.black.name,
                    responseGame.id,
                    responseGame.winner,
                    responseGame.year,
                    responseGame.month,
                    response.data.opening?.eco,
                    response.data.opening?.name
                )
            })
        }
    }
}

type LichessMastersResponse = {
    total: number,
    games: LichessMastersGame[]
}

class LichessMastersGame implements BaseGame {
    retrievedAt: Date
    playerWhite: string
    playerBlack: string
    id: string
    winner: string
    year?: number
    month?: string
    eco?: string
    openingName?: string

    constructor(
        retrievedAt: Date,
        playerWhite: string,
        playerBlack: string,
        id: string,
        winner: string,
        year?: number,
        month?: string,
        eco?: string,
        openingName?: string
    ) {
        this.retrievedAt = retrievedAt
        this.playerWhite = playerWhite
        this.playerBlack = playerBlack
        this.id = id
        this.winner = winner
        this.year = year
        this.month = month
        this.eco = eco
        this.openingName = openingName
    }

    getResult(): Result | undefined {
        switch (this.winner) {
            case "white":
                return Result.WHITE
            case "black":
                return Result.BLACK
            default:
                return Result.DRAW
        }
    }
}

export const lichessMasterClient = new LichessMastersClient()
