<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import PrettyDate from "@/components/PrettyDate.vue";
import {Video} from "@/model/Video";
import {computed, ref} from "vue";
import {GameResult} from "@/model/GameResult";
import {Game} from "@/model/Game";
import {useOpeningsStore} from "@/stores/openingsStore";
import {usePgnsStore} from "@/stores/pgnsStore";
import {Opening} from "@/model/Opening";
import _ from "lodash";
import VideoDetails from "@/components/VideoDetails.vue";

class VideoRow {

  public readonly publishedAt: Date
  public readonly title: string
  public readonly white: string
  public readonly black: string
  public readonly firstGameDate: string

  constructor(
      public readonly video: Video
  ) {
    this.publishedAt = video.date
    this.title = video.title
    this.white = ((video.games || [])[0] || {}).white
    this.black = ((video.games || [])[0] || {}).black
    this.firstGameDate = ((video.games || [])[0] || {}).date
  }


}

const props = defineProps({
  videos: Array<Video>
})
const videosRows = computed(() => props.videos.map(v => new VideoRow(v)))
const expandedRows = ref([]);

const publishedVisible = ref(window.innerWidth > 1000)
const titleVisible = ref(true)
const whiteVisible = ref(true)
const blackVisible = ref(true)
const gamesDatesVisible = ref(window.innerWidth > 1000)
const resultVisible = ref(false)
const openingsVisible = ref(false)

const pgnsStore = usePgnsStore();
const openingsStore = useOpeningsStore()

function formatTitle(title: string): string {
  let length = 45
  if (window.innerWidth > 1000) {
    length = 60
  }
  return _.truncate(title, {
    'length': length,
    'omission': '...'
  })
}

function formatResult(gameResult: GameResult): string {
  switch (gameResult) {
    case GameResult.WHITE_WON:
      return "White"
    case GameResult.BLACK_WON:
      return "Black"
    case GameResult.DRAW:
      return "Draw"
  }
}

function getOpeningsForGame(video: Video, game: Game): string[] {
  const idx = video.games.indexOf(game);
  const pgns = pgnsStore.getPgnsForVideo(video.id)
  const pgn = pgns[idx]
  if (pgn) {
    return openingsStore
        .openings
        .filter((opening: Opening) => pgn.pgn.startsWith(opening.moves))
        .sort((left: Opening, right: Opening) => right.moves.length - left.moves.length)
        .map((opening: Opening) => opening.name)
  } else {
    return []
  }
}

</script>

<template>
  <div class="row mt-2">
    <DataTable :value="videosRows" v-model:expandedRows="expandedRows" paginator :rows="20"
               :rowsPerPageOptions="[20, 50, 100]"
               sortField="publishedAt" :sortOrder="-1" tableStyle="min-width: 50rem">
      <template #header>
        <div class="row">
          <span>
          <span style="width:auto">{{ videosRows.length }} videos found</span>
          <span style="float:right" data-bs-toggle="collapse"
                href="#tableProperties" aria-expanded="false" aria-controls="tableProperties">☰</span>
          </span>
        </div>
        <div class="row collapse hide mt-2" id="tableProperties">
          <div class="row mt-1">
            <span>Visible columns</span>
          </div>
          <div class="row">
            <div class="col">
              <Checkbox v-model="publishedVisible" :binary="true" inputId="publishedVisible"/>
              <label for="publishedVisible" class="ms-1">Published</label>
            </div>
            <div class="col">
              <Checkbox v-model="titleVisible" :binary="true" inputId="titleVisible"/>
              <label for="titleVisible" class="ms-1">Title</label>
            </div>
            <div class="col">
              <Checkbox v-model="whiteVisible" :binary="true" inputId="whiteVisible"/>
              <label for="whiteVisible" class="ms-1">White</label>
            </div>
            <div class="col">
              <Checkbox v-model="blackVisible" :binary="true" inputId="blackVisible"/>
              <label for="blackVisible" class="ms-1">Black</label>
            </div>
            <div class="col">
              <Checkbox v-model="gamesDatesVisible" :binary="true" inputId="gamesDatesVisible"/>
              <label for="gamesDatesVisible" class="ms-1">Games dates</label>
            </div>
            <div class="col">
              <Checkbox v-model="resultVisible" :binary="true" inputId="resultVisible"/>
              <label for="resultVisible" class="ms-1">Result</label>
            </div>
            <div class="col">
              <Checkbox v-model="openingsVisible" :binary="true" inputId="openingsVisible"/>
              <label for="openingsVisible" class="ms-1">Openings</label>
            </div>
          </div>
        </div>
      </template>
      <Column expander style="width: 1rem"/>
      <Column field="publishedAt" sortable header="Published" v-if="publishedVisible">
        <template #body="slotProps">
          <PrettyDate :date=slotProps.data.publishedAt></PrettyDate>
        </template>
      </Column>
      <Column field="title" sortable header="Title" v-if="titleVisible">
        <template #body="slotProps">
          <a :href="`https://www.youtube.com/watch?v=${slotProps.data.video.id}`" target="_blank" data-toggle="tooltip"
             data-placement="top" :title="`${slotProps.data.title}`">
            {{ formatTitle(slotProps.data.title) }}</a>
        </template>
      </Column>
      <Column field="white" header="White" sortable v-if="whiteVisible">
        <template #body="slotProps">
          <template v-for="(game, idx) in slotProps.data.video.games">
            <hr v-if="idx > 0"/>
            <span style="display: block" :class="{ 'fw-bold': resultVisible && game.result === GameResult.WHITE_WON}">
            {{ game.white }}
          </span>
          </template>
        </template>
      </Column>
      <Column field="black" sortable header="Black" v-if="blackVisible">
        <template #body="slotProps">
          <template v-for="(game, idx) in slotProps.data.video.games">
            <hr v-if="idx > 0"/>
            <span style="display: block"
                  :class="{ 'fw-bold': resultVisible && game.result === GameResult.BLACK_WON}">
            {{ game.black }}
          </span>
          </template>
        </template>
      </Column>
      <Column field="firstGameDate" sortable header="Games dates" v-if="gamesDatesVisible">
        <template #body="slotProps">
          <template v-for="(game, idx) in slotProps.data.video.games">
            <hr v-if="idx > 0"/>
            <span style="display: block">{{ game.date }}</span>
          </template>
        </template>
      </Column>
      <Column header="Result" v-if="resultVisible">
        <template #body="slotProps">
          <template v-for="(game, idx) in slotProps.data.video.games">
            <hr v-if="idx > 0"/>
            <span style="display: block">
            {{ formatResult(game.result) }}
          </span>
          </template>
        </template>
      </Column>
      <Column header="Openings" v-if="openingsVisible">
        <template #body="slotProps">
          <template v-for="(game, idx) in slotProps.data.video.games">
            <hr v-if="idx > 0"/>
            <span style="display: block">
            <span v-for="opening in getOpeningsForGame(slotProps.data.video, game)" style="display: block">
              {{ opening }}
            </span>
          </span>
          </template>
        </template>
      </Column>
      <template #expansion="slotProps">
        <VideoDetails :video="slotProps.data.video"></VideoDetails>
      </template>
    </DataTable>
  </div>

</template>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > :nth-child(odd of tr:not(.p-datatable-row-expansion))) {
  background: rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable .p-datatable-tbody > :nth-child(odd of tr:not(.p-datatable-row-expansion)) + .p-datatable-row-expansion) {
  background: rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.3rem 0.3rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem;
  background:rgba(0, 0, 0, 0.25);
}

:deep(.p-datatable .p-datatable-header) {
  padding: 0.5rem 0.5rem;
}

</style>