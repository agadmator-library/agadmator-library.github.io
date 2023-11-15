<script setup lang="ts">
import {ref} from "vue";
import Dropdown from 'primevue/dropdown';
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {QueenCountFilter} from "@/filter/QueenCountFilter";

const emits = defineEmits(['addFilter', 'removeFilter'])

const options = ["Any queen count", ">= 3", ">= 4", ">= 5", ">= 6"]
const selected = ref<string>(options[0])

function onChange() {
  emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof QueenCountFilter))

  if (selected.value.startsWith(">=")) {
    const minCount = parseInt(selected.value.slice(selected.value.length - 1))
    emits('addFilter', new AddVideoFilterEvent(new QueenCountFilter(minCount)))
  }
  selected.value = options[0]
}

</script>

<template>
  <Dropdown v-model="selected" :options="options" @change="onChange"/>
</template>

<style scoped>

</style>