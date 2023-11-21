import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class TitleFilter implements VideoFilter {

    private readonly titleLowerCased: string

    constructor(
        private readonly title: string,
    ) {
        this.titleLowerCased = title.toLowerCase()
    }

    name(): string {
        return `Title contains: ${this.titleLowerCased}`
    }

    test(video: Video): boolean {
        return video.title.toLowerCase().includes(this.titleLowerCased)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof TitleFilter
            && this.titleLowerCased === other.titleLowerCased
    }
}
