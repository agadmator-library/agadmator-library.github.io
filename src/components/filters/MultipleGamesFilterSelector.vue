<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import {ref} from "vue";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {MultipleGamesFilter} from "@/filter/MultipleGamesFilter";
import {VideoFilter} from "@/model/VideoFilter";

const emits = defineEmits(['addFilter', 'removeFilter'])

const checked = ref<boolean>(false)

function onChange() {
  if (checked.value) {
    emits('addFilter', new AddVideoFilterEvent(new MultipleGamesFilter()))
  } else {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof MultipleGamesFilter))
  }
  checked.value = false
}

</script>

<template>
  <Checkbox inputId="multipleGamesCheckboxId" v-model="checked" :binary="true" @change="onChange"/>
  <label for="multipleGamesCheckboxId" class="ms-1"> Multiple games </label>
</template>

<style scoped>

</style>