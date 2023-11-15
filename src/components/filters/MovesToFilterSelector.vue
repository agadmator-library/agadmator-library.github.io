<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {MovesToFilter} from "@/filter/MovesToFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const movesCount = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let count = event.value;
  if (!count) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof MovesToFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof MovesToFilter,
        new MovesToFilter(count)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="movesCount" :min="0" @input="onInput" placeholder="Moves count to" :useGrouping="false"/>
</template>

<style scoped>

</style>