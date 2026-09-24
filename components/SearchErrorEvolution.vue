<script setup>
// Why the linear-search detector cannot be reused for binary search.
// Linear search walks N upward, so its estimates form a sequence and a falling
// moving average is meaningful. Binary search jumps around the interval, so
// consecutive probes are not ordered in N and each one has to be judged alone.
import { computed } from 'vue'
import D from '../src/deck-data.js'

const props = defineProps({ clicks: { type: Number, default: 0 } })
const stage = computed(() => Math.min(2, props.clicks))

const W = 470, H = 324, L = 66, R = 452, B = 250, T = 40
const PHI = 0.05, N_OPT = 31

// ---- left panel: the linear-search walk, ordered in N ---------------------
const walk = D.overshoot.filter(r => r.N <= 45)
const nx = n => L + (n - 5) / 40 * (R - L)
const py = v => B - (v / 0.08) * (B - T)
const walkPoints = computed(() => walk.map(r => ({
  x: nx(r.N), y: py(r.estimate ?? r.phi_hat), over: r.N > N_OPT,
})))

// ---- right panel: the recorded binary-search probes, in the order taken ---
// D.binary is one real run at hidden phi = 0.02 (N_opt = 78): every probe has
// its own N and its own shot noise, and they are not ordered in N.
const probes = D.binary.probes
const sx = i => L + (i + 0.5) / probes.length * (R - L)
const probePoints = computed(() => probes.map((p, i) => {
  const sigma = 1 / (2 * p.N * Math.sqrt(p.m))       // one-sigma shot noise
  return {
    x: sx(i), y: py(p.phi_hat), N: p.N,
    lo: py(Math.max(0, p.phi_hat - sigma)), hi: py(p.phi_hat + sigma),
    over: p.true_overshoot,
  }
}))
const TRUE_PHI = D.binary.phi

</script>

<template>
  <div class="search-evolution">
    <div class="panel">
      <h3>Linear search</h3>
      <svg :viewBox="`0 0 ${W} ${H}`" role="img"
           aria-label="Linear search estimates plotted against increasing N, flat until N_opt and then falling">
        <line :x1="L" :y1="B" :x2="R" :y2="B" class="axis" />
        <line :x1="L" :y1="B" :x2="L" :y2="T" class="axis" />
        <line :x1="L" :y1="py(PHI)" :x2="R" :y2="py(PHI)" class="truth" />
        <text :x="R" :y="py(PHI) - 9" text-anchor="end" class="tick">true φ</text>
        <line :x1="nx(N_OPT)" :y1="T" :x2="nx(N_OPT)" :y2="B" class="boundary" />
        <text :x="nx(N_OPT) + 7" :y="T + 14" class="boundary-tag">N<tspan dy="4" class="sub">opt</tspan></text>
        <circle v-for="(p, i) in walkPoints" :key="i" :cx="p.x" :cy="p.y" r="4"
                :class="['dot', { over: p.over }]" />
        <text :x="(L + R) / 2" :y="B + 38" text-anchor="middle" class="axis-name">N, probed in order</text>
        <text :x="L - 10" :y="T + 4" text-anchor="end" class="axis-name">φ̂</text>
      </svg>
      <p class="verdict">ordered in N — a falling mean means something</p>
    </div>

    <div class="panel" :class="{ dim: stage < 1 }">
      <h3>Binary search</h3>
      <svg :viewBox="`0 0 ${W} ${H}`" role="img"
           aria-label="Binary search probes plotted against probe number, jumping around the interval with shot-noise bars">
        <line :x1="L" :y1="B" :x2="R" :y2="B" class="axis" />
        <line :x1="L" :y1="B" :x2="L" :y2="T" class="axis" />
        <line :x1="L" :y1="py(TRUE_PHI)" :x2="R" :y2="py(TRUE_PHI)" class="truth" />
        <text :x="R" :y="py(TRUE_PHI) - 9" text-anchor="end" class="tick">true φ</text>
        <template v-for="(p, i) in probePoints" :key="i">
          <line v-if="stage >= 2" :x1="p.x" :y1="p.lo" :x2="p.x" :y2="p.hi"
                :class="['bar', { over: p.over }]" />
          <circle :cx="p.x" :cy="p.y" r="5" :class="['dot', { over: p.over }]" />
          <text :x="p.x" :y="B + 20" text-anchor="middle" class="tick">#{{ i + 1 }}</text>
          <text :x="p.x" :y="B + 38" text-anchor="middle" class="tick muted-tick">N={{ p.N }}</text>
        </template>
        <text :x="(L + R) / 2" :y="B + 60" text-anchor="middle" class="axis-name">probe number</text>
        <text :x="L - 10" :y="T + 4" text-anchor="end" class="axis-name">φ̂</text>
      </svg>
      <p class="verdict" :class="{ accent: stage >= 2 }">
        <span v-if="stage < 2">N jumps around — consecutive probes are not ordered</span>
        <span v-else>each probe judged <b>on its own</b>, against its own <MathEq tex="\pm\sigma=1/(2N\sqrt{m})" :display="false" /></span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.search-evolution{display:grid;grid-template-columns:1fr 1fr;gap:42px;margin-top:18px}
.panel{text-align:center;transition:opacity .4s ease}
.panel.dim{opacity:.18}
.panel h3{font-size:23px;margin:0 0 4px;color:var(--ink)}
.panel svg{display:block;width:100%;height:var(--figure-height,262px);overflow:visible}
.axis{stroke:#8c9fa7;stroke-width:1.8}
.truth{stroke:var(--muted);stroke-width:1.8;stroke-dasharray:7 6}
.boundary{stroke:var(--red);stroke-width:2;stroke-dasharray:6 5}
.boundary-tag{fill:var(--red);font-size:15px}
.sub{font-size:.78em}
.tick{fill:var(--muted);font-size:15px}
.muted-tick{font-size:13px;opacity:.75}
.axis-name{fill:var(--muted);font-size:17px}
.dot{fill:var(--teal)}
.dot.over{fill:var(--red)}
.bar{stroke:var(--teal);stroke-width:3;stroke-linecap:round;opacity:.75}
.bar.over{stroke:var(--red)}
.verdict{font-size:20px;color:var(--muted);margin-top:10px!important}
.verdict.accent{color:var(--teal)}
svg text{font-family:"Aptos","Segoe UI",Arial,sans-serif}
</style>
