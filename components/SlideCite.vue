<script setup>
import { computed } from 'vue'
import { citationGroups, referencesByKey } from '../src/citations.generated.js'

const props = defineProps({ id: { type: String, required: true } })
const citations = computed(() => (citationGroups[props.id] || []).map(key => referencesByKey[key]))
</script>

<template>
  <div v-if="citations.length" class="slide-citations" aria-label="Sources for this slide">
    <span v-for="citation in citations" :key="citation.key" :title="citation.title">
      [{{ citation.number }}] {{ citation.short }}
    </span>
  </div>
</template>
