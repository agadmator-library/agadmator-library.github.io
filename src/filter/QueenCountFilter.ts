import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Pgn} from "@/model/Pgn";
import {usePgnsStore} from "../stores/pgnsStore";

export class QueenCountFilter implements VideoFilter {
    constructor(
        private readonly minCount: number
    ) {
    }

    name(): string {
        return `Queen count >= ${this.minCount}`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some((pgn: Pgn) => pgn.queenCnt >= this.minCount)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof QueenCountFilter
            && this.minCount === other.minCount
    }
}
