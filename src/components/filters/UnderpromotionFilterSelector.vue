<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import {ref} from "vue";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {UnderpromotionFilter} from "@/filter/UnderpromotionFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const checked = ref<boolean>(false)

function onChange() {
  if (checked.value) {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof UnderpromotionFilter,
        new UnderpromotionFilter()
    ))
  } else {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof UnderpromotionFilter))
  }
  checked.value = false
}

</script>

<template>
  <Checkbox inputId="underpromotionCheckboxId" v-model="checked" :binary="true" @change="onChange"/>
  <label for="underpromotionCheckboxId" class="ms-1">Underpromotion</label>
</template>

<style scoped>

</style>