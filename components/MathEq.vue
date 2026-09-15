<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  tex: { type: String, required: true },
  display: { type: Boolean, default: true },
})

const rendered = computed(() => katex.renderToString(props.tex, {
  displayMode: props.display,
  throwOnError: false,
  strict: false,
}))
</script>

<template>
  <span class="math-eq" v-html="rendered" />
</template>
