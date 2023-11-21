<script setup lang="ts">
import Calendar from 'primevue/calendar';
import {ref, watch} from "vue";
import {VideoFilter} from "@/model/VideoFilter";
import {ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {PublishedToFilter} from "@/filter/PublishedToFilter";

const emits = defineEmits(['replaceFilter'])

const date = ref<Date>(undefined)


watch(date, (newDate, _) => {
  if (newDate) {
    newDate.setHours(23)
    newDate.setMinutes(59)
    newDate.setSeconds(59)
    newDate.setMilliseconds(999)
    const tmp = newDate.toDateString()
    emits('replaceFilter', new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof PublishedToFilter,
        new PublishedToFilter(new Date(tmp))
    ))
    date.value = undefined
  }
})

</script>

<template>
  <Calendar v-model="date" placeholder="Published to"/>
</template>

<style scoped>

</style>