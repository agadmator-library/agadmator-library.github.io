export class Pgn {

    readonly b4Played: boolean
    readonly queenCnt: number
    readonly underpromotion: boolean
    readonly movesCount: number

    constructor(
        readonly pgn: string
    ) {
        this.b4Played = /\d\.\s+b4/.test(pgn)
        this.queenCnt = 2 + (pgn.match(/=Q/g) || []).length
        this.underpromotion = (pgn.match(/=[^Q]/g) || []).length > 0
        this.movesCount = (pgn.match(/\d+\.\s/g || []).slice(-1)).map(n => parseInt(n))[0]
    }
}