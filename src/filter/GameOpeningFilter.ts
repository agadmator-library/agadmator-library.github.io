import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {Opening} from "@/model/Opening";
import _ from "lodash";
import {usePgnsStore} from "../stores/pgnsStore";

export class GameOpeningFilter implements VideoFilter {
    constructor(
        private readonly opening: Opening,
    ) {
    }

    name(): string {
        return `${this.opening.name}`
    }

    test(video: Video): boolean {
        return (usePgnsStore().pgns.get(video.id) || [])
            .some(pgn => pgn.pgn.startsWith(this.opening.moves))
    }

    equals(other: VideoFilter): boolean {
        return other instanceof GameOpeningFilter
            && _.isEqual(this.opening, other.opening)
    }
}
