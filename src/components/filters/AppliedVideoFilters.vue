<script setup lang="ts">

import {VideoFilter} from "@/model/VideoFilter";
import {RemoveVideoFilterEvent} from "@/event/RemovedVideoFilterEvent";

const emits = defineEmits(['removeFilter'])

const props = defineProps({
  filters: Array<VideoFilter>
})

function onBadgeClicked(filter: VideoFilter) {
  emits('removeFilter', new RemoveVideoFilterEvent((vf: VideoFilter) => vf.equals(filter)))
}

function onClearFiltersClicked() {
  emits('removeFilter', new RemoveVideoFilterEvent(() => true))
}

function isLarge() {
  return window.innerWidth > 1000
}

</script>

<template>

  <div class="card mt-2">
    <div class="card-header" data-bs-toggle="collapse"
         href="#filtersContainerBody" aria-expanded="false" aria-controls="filtersContainerBody">
      Filters applied
      <span class="badge text-bg-primary">{{filters.length}}</span>
      <button class="btn btn-light float-end p-0" type="button">
        &#x21D5;
      </button>
    </div>

    <div class="card-body collapse" :class="[isLarge() ? 'show' : '']" id="filtersContainerBody">
      <div id="filtersContainer">
        <template v-for="filter in filters">
          <span class="badge text-bg-secondary m-1" @click="onBadgeClicked(filter)">{{ filter.name() }}</span>
        </template>
      </div>
      <button id="clearFilterButton" type="submit" class="btn btn-primary float-end" @click="onClearFiltersClicked">
        Clear filters
      </button>
    </div>
  </div>

</template>

<style scoped>

</style>