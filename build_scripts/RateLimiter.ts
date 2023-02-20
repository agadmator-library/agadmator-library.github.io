export class RateLimiter {
    private readonly minimalDelay: number
    private lastCall: number = 0
    constructor(minimalDelay: number) {
        this.minimalDelay = minimalDelay
    }

    public async assertDelay() {
        let now = new Date().getTime();
        if (now - this.lastCall < this.minimalDelay) {
            await new Promise(r => setTimeout(r, this.minimalDelay - (now - this.lastCall)));
        }
        this.lastCall = new Date().getTime();
    }
}
