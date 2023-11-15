<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {MovesFromFilter} from "@/filter/MovesFromFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const movesCountFrom = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let count = event.value;
  if (!count) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof MovesFromFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof MovesFromFilter,
        new MovesFromFilter(count)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="movesCountFrom" :min="0" @input="onInput" placeholder="Moves count from" :useGrouping="false"/>
</template>

<style scoped>

</style>