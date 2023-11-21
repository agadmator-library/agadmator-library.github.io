<script setup lang="ts">

import {prettyDate} from "@/util/time";

defineProps({
  date: Date
})

</script>

<template>
  <span>{{ prettyDate(date) }}</span>
</template>

<style scoped>

</style>