<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Video} from "@/model/Video";

const props = defineProps({
  video: Video
})

const videoId = props.video.id

const videoDetails = ref({})

onMounted(() => {
  fetch(`/db/${props.video.id}.json`)
      .then(response => response.json())
      .then(responseJson => videoDetails.value = responseJson)
})

</script>

<template>
  <div class="p-3">
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
                  <th>Length</th>
                  <td>{{ videoDetails.videoContentDetails.duration }}</td>
                </tr>
                <tr>
                  <th>Number of games</th>
                  <td>{{ videoDetails.videoGame.length || 0 }}</td>
                </tr>
              </table>
            </div>
            <div class="col">
              <img :src="videoDetails.videoSnippet.thumbnail.standard.url">
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
                <th>White</th>
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
                <td>{{(video.games[idx] || {}).result || "n/a"}}</td>
              </tr>
            </table>
          </div>
          <div class="col" v-if="videoDetails.chessCom && videoDetails.chessCom.href">
            <table class="table table-bordered">
              <tr>
                <th>Source</th>
                <td><a :href="videoDetails.chessCom.href" target="_blank" style="background: inherit">chess.com</a></td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chessCom.playerWhite}}</td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chessCom.playerBlack}}</td>
              </tr>
              <tr>
                <th>Result</th>
                <td>{{videoDetails.chessCom.result}}</td>
              </tr>
              <tr>
                <th>Moves count</th>
                <td>{{videoDetails.chessCom.movesCount}}</td>
              </tr>
              <tr>
                <th>Year</th>
                <td>{{videoDetails.chessCom.year}}</td>
              </tr>
            </table>
          </div>
          <div class="col" v-if="videoDetails.chesstempoCom && videoDetails.chesstempoCom.id">
            <table class="table table-bordered">
              <tr>
                <th>Source</th>
                <td><a :href="`https://old.chesstempo.com/gamedb/game/${videoDetails.chesstempoCom.id}`" target="_blank" style="background: inherit">chesstempo.com</a></td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chesstempoCom.playerWhite}}</td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chesstempoCom.playerBlack}}</td>
              </tr>
              <tr>
                <th>Result</th>
                <td>{{videoDetails.chesstempoCom.result}}</td>
              </tr>
              <tr>
                <th>Moves count</th>
                <td>{{videoDetails.chesstempoCom.movesCount}}</td>
              </tr>
              <tr v-if="videoDetails.chesstempoCom.date">
                <th>Date</th>
                <td>{{videoDetails.chesstempoCom.date}}</td>
              </tr>
              <tr v-if="videoDetails.chesstempoCom.site">
                <th>Site</th>
                <td>{{videoDetails.chesstempoCom.site}}</td>
              </tr>
              <tr v-if="videoDetails.chesstempoCom.event">
                <th>Event</th>
                <td>{{videoDetails.chesstempoCom.event}}</td>
              </tr>
              <tr v-if="videoDetails.chesstempoCom.round">
                <th>Round</th>
                <td>{{videoDetails.chesstempoCom.round}}</td>
              </tr>
            </table>
          </div>
          <div class="col" v-if="videoDetails.chess365 && videoDetails.chess365.href">
            <table class="table table-bordered">
              <tr>
                <th>Source</th>
                <td><a :href="videoDetails.chess365.href" target="_blank" style="background: inherit">365chess.com</a></td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chess365.playerWhite}}</td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.chess365.playerBlack}}</td>
              </tr>
              <tr>
                <th>Result</th>
                <td>{{videoDetails.chess365.result}}</td>
              </tr>
              <tr>
                <th>Moves count</th>
                <td>{{videoDetails.chess365.movesCount}}</td>
              </tr>
              <tr v-if="videoDetails.chess365.year">
                <th>Year</th>
                <td>{{videoDetails.chess365.year}}</td>
              </tr>
              <tr v-if="videoDetails.chess365.tournament">
                <th>Tournament</th>
                <td>{{videoDetails.chess365.tournament}}</td>
              </tr>
            </table>
          </div>
          <div class="col" v-if="videoDetails.lichessMasters && videoDetails.lichessMasters.id">
            <table class="table table-bordered">
              <tr>
                <th>Source</th>
                <td><a :href="`https://lichess.org/${videoDetails.lichessMasters.id}`" target="_blank" style="background: inherit">lichess.org</a></td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.lichessMasters.playerWhite}}</td>
              </tr>
              <tr>
                <th>White</th>
                <td>{{videoDetails.lichessMasters.playerBlack}}</td>
              </tr>
              <tr>
                <th>Winner</th>
                <td>{{videoDetails.lichessMasters.winner}}</td>
              </tr>
              <tr v-if="videoDetails.lichessMasters.year">
                <th>Year</th>
                <td>{{videoDetails.lichessMasters.year}}</td>
              </tr>
              <tr v-if="videoDetails.lichessMasters.month">
                <th>Month</th>
                <td>{{videoDetails.lichessMasters.month}}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>