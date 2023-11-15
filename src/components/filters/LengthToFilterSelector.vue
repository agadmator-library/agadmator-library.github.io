<script setup lang="ts">
import InputNumber, {InputNumberInputEvent} from 'primevue/inputnumber';
import {ref} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {LengthToFilter} from "@/filter/LengthToFilter";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const length = ref<number>(undefined)

function onInput(event: InputNumberInputEvent) {
  let length = event.value;
  if (!length) {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof LengthToFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof LengthToFilter,
        new LengthToFilter(length)
    ))
  }
}

</script>

<template>
  <InputNumber v-model="length" :min="0" @input="onInput" placeholder="Length to" :useGrouping="false"/>
</template>

<style scoped>

</style>