<script setup>
// The section bar and folio number. TalkBody draws its own copy; this one is
// for the hand-written pages so they do not lose the progress bar.
import { computed } from 'vue'

const props = defineProps({
  section: { type: String, default: 'METROLOGY' },
  page: { type: Number, default: 0 },
})

const SECTIONS = ['QUANTUM METROLOGY', 'MODEL', 'ADAPTIVE N', 'RESULTS']
const LABEL = { METROLOGY: 'QUANTUM METROLOGY' }
const current = computed(() => LABEL[props.section] || props.section)
</script>

<template>
  <div class="nav">
    <template v-for="(name, i) in SECTIONS" :key="name">
      <span v-if="i" class="sep">·</span><span :class="{ active: name === current }">{{ name }}</span>
    </template>
  </div>
  <div v-if="page" class="folio">{{ String(page).padStart(2, '0') }}</div>
</template>
