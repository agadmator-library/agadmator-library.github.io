<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import {ref} from "vue";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {WhitePlayedB4Filter} from "@/filter/WhitePlayedB4Filter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";

const emits = defineEmits(['replaceFilter', 'removeFilter'])

const checked = ref<boolean>(false)

function onChange() {
  if (checked.value) {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof WhitePlayedB4Filter,
        new WhitePlayedB4Filter()
    ))
  } else {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof WhitePlayedB4Filter))
  }
  checked.value = false
}

</script>

<template>
  <Checkbox inputId="whitePlayedB4CheckboxId" v-model="checked" :binary="true" @change="onChange"/>
  <label for="whitePlayedB4CheckboxId" class="ms-1">White played b4</label>
</template>

<style scoped>

</style>