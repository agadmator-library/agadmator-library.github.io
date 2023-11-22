import {defineStore} from 'pinia'
import _ from "lodash";
import {Pgn} from "../model/Pgn";

export const usePgnsStore = defineStore('pgns', {
    state: () => ({
        pgns: new Map<string, Array<Pgn>>()
    }),
    getters: {
        getPgnsForVideo: (state) => {
            return (videoId: string) => {
                return state.pgns.get(videoId) || []
            }
        }
    },
    actions: {
        async fetchPgns() {
            if (this.pgns.size > 0) {
                return
            }

            const response = await fetch(`generated/${window.__references.pgns}`)
            const responseJson = await response.json()
            _.keys(responseJson).forEach(key => {
                const rawPgns: Array<String> = responseJson[key] || []
                this.pgns.set(key, rawPgns.map(rawPgn => new Pgn(rawPgn)))
            })
        }
    }
})