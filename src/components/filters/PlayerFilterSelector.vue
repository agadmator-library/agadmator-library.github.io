<script setup lang="ts">
import AutoComplete, {AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent} from 'primevue/autocomplete';
import Dropdown from 'primevue/dropdown';
import {ref} from "vue";
import {PlayerSideFilter} from "@/filter/PlayerSideFilter";
import {Side} from "@/model/Side";
import {Result} from "@/model/Result";
import {AndFilter} from "@/filter/AndFilter";
import {SideResultFilter} from "@/filter/SideResultFilter";
import {OrFilter} from "@/filter/OrFilter";
import {VideoFilter} from "@/model/VideoFilter";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {usePlayersStore} from "@/stores/playersStore";

const emit = defineEmits(['addFilter'])

const sides = ["Any side", "White", "Black"]
const results = ["Any result", "Won", "Lost", "Draw"]

const player = ref<string>("")
const side = ref<string>(sides[0])
const result = ref<string>(results[0])
const playersSuggestions = ref<Array<string>>([])


function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function searchPlayers(event: AutoCompleteCompleteEvent) {
  const normalizedQuery = normalizeText(event.query)
  playersSuggestions.value = usePlayersStore().playersByOccurrences.filter(name => normalizeText(name).includes(normalizedQuery))
}

function itemSelect(event: AutoCompleteItemSelectEvent) {
  let sideEnum: Side | undefined;
  if (side.value === "Any side")
    sideEnum = undefined
  else if (side.value === "White")
    sideEnum = Side.WHITE
  else
    sideEnum = Side.BLACK

  let resultEnum: Result | undefined
  if (result.value === "Any result")
    resultEnum = undefined
  else if (result.value === "Won")
    resultEnum = Result.WIN
  else if (result.value === "Lost")
    resultEnum = Result.LOSE
  else
    resultEnum = Result.DRAW

  let filter: VideoFilter
  if (sideEnum && resultEnum) {
    filter = new AndFilter(
        new PlayerSideFilter(event.value, sideEnum),
        new SideResultFilter(sideEnum, resultEnum)
    )
  } else if (resultEnum === Result.DRAW) {
    filter = new AndFilter(
        new PlayerSideFilter(event.value, undefined),
        new SideResultFilter(undefined, Result.DRAW)
    )
  } else if (resultEnum) {
    filter = new OrFilter(
        new AndFilter(
            new PlayerSideFilter(event.value, Side.WHITE),
            new SideResultFilter(Side.WHITE, resultEnum)
        ),
        new AndFilter(
            new PlayerSideFilter(event.value, Side.BLACK),
            new SideResultFilter(Side.BLACK, resultEnum)
        )
    )
  } else if (sideEnum) {
    filter = new PlayerSideFilter(event.value, sideEnum)
  } else {
    filter = new PlayerSideFilter(event.value, undefined)
  }

  emit('addFilter', new AddVideoFilterEvent(filter))

  player.value = ''
  side.value = sides[0]
  result.value = results[0]
}

</script>

<template>
  <div class="col-auto px-1">
    <Dropdown v-model="side" :options="sides"/>
  </div>
  <div class="col-auto px-1">
    <Dropdown v-model="result" :options="results"/>
  </div>
  <div class="col px-1">
    <AutoComplete v-model="player" :suggestions=playersSuggestions @complete="searchPlayers" forceSelection dropdown
                  placeholder="Player" @item-select="event => itemSelect(event)" style="display:flex"/>
  </div>
</template>

<style scoped>

</style>