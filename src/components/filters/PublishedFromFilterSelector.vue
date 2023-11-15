<script setup lang="ts">
import Calendar from 'primevue/calendar';
import {ref, watch} from "vue";
import {PublishedFromFilter} from "@/filter/PublishedFromFilter";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";

const emits = defineEmits(['replaceFilter'])

const date = ref<Date>(undefined)

watch(date, (newDate, _) => {
  if (newDate) {
    const tmp = newDate.toDateString()
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof PublishedFromFilter,
        new PublishedFromFilter(new Date(tmp))
    ))
    date.value = undefined
  }
})

</script>

<template>
  <Calendar v-model="date" placeholder="Published from"/>
</template>

<style scoped>

</style>