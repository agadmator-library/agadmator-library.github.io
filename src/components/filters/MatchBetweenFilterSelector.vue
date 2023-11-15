<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import AutoComplete, {AutoCompleteCompleteEvent} from 'primevue/autocomplete';
import {ref} from "vue";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {MatchBetweenFilter} from "@/filter/MatchBetweenFilter";
import {usePlayersStore} from "@/stores/playersStore";

const emit = defineEmits(['addFilter'])

const playerLeft = ref<string>("")
const playerRight = ref<string>("")
const playersSuggestions = ref<Array<string>>([])


function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function searchPlayers(event: AutoCompleteCompleteEvent) {
  const normalizedQuery = normalizeText(event.query)
  playersSuggestions.value = usePlayersStore().playersByOccurrences.filter(name => normalizeText(name).includes(normalizedQuery))
}

function itemSelect() {
  if (playerLeft.value && playerRight.value) {
    emit('addFilter', new AddVideoFilterEvent(new MatchBetweenFilter(playerLeft.value, playerRight.value)))
    playerLeft.value = ''
    playerRight.value = ''
  }
}

</script>

<template>
  <div class="row align-items-start">
    <div class="col input-group">
      <div class="col">
        <AutoComplete v-model="playerLeft" :suggestions=playersSuggestions @complete="searchPlayers" forceSelection
                      dropdown
                      placeholder="Player" @item-select="itemSelect" style="display:flex"/>
      </div>
      <span class="input-group-text d-none d-lg-block">vs</span>

      <div class="col">
        <AutoComplete v-model="playerRight" :suggestions=playersSuggestions @complete="searchPlayers" forceSelection
                      dropdown
                      placeholder="Player" @item-select="itemSelect" style="display:flex"/>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>