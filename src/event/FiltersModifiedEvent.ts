import {VideoFilter} from "@/model/VideoFilter";

export class FiltersModifiedEvent {
    constructor(
        public readonly filters: Array<VideoFilter>
    ) {
    }
}