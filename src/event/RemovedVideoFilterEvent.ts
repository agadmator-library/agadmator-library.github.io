import {VideoFilter} from "@/model/VideoFilter";

export class RemoveVideoFilterEvent {
    constructor(
        public readonly predicate: (vf: VideoFilter) => boolean
    ) {
    }
}