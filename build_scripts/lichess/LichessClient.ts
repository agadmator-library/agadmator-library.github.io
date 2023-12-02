import {RateLimiter} from "../util/RateLimiter.js";
import axios from "axios";

interface ImportGameOutResponse {
    id: string
}

class LichessClient {
    private rateLimiter: RateLimiter = new RateLimiter(1_000)

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
}

export const lichessClient = new LichessClient()
