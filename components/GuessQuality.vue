<script setup>
// Where the exploration phase's N_guess lands relative to N_opt.
//
// Percentiles of the pooled held-out distribution over ALL 106 informative
// operating points (5.3M runs), taken from qmetrology.pipeline.heldout with
// each point's frozen tuned configuration. Aggregating the thesis way --
// median over points of each per-point quartile -- reproduces Table B.2
// exactly (BS 0.904 / 5.6%, RE 1.000 / 23.9%) but collapses the quartile box
// onto 1.0, because more than half of all runs land exactly on N_opt. Hence
// the wider percentile pair: p10-p90 for the box, p1-p99 for the bar.
import { computed } from 'vue'

const props = defineProps({ clicks: { type: Number, default: 0 } })
const stage = computed(() => Math.min(2, props.clicks))

const ROWS = [
  {
    key: 'BS', name: 'Binary search',
    p1: 0.087, p10: 0.268, median: 0.882, p90: 1.000, p99: 1.065,
    exact: 0.2662, overshoot: 0.0559, verdict: 'usually stops short',
  },
  {
    key: 'RE', name: 'Reverse engineering',
    p1: 0.731, p10: 0.941, median: 1.000, p90: 1.062, p99: 1.614,
    exact: 0.5146, overshoot: 0.2386, verdict: 'right on the boundary',
  },
]

const LO = 0.0, HI = 1.7
const L = 286, R = 872, TOP = 88, GAP = 118
const xs = v => L + (v - LO) / (HI - LO) * (R - L)
const rowY = i => TOP + i * GAP

const ticks = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5]
const pct = v => (100 * v).toFixed(1) + '%'
</script>

<template>
  <div class="guess-quality">
    <svg viewBox="0 0 1050 330" role="img"
         aria-label="Percentiles of N_guess over N_opt pooled across all 106 operating points, for binary search and reverse engineering, with the share of guesses past N_opt">
      <!-- anything right of 1 has already overshot the branch -->
      <rect :x="xs(1)" :y="TOP - 44" :width="xs(HI) - xs(1)" :height="GAP + 80" class="unsafe-band" />
      <line :x1="xs(1)" :y1="TOP - 44" :x2="xs(1)" :y2="TOP + GAP + 36" class="unity" />
      <text :x="xs(1) + 12" :y="TOP - 50" class="unsafe-tag">past N<tspan dy="4" class="sub">opt</tspan></text>

      <g v-for="(r, i) in ROWS" :key="r.key" :class="{ hidden: stage < i }">
        <text :x="L - 26" :y="rowY(i) + 3" text-anchor="end" class="row-name">{{ r.name }}</text>
        <text :x="L - 26" :y="rowY(i) + 27" text-anchor="end" class="verdict">{{ r.verdict }}</text>

        <!-- 1st to 99th percentile -->
        <line :x1="xs(r.p1)" :y1="rowY(i)" :x2="xs(r.p99)" :y2="rowY(i)" class="whisker" />
        <line v-for="e in [r.p1, r.p99]" :key="e"
              :x1="xs(e)" :y1="rowY(i) - 10" :x2="xs(e)" :y2="rowY(i) + 10" class="whisker-cap" />
        <!-- 10th to 90th percentile -->
        <rect :x="xs(r.p10)" :y="rowY(i) - 14" :width="xs(r.p90) - xs(r.p10)" :height="28" class="box" />
        <circle :cx="xs(r.median)" :cy="rowY(i)" r="8" class="median" />
        <text :x="xs(r.median)" :y="rowY(i) - 24" text-anchor="middle" class="median-tag">
          {{ r.median.toFixed(2) }}
        </text>

        <text :x="xs(HI) + 22" :y="rowY(i) + 3" :class="['share', { hot: r.overshoot > 0.1 }]">
          {{ pct(r.overshoot) }}
        </text>
        <text :x="xs(HI) + 22" :y="rowY(i) + 23" class="share-note">overshot</text>
      </g>

      <line :x1="L" :y1="TOP + GAP + 36" :x2="R" :y2="TOP + GAP + 36" class="axis" />
      <template v-for="t in ticks" :key="t">
        <line :x1="xs(t)" :y1="TOP + GAP + 36" :x2="xs(t)" :y2="TOP + GAP + 44" class="axis" />
        <text :x="xs(t)" :y="TOP + GAP + 66" text-anchor="middle" class="tick">{{ t }}</text>
      </template>
      <text :x="(L + R) / 2" :y="TOP + GAP + 94" text-anchor="middle" class="axis-name">
        N<tspan dy="5" class="sub">guess</tspan><tspan dy="-5"> / N</tspan><tspan
          dy="5" class="sub">opt</tspan><tspan dy="-5"> · box 10–90%, bar 1–99% · all 106 operating points</tspan>
      </text>
    </svg>
  </div>
</template>

<style scoped>
.guess-quality svg{display:block;width:100%;height:var(--figure-height,330px);overflow:visible;
  font-family:"Aptos","Segoe UI",Arial,sans-serif}
g.hidden{opacity:0}
g{transition:opacity .3s ease}
.unsafe-band{fill:var(--red);opacity:.07}
.unity{stroke:var(--red);stroke-width:2;stroke-dasharray:6 5}
.unsafe-tag{fill:var(--red);font-size:17px}
.axis{stroke:#8c9fa7;stroke-width:1.8}
.tick{fill:var(--muted);font-size:17px}
.axis-name{fill:var(--muted);font-size:17px}
.row-name{fill:var(--ink);font-size:23px}
.verdict{fill:var(--muted);font-size:16px}
.whisker,.whisker-cap{stroke:var(--teal);stroke-width:2.4;opacity:.6}
.box{fill:var(--teal);opacity:.34;stroke:var(--teal);stroke-width:2}
.median{fill:var(--teal)}
.median-tag{fill:var(--teal);font-size:18px}
.share{fill:var(--muted);font-size:26px;font-weight:600}
.share.hot{fill:var(--red)}
.share-note{fill:var(--muted);font-size:14px}
.sub{font-size:.78em}
</style>
