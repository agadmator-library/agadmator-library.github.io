import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Pgn} from "@/model/Pgn";
import {usePgnsStore} from "@/stores/pgnsStore";

export class MovesFromFilter implements VideoFilter {
    constructor(
        private readonly count: number
    ) {
    }

    name(): string {
        return `Moves count from ${this.count}`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some((pgn: Pgn) => pgn.movesCount >= this.count)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof MovesFromFilter
            && this.count === other.count
    }
}
