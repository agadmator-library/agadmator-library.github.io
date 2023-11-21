<script setup lang="ts">
import AutoComplete, {AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent} from 'primevue/autocomplete';
import {ref} from "vue";
import {GameOpeningFilter} from "@/filter/GameOpeningFilter";
import {MERGE_OR, ReplaceVideoFilterEvent} from "@/event/ReplaceVideoFilterEvent";
import {VideoFilter} from "@/model/VideoFilter";
import {OrFilter} from "@/filter/OrFilter";
import {useOpeningsStore} from "@/stores/openingsStore";

const emit = defineEmits(['replaceFilter'])

const openingStore = useOpeningsStore();

const opening = ref<string>("")
const openingsSuggestions = ref<Array<string>>([])

function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}

function searchOpening(event: AutoCompleteCompleteEvent) {
  const normalizedQuery = normalizeText(event.query)
  openingsSuggestions.value = openingStore
      .openings
      .map(opening => opening.name)
      .filter(name => normalizeText(name).includes(normalizedQuery))
}

function itemSelect(event: AutoCompleteItemSelectEvent) {
  const openingItem = openingStore.openings.find(it => it.name === event.value);
  const filter = new GameOpeningFilter(openingItem)
  emit('replaceFilter', new ReplaceVideoFilterEvent(
      (vf: VideoFilter) => vf instanceof GameOpeningFilter || vf instanceof OrFilter && vf.right instanceof GameOpeningFilter,
      filter,
      MERGE_OR)
  )
  opening.value = ''
}

</script>

<template>
  <AutoComplete v-model="opening" :suggestions=openingsSuggestions @complete="searchOpening" forceSelection dropdown
                placeholder="Opening" @item-select="itemSelect" style="display:flex"/>
</template>

<style scoped>

</style>