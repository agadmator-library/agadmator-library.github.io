import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class AndFilter implements VideoFilter {
    constructor(
        private readonly left: VideoFilter,
        private readonly right: VideoFilter
    ) {
    }

    name(): string {
        return `(${this.left.name()}) AND (${this.right.name()})`
    }

    test(video: Video): boolean {
        return this.left.test(video) && this.right.test(video)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof AndFilter
            && this.left.equals(other.left)
            && this.right.equals(other.right)
    }
}
