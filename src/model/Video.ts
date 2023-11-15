import {Game} from "@/model/Game";

export class Video {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly date: Date,
        public readonly games: Game[],
        public readonly length: number
    ) {
    }

    getWhites(): string[] {
        return this.games.map(game => game.white)
    }

    getBlacks(): string[] {
        return this.games.map(game => game.black)
    }

    getGameDates(): string[] {
        return this.games.map(game => game.date)
    }
}