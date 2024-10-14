<script setup lang="ts">
import { ref } from "vue";
import Dropdown from "primevue/dropdown";
import { RemoveVideoFilterEvent } from "@/event/RemovedVideoFilterEvent";
import { AddVideoFilterEvent } from "@/event/AddVideoFilterEvent";
import { VideoFilter } from "@/model/VideoFilter";
import { SacrificeFilter } from "@/filter/SacrificeFilter"; // Import the SacrificeFilter

const emits = defineEmits(["addFilter", "removeFilter"]);

const options = [
  { label: "Any Sacrifice", value: "Placeholder" },
  { label: "Queen Sacrifice", value: "Q" },
  { label: "Rook Sacrifice", value: "R" },
  { label: "Knight Sacrifice", value: "N" },
  { label: "Bishop Sacrifice", value: "B" },
];

const selected = ref<string | null>(options[0].value);

function onChange() {
  // TODO: Implement multiple piece sacrifices filter.
  // Remove the previous SacrificeFilter, if any
  emits(
    "removeFilter",
    new RemoveVideoFilterEvent(
      (vf: VideoFilter) => vf instanceof SacrificeFilter
    )
  );

  // Add the new SacrificeFilter based on the selected piece
  if (selected.value && selected.value !== "Placeholder") {
    emits(
      "addFilter",
      new AddVideoFilterEvent(new SacrificeFilter(selected.value))
    );
  }

  // Reset to "Any Sacrifice" after applying the filter
  selected.value = options[0].value;
}
</script>

<template>
  <Dropdown
    v-model="selected"
    :options="options"
    optionLabel="label"
    optionValue="value"
    @change="onChange"
  />
</template>

<style scoped></style>
