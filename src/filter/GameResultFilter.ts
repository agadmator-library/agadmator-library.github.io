import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Game} from "@/model/Game";
import {GameResult} from "../model/GameResult";

export class GameResultFilter implements VideoFilter {
    constructor(
        private readonly result: GameResult
    ) {
    }

    name(): string {
        return `${this.result}`
    }

    test(video: Video): boolean {
        return video.games.some((game: Game) => {
            return this.result === game.result
        })
    }

    equals(other: VideoFilter): boolean {
        return other instanceof GameResultFilter
            && this.result == other.result
    }
}
