import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class MatchBetweenFilter implements VideoFilter {
    constructor(
        private readonly leftPlayerName: string,
        private readonly rightPlayerName: string,
    ) {
    }

    name(): string {
        return `${this.leftPlayerName} vs ${this.rightPlayerName}`
    }

    test(video: Video): boolean {
        return video.games.some(game => {
            return game.white === this.leftPlayerName && game.black === this.rightPlayerName
                || game.white === this.rightPlayerName && game.black === this.leftPlayerName
        })
    }

    equals(other: VideoFilter): boolean {
        return other instanceof MatchBetweenFilter
            && this.leftPlayerName === other.leftPlayerName
            && this.rightPlayerName === other.rightPlayerName
    }
}
