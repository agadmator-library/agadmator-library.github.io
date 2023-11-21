import {VideoFilter} from "@/model/VideoFilter";
import {Video} from "@/model/Video";

export class OrFilter implements VideoFilter {
    constructor(
        private readonly left: VideoFilter,
        private readonly right: VideoFilter
    ) {
    }

    name(): string {
        return `(${this.left.name()}) OR (${this.right.name()})`
    }

    test(video: Video): boolean {
        return this.left.test(video) || this.right.test(video)
    }

    equals(other: VideoFilter): boolean {
        return other instanceof OrFilter
            && this.left.equals(other.left)
            && this.right.equals(other.right)
    }
}
