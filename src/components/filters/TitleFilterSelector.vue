<script setup lang="ts">
import InputText from 'primevue/inputtext';
import {ref, watch} from "vue";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {TitleFilter} from "@/filter/TitleFilter";
import {VideoFilter} from "@/model/VideoFilter";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";
import {AddVideoFilterEvent} from "@/event/AddVideoFilterEvent";

const emits = defineEmits(['addFilter', 'replaceFilter', 'removeFilter'])

const title = ref<string>('')

watch(title, (title, previousTitle) => {
  if (title !== '' && previousTitle === '') {
    emits('addFilter', new AddVideoFilterEvent(new TitleFilter(title)))
  } else if (title === '') {
    emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf instanceof TitleFilter))
  } else {
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof TitleFilter,
        new TitleFilter(title)
    ))
  }
})

</script>

<template>
  <InputText type="text" v-model="title" placeholder="Title contains"/>
</template>

<style scoped>

</style>