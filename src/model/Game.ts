import {GameResult} from "@/model/GameResult";

export class Game {
    constructor(
        public readonly white: string,
        public readonly black: string,
        public readonly result?: GameResult | undefined,
        public readonly date?: string
    ) {
    }

    getYear(): number | undefined {
        if (this.date) {
            return parseInt(this.date.slice(0,4))
        } else {
            return undefined
        }
    }
}