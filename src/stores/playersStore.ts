import {defineStore} from 'pinia'
import _ from "lodash";
import {useVideosStore} from "./videosStore";

export const usePlayersStore = defineStore('players', {
    state: () => ({
        players: <string>[]
    }),
    getters: {
        playersByOccurrences: (state) => {
            console.log("AAAA")
            let videos = useVideosStore().videos;
            let tmpPlayerNames = {}
            videos.filter(video => video.games.length > 0)
                .flatMap(video => video.games)
                .filter(game => game.white && game.black)
                .forEach(game => {
                    tmpPlayerNames[game.white] = tmpPlayerNames[game.white] ? tmpPlayerNames[game.white] + 1 : 1
                    tmpPlayerNames[game.black] = tmpPlayerNames[game.black] ? tmpPlayerNames[game.black] + 1 : 1
                })

            return _.orderBy(Object.keys(tmpPlayerNames)
                .map(name => {
                    return {
                        name: name,
                        count: tmpPlayerNames[name]
                    }
                }), ["count", "name"], ["desc", "asc"])
                .map(player => player.name)
        }
    },
    actions: {
        setPlayers(players: Array<String>) {
            this.players = players
        }
    }
})