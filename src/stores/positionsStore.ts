import {defineStore} from 'pinia'
import _ from "lodash";

class FenShortener {
    shrink(fen: string): string {
        return fen
            .replaceAll(/[^/]+\d\//g, match => match.substring(0, match.length - 2) + "/")
            .replaceAll(/\/(8\/)+/g, match => match.replaceAll("8", ""))
            .replaceAll("8/", "_")
            .replaceAll("/8", "`")
            .replaceAll(/p{4,}|P{3,}/g, match => match[0] + "*" + match.length)
            .replaceAll(" w ", " ")
            .replaceAll(" - - ", "^")
            .replaceAll("0 1", "a")
            .replaceAll(/\/{4,}/g, match => "/*" + match.length)
            .replaceAll("ppp", "c")
            .replaceAll("pp", "d")
            .replaceAll("PPP", "e")
            .replaceAll("PP", "f")
            .replaceAll("rnbqkbnr", "g")
            .replaceAll("RNBQKBNR", "h")
            .replaceAll("r1bqkbnr", "i")
            .replaceAll("RNBQKB1R", "j")
            .replaceAll(" b KQkq", "l")
            .replaceAll("KQkq", "m")
            .replaceAll("r1bqkb1r", "o")
            .replaceAll("R1BQKB1R", "s")
            .replaceAll("rnbqk2r", "t")
            .replaceAll("RNBQK2Rl", "u")
    }

    expand(fen: string): string {
        let tmp = fen

        tmp = tmp
            .replaceAll("u", "RNBQK2Rl")
            .replaceAll("t", "rnbqk2r")
            .replaceAll("s", "R1BQKB1R")
            .replaceAll("o", "r1bqkb1r")
            .replaceAll("m", "KQkq")
            .replaceAll("l", " b KQkq")
            .replaceAll("j", "RNBQKB1R")
            .replaceAll("i", "r1bqkbnr")
            .replaceAll("h", "RNBQKBNR")
            .replaceAll("g", "rnbqkbnr")
            .replaceAll("f", "PP")
            .replaceAll("e", "PPP")
            .replaceAll("d", "pp")
            .replaceAll("c", "ppp")
            .replaceAll(/\/\*\d/g, match => "/".repeat(parseInt(match[2])))
            .replaceAll("a", "0 1")
            .replaceAll("^", " - - ")

        if (!tmp.includes(" b ")) {
            let firstSpace = tmp.indexOf(" ");
            tmp = tmp.substring(0, firstSpace) + " w" + tmp.substring(firstSpace)
        }

        tmp = tmp
            .replaceAll(/[pP]\*\d/g, match => match[0].repeat(parseInt(match[2])))
            .replaceAll("`", "/8")
            .replaceAll("_", "8/")
            .replaceAll(/\/\/+/g, match => match.split("").join("8"));

        tmp = tmp
            .replaceAll(/[^/]*[^\d/]\//g, match => {
                let remaining = 8 - match.substring(0, match.length - 1)
                    .split("")
                    .map(el => /\d/.test(el) ? parseInt(el) : 1)
                    .reduce((previousValue, currentValue) => previousValue + currentValue)
                if (remaining > 0) {
                    return `${match.substring(0, match.length - 1) + remaining}/`
                } else {
                    return match
                }
            })

        return tmp
    }
}

export const fenShortener = new FenShortener()

export const usePositionsStore = defineStore('positions', {
    state: () => ({
        positions: new Map<string, Array<string>>
    }),
    getters: {
        inVideo: (state) => {
            return (position: string, videoId: string) => {
                return (state.positions.get(position) || []).indexOf(videoId) >= 0
            }
        }
    },
    actions: {
        async fetchPositions() {
            if (this.positions.size > 0) {
                return
            }
            const response = await fetch(`generated/positions.json`)
            const responseJson = await response.json()
            _.keys(responseJson).forEach(position => {
                let idxList: Array<Nubmer>;
                if (typeof responseJson[position] === 'number') {
                    idxList = [responseJson[position]]
                } else {
                    idxList = responseJson[position]
                }

                this.positions.set(position, idxList.map(idx => responseJson.videos[idx]))
            })
        }
    }
})