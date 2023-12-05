import {RateLimiter} from "../util/RateLimiter.js";
import axios from "axios";

export interface ImportGameOutResponse {
    id: string
}

class LichessClient {
    private rateLimiter: RateLimiter = new RateLimiter(5_000)

    public async importGame(pgn: string): Promise<ImportGameOutResponse> {
        await this.rateLimiter.assertDelay()

        const url = "https://lichess.org/api/import"
        const config = {
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        const params = new URLSearchParams({
            pgn: pgn
        });
        const response = await axios.post(url, params, config)
        return {
            id: response.data.id
        }
    }

    public async exportGame(gameId: string) {
        await this.rateLimiter.assertDelay()

        const url = `https://lichess.org/game/export/${gameId}?moves=true&tags=true&evals=true&accuracy=true&opening=true&pgnInJson=true`
        const config = {
            headers: {
                'Accept': 'application/json'
            }
        }
        const response = await axios.get(url, config)
        return response.data
    }
}

export const lichessClient = new LichessClient()
