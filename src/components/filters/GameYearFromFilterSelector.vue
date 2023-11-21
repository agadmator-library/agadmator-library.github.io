<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {GameYearFromFilter} from "@/filter/GameYearFromFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const year = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let year = event.value;
  if (!year) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof GameYearFromFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof GameYearFromFilter,
        new GameYearFromFilter(year)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="year" :min="0" @input="onInput" placeholder="Year from" :useGrouping="false"/>
</template>

<style scoped>

</style>