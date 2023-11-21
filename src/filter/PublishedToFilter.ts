import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";
import {prettyDate} from "@/util/time";

export class PublishedToFilter implements VideoFilter {
    constructor(
        private readonly date: Date,
    ) {
    }

    name(): string {
        return `Published to ${prettyDate(this.date)}`
    }

    test(video: Video): boolean {
        return video.date <= this.date
    }

    equals(other: VideoFilter): boolean {
        return other instanceof PublishedToFilter
        && this.date === other.date
    }
}
