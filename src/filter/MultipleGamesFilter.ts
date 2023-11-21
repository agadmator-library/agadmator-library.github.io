import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class MultipleGamesFilter implements VideoFilter {

    name(): string {
        return 'Multiple games'
    }

    test(video: Video): boolean {
        return video.games.length > 1
    }

    equals(other: VideoFilter): boolean {
        return other instanceof MultipleGamesFilter
    }
}
