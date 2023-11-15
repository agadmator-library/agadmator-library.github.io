<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {LengthFromFilter} from "@/filter/LengthFromFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const length = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let length = event.value;
  if (!length) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof LengthFromFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof LengthFromFilter,
        new LengthFromFilter(length)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="length" :min="0" @input="onInput" placeholder="Length from" :useGrouping="false"/>
</template>

<style scoped>

</style>