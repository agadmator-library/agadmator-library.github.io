import {defineStore} from 'pinia'
import {Opening} from "@/model/Opening";
import {usePgnsStore} from "./pgnsStore";

export const useOpeningsStore = defineStore('openings', {
    state: () => ({
        openings: new Array<Opening>()
    }),
    getters: {
        getOpeningsForVideoGame: (state) => {
            return (videoId: string, gameIdx: number) => {
                const pgns = usePgnsStore().getPgnsForVideo(videoId)
                const pgn = pgns[gameIdx]
                if (pgn) {
                    return state.openings
                        .filter((opening: Opening) => pgn.pgn.startsWith(opening.moves))
                        .sort((left: Opening, right: Opening) => right.moves.length - left.moves.length)
                } else {
                    return []
                }
            }
        }
    },
    actions: {
        async fetchOpenings() {
            if (this.openings.length > 0) {
                return
            }
            const response = await fetch(`generated/${window.__references.openingsSlim}`)
            this.openings = await response.json()
        }
    }
})