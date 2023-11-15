import {Video} from "@/model/Video";

export interface VideoFilter {
    name(): string
    test(video: Video): boolean
    equals(other: VideoFilter): boolean
}