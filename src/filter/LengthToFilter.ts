import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class LengthToFilter implements VideoFilter {
    constructor(
        private readonly length: number,
    ) {
    }

    name(): string {
        return `Length to ${this.length}`
    }

    test(video: Video): boolean {
        return video.length <= this.length
    }

    equals(other: VideoFilter): boolean {
        return other instanceof LengthToFilter
            && this.length == other.length
    }
}
