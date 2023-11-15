import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class TemplateFilter implements VideoFilter {
    constructor(
        private readonly t: string,
    ) {
    }

    name(): string {
        return this.t
    }

    test(video: Video): boolean {
        return video.games.some(game => {
           // TODO
        })
    }

    equals(other: VideoFilter): boolean {
        return other instanceof TemplateFilter
    }
}
