import {RateLimiter} from "../util/RateLimiter.js";
import axios from "axios"
import {BaseGame} from "../BaseGame.js";

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
                return {
                    retrievedAt: new Date(),
                    id: responseGame.id,
                    winner: responseGame.winner,
                    playerWhite: responseGame.white.name,
                    playerBlack: responseGame.black.name,
                    year: responseGame.year,
                    month: responseGame.month,
                    eco: response.data.opening?.eco,
                    openingName: response.data.opening?.eco
                }
            })
        }
    }
}

type LichessMastersResponse = {
    total: number,
    games: LichessMastersGame[]
}

type LichessMastersGame = BaseGame & {
    id: string,
    winner: string,
    year?: number,
    month?: string,
    eco?: string,
    openingName?: string
}

export const lichessMasterClient = new LichessMastersClient()

lichessMasterClient.fetchGames("8/3k4/6R1/2bpBp2/2b3p1/1r6/5PP1/3R2K1 b - - 0 1")


