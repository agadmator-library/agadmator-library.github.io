import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Side} from "@/model/Side";

export class PlayerSideFilter implements VideoFilter {
    constructor(
        private readonly playerName: string,
        private readonly side: Side | undefined,
    ) {
    }

    name(): string {
        return `${this.side || "Any side"} ${this.playerName}`
    }

    test(video: Video): boolean {
        return video.games.some(game => {
            return this.side === undefined && (game.white === this.playerName || game.black === this.playerName)
                || this.side === Side.WHITE && game.white === this.playerName
                || this.side === Side.BLACK && game.black === this.playerName
        })
    }

    equals(other: VideoFilter): boolean {
        return other instanceof PlayerSideFilter
            && other.playerName === this.playerName
            && other.side === this.side
    }
}
