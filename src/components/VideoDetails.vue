<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Video} from "@/model/Video";
import {parse} from 'tinyduration'
import humanizeDuration from "humanize-duration"
import {useOpeningsStore} from "@/stores/openingsStore";
import {Opening} from "@/model/Opening";

const props = defineProps({
  video: Video
})

const videoId = props.video.id

const openingsStore = useOpeningsStore()

const videoDetails = ref({})

onMounted(() => {
  fetch(`/db/${props.video.id}.json`)
      .then(response => response.json())
      .then(responseJson => videoDetails.value = responseJson)
})

function getThumbnailUrl(videoDetails: any): string {
  if (window.innerWidth > 1000) {
    return videoDetails.videoSnippet.thumbnail.high.url
  }
  return videoDetails.videoSnippet.thumbnail.medium.url
}

function getLichessGameEvaluation(videoDetails: any, idx: number): any {
  return ((videoDetails.lichessGameEval || [])[idx] || {})
}

function formatDuration(videoDetails: any): string {
  if (!videoDetails.videoContentDetails.duration) {
    return ""
  }
  const duration = parse(videoDetails.videoContentDetails.duration)
  return humanizeDuration((duration.seconds || 0) * 1000 + (duration.minutes || 0) * 60 * 1000 + (duration.hours || 0) * 60 * 60 * 1000)
}

function getOpeningsForGame(idx: number): string[] {
  return openingsStore.getOpeningsForVideoGame(props.video.id, idx)
      .map((opening: Opening) => opening.name)
}

</script>

<template>
  <div class="ps-3 pe-3">
    <ul class="nav nav-tabs" :id="`tab-${videoId}`" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" :id="`basic-${videoId}`" data-bs-toggle="tab"
                :data-bs-target="`#basic-${videoId}-tab-pane`"
                type="button" role="tab" :aria-controls="`basic-${videoId}-tab-pane`" aria-selected="true">Basic
        </button>
      </li>
      <li class="nav-item" role="presentation" v-for="(game, idx) in videoDetails.videoGame">
        <button class="nav-link" :id="`games-${videoId}-${idx}`" data-bs-toggle="tab"
                :data-bs-target="`#games-${videoId}-${idx}-tab-pane`"
                type="button" role="tab" :aria-controls="`games-${videoId}-${idx}-tab-pane`" aria-selected="false">Game
          {{ idx + 1 }}
        </button>
      </li>
    </ul>

    <div class="tab-content" :id="`tab-content-${videoId}`">
      <div class="tab-pane fade show active" :id="`basic-${videoId}-tab-pane`" role="tabpanel"
           aria-labelledby="basic-tab" tabindex="0">
        <template v-if="videoDetails && videoDetails.videoSnippet">
          <div class="row">
            <div class="col">
              <table class="table table-bordered">
                <tr>
                  <th>Title</th>
                  <td>{{ videoDetails.videoSnippet.title }}</td>
                </tr>
                <tr>
                  <th>Duration</th>
                  <td>{{ formatDuration(videoDetails) }}</td>
                </tr>
                <tr>
                  <th>Number of games</th>
                  <td>{{ videoDetails.videoGame.length || 0 }}</td>
                </tr>
              </table>
            </div>
            <div class="col">
              <img :src="getThumbnailUrl(videoDetails)">
            </div>
          </div>
        </template>
      </div>
      <div class="tab-pane fade" :id="`games-${videoId}-${idx}-tab-pane`" role="tabpanel" aria-labelledby="games-tab"
           :tabindex="idx+1" v-for="(game, idx) in videoDetails.videoGame">
        <div class="row">
          <div class="col">
            <table class="table table-bordered">
              <tr>
                <th>White</th>
                <td>{{ game.playerWhite }}</td>
              </tr>
              <tr>
                <th>Black</th>
                <td>{{ game.playerBlack }}</td>
              </tr>
              <tr>
                <th>Date</th>
                <td>{{ game.date }}</td>
              </tr>
              <tr>
                <th>Moves</th>
                <td>{{ game.pgn }}</td>
              </tr>
              <tr>
                <th>Final position</th>
                <td>{{ game.fen }}</td>
              </tr>
              <tr>
                <th>Result</th>
                <td>{{ (video.games[idx] || {}).result || "n/a" }}</td>
              </tr>
              <tr>
                <th>Openings</th>
                <td>
                  <span v-for="opening in getOpeningsForGame(idx)" style="display: block; background: inherit;">
                    {{ opening }}
                  </span>
                </td>
              </tr>
              <tr v-if="getLichessGameEvaluation(videoDetails, idx).id">
                <th>Game evaluation</th>
                <td>
                  <table class="table border mb-0 game-evaluation">
                    <thead>
                    <tr>
                      <th></th>
                      <th>White</th>
                      <th>Black</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <th>Inaccuarcy</th>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.white?.analysis?.inaccuracy}}</td>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.black?.analysis?.inaccuracy}}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <th>Mistake</th>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.white?.analysis?.mistake}}</td>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.black?.analysis?.mistake}}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <th>Blunder</th>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.white?.analysis?.blunder}}</td>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.black?.analysis?.blunder}}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <th>ACPL</th>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.white?.analysis?.acpl}}</td>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.black?.analysis?.acpl}}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <th>Accuracy</th>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.white?.analysis?.accuracy}}</td>
                      <td>{{getLichessGameEvaluation(videoDetails, idx)?.players?.black?.analysis?.accuracy}}</td>
                      <td></td>
                    </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr v-if="idx === 0 && videoDetails.chessCom && videoDetails.chessCom.href || idx === 0 && videoDetails.chesstempoCom && videoDetails.chesstempoCom.id || idx === 0 && videoDetails.chess365 && videoDetails.chess365.href || idx === 0 && videoDetails.lichessMasters && videoDetails.lichessMasters.id || getLichessGameEvaluation(videoDetails, idx).id">
                <th>External links</th>
                <td>
                  <a v-if="idx === 0 && videoDetails.chessCom && videoDetails.chessCom.href" :href="videoDetails.chessCom.href"
                     target="_blank" style="background: inherit">chess.com</a>
                  <a v-if="idx === 0 && videoDetails.chesstempoCom && videoDetails.chesstempoCom.id"
                     :href="`https://old.chesstempo.com/gamedb/game/${videoDetails.chesstempoCom.id}`" target="_blank"
                     style="background: inherit">chesstempo.com</a>
                  <a v-if="idx === 0 && videoDetails.chess365 && videoDetails.chess365.href" :href="videoDetails.chess365.href"
                     target="_blank" style="background: inherit">365chess.com</a>
                  <a v-if="idx === 0 && videoDetails.lichessMasters && videoDetails.lichessMasters.id"
                     :href="`https://lichess.org/${videoDetails.lichessMasters.id}`" target="_blank"
                     style="background: inherit">Lichess Masters</a>
                  <a v-if="getLichessGameEvaluation(videoDetails, idx).id"
                     :href="`https://lichess.org/${getLichessGameEvaluation(videoDetails, idx).id}`" target="_blank"
                     style="background: inherit">lichess.org</a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
table .game-evaluation {
  background: inherit
}
table .game-evaluation th {
  background: inherit
}
table .game-evaluation td {
  background: inherit
}
table .game-evaluation tr {
  background: inherit
}
</style>