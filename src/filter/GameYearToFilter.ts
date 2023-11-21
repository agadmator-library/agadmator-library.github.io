import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Game} from "@/model/Game";

export class GameYearToFilter implements VideoFilter {
    constructor(
        private readonly year: number,
    ) {
    }

    name(): string {
        return `Game year to ${this.year}`
    }

    test(video: Video): boolean {
        return video.games.some((game: Game) => game.date && game.getYear() <= this.year)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof GameYearToFilter
            && this.year == other.year
    }
}
