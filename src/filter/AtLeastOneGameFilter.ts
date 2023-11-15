import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class AtLeastOneGameFilter implements VideoFilter {

    name(): string {
        return 'At least one game'
    }

    test(video: Video): boolean {
        return video.games.length > 0
    }

    equals(other: VideoFilter): boolean {
        return other instanceof AtLeastOneGameFilter
    }
}
