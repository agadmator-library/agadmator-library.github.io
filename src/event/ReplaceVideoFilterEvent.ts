import {VideoFilter} from "@/model/VideoFilter";
import {OrFilter} from "@/filter/OrFilter";
import {AndFilter} from "@/filter/AndFilter";

export class ReplaceVideoFilterEvent {
    constructor(
        public readonly predicate: (vf: VideoFilter) => boolean,
        public readonly videoFilter: VideoFilter,
        public readonly replacementStrategy: ReplacementStrategy = REPLACE
    ) {
    }
}

export interface ReplacementStrategy {
    replace(existing: VideoFilter, proposition: VideoFilter): VideoFilter
}

export const REPLACE: ReplacementStrategy = {
    replace(existing: VideoFilter, proposition: VideoFilter): VideoFilter {
        return proposition;
    }
}

export const MERGE_OR: ReplacementStrategy = {
    replace(existing: VideoFilter, proposition: VideoFilter): VideoFilter {
        return new OrFilter(existing, proposition);
    }
}

export const MERGE_AND: ReplacementStrategy = {
    replace(existing: VideoFilter, proposition: VideoFilter): VideoFilter {
        return new AndFilter(existing, proposition);
    }
}