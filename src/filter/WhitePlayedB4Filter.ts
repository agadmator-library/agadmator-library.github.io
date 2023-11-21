import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Pgn} from "@/model/Pgn";
import {usePgnsStore} from "../stores/pgnsStore";

export class WhitePlayedB4Filter implements VideoFilter {
    constructor() {
    }

    name(): string {
        return `White played b4`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some((pgn: Pgn) => pgn.b4Played)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof WhitePlayedB4Filter
    }
}
