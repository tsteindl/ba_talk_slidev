<script setup>
// Where N_min and N_max come from: the prior interval on the phase, pushed
// through N <= pi/(2 phi), becomes an interval on the number of phase-gate uses.
// Drawn as one plane so the inverse relation is visible rather than asserted --
// the largest phase maps to the smallest safe N and the other way round.
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({ clicks: { type: Number, default: 0 } })

const PHI_MIN = 0.01
const PHI_MAX = 0.1
const PHI_AXIS = 0.115          // a little headroom right of phi_max
const N_AXIS = 180              // a little headroom above N_max

const LEFT = 128, RIGHT = 1004, BOTTOM = 344, TOP = 44

const xs = phi => LEFT + (phi / PHI_AXIS) * (RIGHT - LEFT)
const ys = n => BOTTOM - (n / N_AXIS) * (BOTTOM - TOP)
const bound = phi => Math.PI / (2 * phi)

const reduced = typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------------------------------------------------------------- the curve
const curvePath = computed(() => {
  const start = Math.PI / (2 * N_AXIS)          // where the curve leaves the top
  const steps = 260
  return Array.from({ length: steps + 1 }, (_, i) => {
    const phi = start + (PHI_AXIS - start) * (i / steps)
    return `${i ? 'L' : 'M'}${xs(phi).toFixed(2)},${ys(bound(phi)).toFixed(2)}`
  }).join(' ')
})
const safeRegion = computed(() =>
  `${curvePath.value} L${xs(PHI_AXIS)},${BOTTOM} L${xs(Math.PI / (2 * N_AXIS))},${BOTTOM} Z`)

const curve = ref(null)
const curveLength = ref(2600)
const drawn = ref(false)

// --------------------------------------------------------------- the stages
// 0 plane and boundary · 1 the prior interval · 2 phi_max -> N_min
// 3 phi_min -> N_max · 4 sweep the whole interval through the boundary
const stage = computed(() => Math.min(4, props.clicks))

const ends = [
  { key: 'max', phi: PHI_MAX, at: 2, colour: 'var(--teal)', dx: 16, dy: -14 },
  { key: 'min', phi: PHI_MIN, at: 3, colour: 'var(--blue)', dx: 26, dy: 2 },
]

// ---------------------------------------------------------------- the sweep
const sweep = ref(0)            // 0 at phi_max, 1 at phi_min
let frame = 0
function runSweep(on) {
  cancelAnimationFrame(frame)
  if (!on) { sweep.value = 0; return }
  if (reduced) { sweep.value = 1; return }
  const started = performance.now()
  const step = now => {
    const t = Math.min(1, (now - started) / 1700)
    sweep.value = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2   // ease in/out
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}
const sweepPhi = computed(() => PHI_MAX + (PHI_MIN - PHI_MAX) * sweep.value)
const sweepN = computed(() => bound(sweepPhi.value))

onMounted(() => {
  if (curve.value) curveLength.value = curve.value.getTotalLength()
  requestAnimationFrame(() => { drawn.value = true })
  if (stage.value >= 4) runSweep(true)
})
onUnmounted(() => cancelAnimationFrame(frame))
watch(stage, value => runSweep(value >= 4))

const fmt = n => n.toFixed(2)
</script>

<template>
  <svg class="branch-bounds" viewBox="0 0 1050 400" role="img"
       aria-label="The phase interval from 0.01 to 0.1 radians mapped through N equals pi over 2 phi onto the phase-gate-use interval from 15 to 157">
    <!-- regions -------------------------------------------------------- -->
    <g class="regions" :class="{ on: drawn }">
      <rect :x="LEFT" :y="TOP" :width="RIGHT - LEFT" :height="BOTTOM - TOP" class="aliasing" />
      <path :d="safeRegion" class="safe" />
    </g>

    <!-- axes ----------------------------------------------------------- -->
    <g class="axes">
      <line :x1="LEFT" :y1="BOTTOM" :x2="RIGHT" :y2="BOTTOM" />
      <line :x1="LEFT" :y1="BOTTOM" :x2="LEFT" :y2="TOP" />
      <template v-for="p in [0.025, 0.05, 0.075]" :key="`x${p}`">
        <line :x1="xs(p)" :y1="BOTTOM" :x2="xs(p)" :y2="BOTTOM + 8" />
        <text :x="xs(p)" :y="BOTTOM + 30" text-anchor="middle" class="tick">{{ p }}</text>
      </template>
      <template v-for="n in [50, 100]" :key="`y${n}`">
        <line :x1="LEFT - 8" :y1="ys(n)" :x2="LEFT" :y2="ys(n)" />
        <text :x="LEFT - 16" :y="ys(n) + 7" text-anchor="end" class="tick">{{ n }}</text>
      </template>
      <text :x="(LEFT + RIGHT) / 2" :y="BOTTOM + 62" text-anchor="middle" class="axis-name">φ (rad)</text>
      <text :x="LEFT - 62" :y="TOP - 6" class="axis-name">N</text>
    </g>

    <!-- the branch boundary -------------------------------------------- -->
    <path ref="curve" :d="curvePath" class="boundary"
          :style="{ strokeDasharray: curveLength, strokeDashoffset: drawn ? 0 : curveLength }" />
    <g class="boundary-label" :class="{ on: drawn && stage < 4 }">
      <text :x="515" :y="240" class="note">N is safe exactly while Nφ ≤ π/2</text>
      <text :x="515" :y="268" class="formula">N = π / (2φ)</text>
      <text :x="xs(0.1085)" :y="ys(128)" text-anchor="end" class="note danger">aliasing</text>
    </g>

    <!-- the prior interval on the phase axis ---------------------------- -->
    <g class="prior" :class="{ on: stage >= 1 }">
      <line :x1="xs(PHI_MIN)" :y1="BOTTOM" :x2="xs(PHI_MAX)" :y2="BOTTOM" class="prior-bar" />
      <line v-for="p in [PHI_MIN, PHI_MAX]" :key="`cap${p}`"
            :x1="xs(p)" :y1="BOTTOM - 11" :x2="xs(p)" :y2="BOTTOM + 11" class="prior-cap" />
      <text :x="xs(PHI_MIN)" :y="BOTTOM + 31" text-anchor="middle" class="prior-tag">φ<tspan
        dy="6" class="sub">min</tspan><tspan dy="-6"> = 0.01</tspan></text>
      <text :x="xs(PHI_MAX)" :y="BOTTOM + 31" text-anchor="middle" class="prior-tag">φ<tspan
        dy="6" class="sub">max</tspan><tspan dy="-6"> = 0.1</tspan></text>
    </g>

    <!-- each endpoint pushed through the boundary ----------------------- -->
    <g v-for="e in ends" :key="e.key" class="mapping" :class="{ on: stage >= e.at }"
       :style="{ '--tone': e.colour }">
      <line :x1="xs(e.phi)" :y1="BOTTOM" :x2="xs(e.phi)" :y2="ys(bound(e.phi))" class="lead up" />
      <line :x1="xs(e.phi)" :y1="ys(bound(e.phi))" :x2="LEFT" :y2="ys(bound(e.phi))" class="lead across" />
      <circle :cx="xs(e.phi)" :cy="ys(bound(e.phi))" r="7" class="hit" />
      <text :x="xs(e.phi) + e.dx" :y="ys(bound(e.phi)) + e.dy" class="exact">{{ fmt(bound(e.phi)) }}</text>
      <circle :cx="LEFT" :cy="ys(Math.floor(bound(e.phi)))" r="7" class="landed" />
      <text :x="LEFT - 16" :y="ys(Math.floor(bound(e.phi))) + 7" text-anchor="end" class="landed-tag">
        {{ Math.floor(bound(e.phi)) }}
      </text>
    </g>

    <!-- floors, stated once both endpoints are on screen ---------------- -->
    <g class="floors" :class="{ on: stage >= 3 }">
      <text :x="xs(0.0335)" :y="ys(172)" class="floor-line"
            >N<tspan dy="6" class="sub">min</tspan><tspan dy="-6"
            > = ⌊π / (2 · 0.1)⌋ = ⌊15.71⌋ = 15</tspan></text>
      <text :x="xs(0.0335)" :y="ys(172) + 27" class="floor-line"
            >N<tspan dy="6" class="sub">max</tspan><tspan dy="-6"
            > = ⌊π / (2 · 0.01)⌋ = ⌊157.08⌋ = 157</tspan></text>
    </g>

    <!-- the resulting interval on the N axis ---------------------------- -->
    <g class="result" :class="{ on: stage >= 4 }">
      <line :x1="LEFT" :y1="ys(15)" :x2="LEFT"
            :y2="ys(Math.min(157, Math.max(15, sweepN)))" class="result-bar" />
      <circle :cx="xs(sweepPhi)" :cy="ys(sweepN)" r="8" class="runner" />
      <line :x1="xs(sweepPhi)" :y1="BOTTOM" :x2="xs(sweepPhi)" :y2="ys(sweepN)" class="runner-lead" />
      <line :x1="xs(sweepPhi)" :y1="ys(sweepN)" :x2="LEFT" :y2="ys(sweepN)" class="runner-lead" />
      <text :x="515" :y="240" class="result-tag"
            >every N from 15 to 157 is safe for <tspan font-style="italic">some</tspan> φ in the prior</text>
      <text :x="515" :y="268" class="result-tag muted-tag"
            >the true φ picks one point on this curve — we cannot see which</text>
    </g>
  </svg>
</template>

<style scoped>
.branch-bounds { display:block; width:100%; height:var(--figure-height,398px); overflow:visible;
  font-family:"Aptos","Segoe UI",Arial,sans-serif; }

.axes line { stroke:#8c9fa7; stroke-width:1.8; }
.tick { fill:var(--muted); font-size:18px; }
.sub { font-size:14px !important; }
.axis-name { fill:var(--muted); font-size:21px; }

.regions { opacity:0; transition:opacity .7s ease .45s; }
.regions.on { opacity:1; }
.aliasing { fill:var(--red); opacity:.05; }
.safe { fill:var(--teal); opacity:.07; }

.boundary { fill:none; stroke:var(--ink); stroke-width:3.4; stroke-linecap:round;
  transition:stroke-dashoffset 1.15s cubic-bezier(.4,0,.2,1); }
.boundary-label { opacity:0; transition:opacity .5s ease 1.2s; }
.boundary-label.on { opacity:1; }
.formula { fill:var(--ink); font-size:24px; }
.note { fill:var(--muted); font-size:17px; }
.note.danger { fill:var(--red); }

.prior, .mapping, .floors, .result { opacity:0; transition:opacity .45s ease; }
.prior.on, .mapping.on, .floors.on, .result.on { opacity:1; }

.prior-bar { stroke:var(--blue); stroke-width:9; stroke-linecap:round; }
.prior-cap { stroke:var(--blue); stroke-width:2.5; }
.prior-tag { fill:var(--blue); font-size:19px; }

.mapping .lead { stroke:var(--tone); stroke-width:2; stroke-dasharray:7 6; }
.mapping .hit { fill:var(--tone); }
.mapping .landed { fill:var(--tone); }
.mapping .exact { fill:var(--tone); font-size:19px; }
.mapping .landed-tag { fill:var(--tone); font-size:22px; font-weight:600; }
/* the two leads draw themselves in, corner first, once the stage arrives */
.mapping .up { stroke-dashoffset:0; }
.mapping.on .lead { animation:trace .55s ease both; }
.mapping.on .across { animation-delay:.5s; }
.mapping.on .hit { animation:pop .3s ease .45s both; }
.mapping.on .landed, .mapping.on .landed-tag { animation:pop .3s ease 1s both; }
.mapping.on .exact { animation:pop .3s ease .6s both; }

.floor-line { fill:var(--ink); font-size:21px; }

.result-bar { stroke:var(--teal); stroke-width:9; stroke-linecap:round; opacity:.55; }
.runner { fill:var(--ink); }
.runner-lead { stroke:var(--ink); stroke-width:1.6; stroke-dasharray:5 6; opacity:.5; }
.result-tag { fill:var(--ink); font-size:21px; }
.result-tag.muted-tag { fill:var(--muted); font-size:18px; }

@keyframes trace { from { stroke-dasharray:0 900; } to { stroke-dasharray:7 6; } }
@keyframes pop { from { opacity:0; transform:scale(.6); } to { opacity:1; transform:scale(1); } }

@media (prefers-reduced-motion:reduce) {
  .boundary { transition:none; stroke-dashoffset:0 !important; }
  .regions, .boundary-label { transition:none; }
  .mapping.on .lead, .mapping.on .hit, .mapping.on .landed,
  .mapping.on .landed-tag, .mapping.on .exact { animation:none; }
}
</style>
