<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import {ref} from "vue";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {AtLeastOneGameFilter} from "@/filter/AtLeastOneGameFilter";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";

const emits = defineEmits(['addFilter', 'removeFilter'])

const checked = ref<boolean>(false)

function onChange() {
  if (checked.value) {
    emits('addFilter', new AddVideoFilterEvent(new AtLeastOneGameFilter()))
  } else {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof AtLeastOneGameFilter))
  }
  checked.value = false
}

</script>

<template>
  <Checkbox inputId="atLeastOneGameCheckboxId" v-model="checked" :binary="true" @change="onChange"/>
  <label for="atLeastOneGameCheckboxId" class="ms-1">At least one game </label>
</template>

<style scoped>

</style>