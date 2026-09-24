<script setup>
// A multi-line derivation that reveals one line per click, with the relation
// symbols of every line in a column so the whole block reads as one equation —
// the way it is set in the thesis.
//
// Each line is { lhs, rel, rhs, note }. Only the first line normally carries an
// lhs; the rest leave it empty and continue under it.
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  lines: { type: Array, required: true },
  clicks: { type: Number, default: 0 },
  start: { type: Number, default: 1 },   // click index at which the first line appears
  size: { type: String, default: '' },   // '' | 'small'
})

const tex = (src, display = false) => src
  ? katex.renderToString(src, { displayMode: display, throwOnError: true, strict: false })
  : ''

// A note may carry inline math between dollar signs.
const inline = src => String(src ?? '').split('$')
  .map((part, i) => (i % 2 ? tex(part) : part)).join('')

const rows = computed(() => props.lines.map((line, i) => ({
  lhs: tex(line.lhs),
  rel: tex(line.rel ?? '='),
  rhs: tex(line.rhs),
  note: inline(line.note),
  shown: props.clicks >= props.start + i,
})))
</script>

<template>
  <div class="derivation-block" :class="size">
    <div v-for="(row, i) in rows" :key="i" class="derivation-row" :class="{ shown: row.shown }">
      <span class="lhs" v-html="row.lhs" />
      <span class="rel" v-html="row.rel" />
      <span class="rhs" v-html="row.rhs" />
      <span class="note" v-html="row.note" />
    </div>
  </div>
</template>

<style scoped>
.derivation-block{display:grid;grid-template-columns:auto auto auto 1fr;
  align-items:baseline;column-gap:10px;row-gap:12px;justify-content:center;margin:0 auto}
.derivation-row{display:contents}
.derivation-row>*{opacity:0;transition:opacity .28s ease}
.derivation-row.shown>*{opacity:1}
.lhs{grid-column:1;text-align:right;font-size:27px}
.rel{grid-column:2;text-align:center;font-size:27px}
.rhs{grid-column:3;text-align:left;font-size:27px}
.note{grid-column:4;justify-self:start;font-size:16px;color:var(--muted);
  padding-left:18px;align-self:center;white-space:nowrap}
.small .lhs,.small .rel,.small .rhs{font-size:23px}
.small .note{font-size:15px}
</style>
