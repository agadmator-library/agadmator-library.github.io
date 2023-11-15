import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Pgn} from "@/model/Pgn";
import {usePgnsStore} from "@/stores/pgnsStore";

export class UnderpromotionFilter implements VideoFilter {
    constructor() {
    }

    name(): string {
        return `Underpromotion`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some((pgn: Pgn) => pgn.underpromotion)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof UnderpromotionFilter
    }
}
