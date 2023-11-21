import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Side} from "@/model/Side";
import {Result} from "@/model/Result";
import {Game} from "@/model/Game";
import {GameResult} from "../model/GameResult";

export class SideResultFilter implements VideoFilter {
    constructor(
        private readonly side: Side | undefined,
        private readonly result: Result
    ) {
    }

    name(): string {
        return `${this.side || ""} ${this.result}`
    }

    test(video: Video): boolean {
        return video.games.some((game: Game) => {
            return this.side === Side.WHITE && this.result === Result.WIN && game.result === GameResult.WHITE_WON
                || this.side === Side.WHITE && this.result === Result.LOSE && game.result === GameResult.BLACK_WON
                || this.side === Side.BLACK && this.result === Result.WIN && game.result === GameResult.BLACK_WON
                || this.side === Side.BLACK && this.result === Result.LOSE && game.result === GameResult.WHITE_WON
                || this.result === Result.DRAW && game.result === GameResult.DRAW
        })
    }

    equals(other: VideoFilter): boolean {
        return other instanceof SideResultFilter
            && this.side == other.side
            && this.result == other.result
    }
}
