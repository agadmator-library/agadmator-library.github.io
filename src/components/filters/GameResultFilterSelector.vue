<script setup lang="ts">
import {ref} from "vue";
import Dropdown from 'primevue/dropdown';
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {GameResultFilter} from "@/filter/GameResultFilter";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {GameResult} from "@/model/GameResult";

const emits = defineEmits(['addFilter', 'removeFilter'])

const options = ["Any result", "White won", "Black won", "Draw"]
const selected = ref<string>(options[0])

function onChange() {
  emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof GameResultFilter))

  if (selected.value === 'White won') {
    emits('addFilter', new AddVideoFilterEvent(new GameResultFilter(GameResult.WHITE_WON)))
  } else if (selected.value === 'Black won') {
    emits('addFilter', new AddVideoFilterEvent(new GameResultFilter(GameResult.BLACK_WON)))
  } else if (selected.value === 'Draw') {
    emits('addFilter', new AddVideoFilterEvent(new GameResultFilter(GameResult.DRAW)))
  }

  selected.value = options[0]
}

</script>

<template>
  <Dropdown v-model="selected" :options="options" @change="onChange"/>
</template>

<style scoped>

</style>