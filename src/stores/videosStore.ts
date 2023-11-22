import {defineStore} from 'pinia'
import {Video} from "@/model/Video";
import {GameResult} from "../model/GameResult";
import {Game} from "../model/Game";
import {usePlayersStore} from "./playersStore";

export const useVideosStore = defineStore('videos', {
    state: () => ({
        videos: <Video>[]
    }),
    actions: {
        async fetchVideos() {
            const response = await fetch(`generated/${window.__references.db}`)
            const body = await response.json()

            function decodeResult(result: number): GameResult | undefined {
                switch (result) {
                    case 1:
                        return GameResult.WHITE_WON
                    case 0:
                        return GameResult.DRAW
                    case -1:
                        return GameResult.BLACK_WON
                    default:
                        return null
                }
            }

            this.videos = body.videos
                .map(dbVideo => {
                    const games: Game[] = dbVideo.g
                        ? dbVideo.g.map(g => {
                                return new Game(
                                    body.players[g.w],
                                    body.players[g.b],
                                    decodeResult(g.r),
                                    g.d,
                                )
                            }
                        )
                        : []
                    return new Video(
                        dbVideo.id,
                        dbVideo.t,
                        new Date(dbVideo.d * 1000),
                        games,
                        dbVideo.l
                    )
                })

            usePlayersStore().setPlayers(body.players)
        }
    }
})