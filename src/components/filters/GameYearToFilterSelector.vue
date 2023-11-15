<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {GameYearToFilter} from "@/filter/GameYearToFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const year = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let year = event.value;
  if (!year) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof GameYearToFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof GameYearToFilter,
        new GameYearToFilter(year)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="year" :min="0" @input="onInput" placeholder="Year to" :useGrouping="false"/>
</template>

<style scoped>

</style>