<script setup lang="ts">
import Checkbox from "primevue/checkbox";
import { ref } from "vue";
import { RemoveVideoFilterEvent } from "@/event/RemovedVideoFilterEvent";
import { VideoFilter } from "@/model/VideoFilter";
import { QueenSacrificeFilter } from "@/filter/QueenSacrificeFilter";
import { ReplaceVideoFilterEvent } from "@/event/ReplaceVideoFilterEvent";

const emits = defineEmits(["replaceFilter", "removeFilter"]);

const checked = ref<boolean>(false);

function onChange() {
  if (checked.value) {
    emits(
      "replaceFilter",
      new ReplaceVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof QueenSacrificeFilter,
        new QueenSacrificeFilter()
      )
    );
  } else {
    emits(
      "removeFilter",
      new RemoveVideoFilterEvent(
        (vf: VideoFilter) => vf instanceof QueenSacrificeFilter
      )
    );
  }
  checked.value = false;
}
</script>

<template>
  <Checkbox
    inputId="queenSacrificeCheckboxId"
    v-model="checked"
    :binary="true"
    @change="onChange"
  />
  <label for="queenSacrificeCheckboxId" class="ms-1">Queen Sacrifice</label>
</template>

<style scoped></style>
