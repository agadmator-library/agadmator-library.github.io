import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {prettyDate} from "@/util/time";

export class PublishedFromFilter implements VideoFilter {
    constructor(
        private readonly date: Date,
    ) {
    }

    name(): string {
        return `Published from ${prettyDate(this.date)}`
    }

    test(video: Video): boolean {
        return video.date >= this.date
    }

    equals(other: VideoFilter): boolean {
        return other instanceof PublishedFromFilter
            && this.date === other.date
    }
}
