import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class LengthFromFilter implements VideoFilter {
    constructor(
        private readonly length: number,
    ) {
    }

    name(): string {
        return `Length from ${this.length}`
    }

    test(video: Video): boolean {
        return video.length >= this.length
    }

    equals(other: VideoFilter): boolean {
        return other instanceof LengthFromFilter
            && this.length == other.length
    }
}
