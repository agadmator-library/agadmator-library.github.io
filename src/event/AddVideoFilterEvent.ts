import {VideoFilter} from "@/model/VideoFilter";

export class AddVideoFilterEvent {
    constructor(
        public readonly videoFilter: VideoFilter
    ) {
    }
}