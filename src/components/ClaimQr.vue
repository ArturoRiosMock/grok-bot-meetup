<script setup lang="ts">
import { computed } from 'vue'
import { qrSvg } from '@/meetup/qr'

const props = defineProps<{ url: string }>()
const svg = computed(() => qrSvg(props.url) ?? '')
</script>

<template>
  <div v-if="svg" class="qr-img" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.qr-img {
  display: block;
  width: 100%;
  height: auto;
}

.qr-img :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
