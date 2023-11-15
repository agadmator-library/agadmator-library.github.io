import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {usePgnsStore} from "@/stores/pgnsStore";
import {fenShortener, usePositionsStore} from "../stores/positionsStore";

export class PgnFilter implements VideoFilter {
    private readonly shortFen: string
    constructor(
        private readonly pgn: string,
        private readonly fen: string,
        private readonly transpositionChecked: boolean
    ) {
        this.shortFen = fenShortener.shrink(fen.replaceAll(/ - \d+ \d+/g, ""))
    }

    name(): string {
        return `Moves: ${this.pgn}`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some(pgn => pgn.pgn.startsWith(this.pgn) || (this.transpositionChecked && this.positionInVideo(video.id)))
    }

    private positionInVideo(videoId: string): boolean {
        return usePositionsStore().inVideo(this.shortFen, videoId)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof PgnFilter
            && this.pgn === other.pgn
    }
}
