import {defineStore} from 'pinia'
import {Opening} from "@/model/Opening";

export const useOpeningsStore = defineStore('openings', {
    state: () => ({
        openings: new Array<Opening>()
    }),
    actions: {
        async fetchOpenings() {
            if (this.openings.length > 0) {
                return
            }
            const response = await fetch(`generated/openings-slim.json`)
            this.openings = await response.json()
        }
    }
})