<script setup>
// Judging a single probe against the pilot.
//
// The bell is the sampling distribution of the PROBE UNDER TEST, centred on the
// pilot estimate: phi-hat_N | phi-hat_p ~ N(phi-hat_p, 1/(4 m' N^2)). It has to
// be the probe's width, not the pilot's -- the threshold
// phi_1 = phi-hat_p + Phi^-1(alpha) / (2 N sqrt(m')) is the alpha-quantile of
// exactly this curve, so drawing the pilot's wider bell instead would put the
// line at the 25% point of what is on screen rather than the 5% point.
//
// Estimates come from N and a hit count, so they are values the estimator can
// actually return: phi-hat = arccos(sqrt(k/m'))/N.
import { computed } from 'vue'

const props = defineProps({
  clicks: { type: Number, default: 0 },
  probes: { type: Array, default: () => [{ N: 16, hits: 14 }, { N: 30, hits: 0 }, { N: 36, hits: 1 }] },
  shots: { type: Number, default: 30 },      // m' per candidate probe
  caption: { type: String, default: '' },
})

const N0 = 15, M0 = 100, PHI_P = 0.05        // the pilot: safe depth, generous shots
const ALPHA = 0.05, Z = -1.6449              // Phi^{-1}(0.05)
const N_OPT = Math.floor(Math.PI / (2 * PHI_P))

const L = 120, R = 950, B = 296, T = 46
const SPAN = 5.5                             // half-width of the drawn curve, in sigma

const phiHat = (N, hits) => Math.acos(Math.sqrt(hits / props.shots)) / N
const threshold = N => PHI_P + Z / (2 * N * Math.sqrt(props.shots))

// The deepest rejected probe owns the curve, the threshold line and the tail.
const main = computed(() => {
  const rejected = props.probes.filter(p => phiHat(p.N, p.hits) < threshold(p.N))
  return rejected.at(-1) ?? props.probes.at(-1)
})
const sigma = computed(() => 1 / (2 * main.value.N * Math.sqrt(props.shots)))
const lo = computed(() => PHI_P - SPAN * sigma.value)
const hi = computed(() => PHI_P + SPAN * sigma.value)

const xs = v => L + (v - lo.value) / (hi.value - lo.value) * (R - L)
const ys = d => B - d * (B - T)
const bell = v => Math.exp(-0.5 * ((v - PHI_P) / sigma.value) ** 2)

const stage = computed(() => Math.min(3, props.clicks))

const shotsOn = computed(() => props.probes.map(p => {
  const value = phiHat(p.N, p.hits), phi1 = threshold(p.N)
  return { ...p, value, phi1, rejected: value < phi1, x: xs(value), tx: xs(phi1) }
}))
const mainCut = computed(() => threshold(main.value.N))

const curve = computed(() => Array.from({ length: 261 }, (_, i) => {
  const v = lo.value + (hi.value - lo.value) * (i / 260)
  return `${i ? 'L' : 'M'}${xs(v).toFixed(2)},${ys(bell(v)).toFixed(2)}`
}).join(' '))

// Closed on the axis at both ends so the shading meets the baseline exactly.
const tail = computed(() => {
  const end = mainCut.value
  const pts = Array.from({ length: 141 }, (_, i) => {
    const v = lo.value + (end - lo.value) * (i / 140)
    return `L${xs(v).toFixed(2)},${ys(bell(v)).toFixed(2)}`
  })
  return `M${L},${B} ${pts.join(' ')} L${xs(end).toFixed(2)},${B} Z`
})

const fmt = v => v.toFixed(4)
</script>

<template>
  <div class="one-shot">
    <svg viewBox="0 0 1050 372" role="img"
         aria-label="Sampling distribution of the probe under test around the pilot estimate, with its five percent rejection threshold and the probes that were accepted or rejected">
      <path v-if="stage >= 2" :d="tail" class="tail" />
      <path :d="curve" class="bell" />
      <line :x1="L" :y1="B" :x2="R" :y2="B" class="axis" />

      <line :x1="xs(PHI_P)" :y1="ys(1)" :x2="xs(PHI_P)" :y2="B" class="centre" />
      <text :x="xs(PHI_P)" :y="ys(1) - 14" text-anchor="middle" class="centre-tag">
        φ̂<tspan dy="6" class="sub">p</tspan><tspan dy="-6"> = {{ fmt(PHI_P) }}</tspan>
      </text>
      <text :x="xs(PHI_P) + 96" :y="ys(0.80)" class="law">
        𝒩( φ̂<tspan dy="6" class="sub">p</tspan><tspan dy="-6">, 1 / (4 m′ N²) )</tspan>
        <tspan :x="xs(PHI_P) + 96" dy="24" class="law-sub"></tspan>
      </text>

      <g v-if="stage >= 2" class="thresholds">
        <line :x1="xs(mainCut)" :y1="ys(bell(mainCut))" :x2="xs(mainCut)" :y2="B" class="threshold" />
        <text :x="xs(mainCut) - 14" :y="ys(0.70)" text-anchor="end" class="threshold-tag">
          φ<tspan dy="6" class="sub">1</tspan><tspan dy="-6"> = {{ fmt(mainCut) }}</tspan>
        </text>
        <text :x="xs(mainCut) - 14" :y="ys(0.70) + 22" text-anchor="end" class="reject">
          lower {{ ALPHA * 100 }}% of the curve
        </text>
      </g>

      <template v-for="(s, i) in shotsOn" :key="s.N">
        <g v-if="stage >= 1 || i === 0" :class="['probe-group', { bad: stage >= 3 && s.rejected }]">
          <circle :cx="s.x" :cy="B" r="7" class="probe" />
          <text :x="s.x" :y="B + 26" text-anchor="middle" class="probe-tag">
            φ̂<tspan dy="5" class="sub">{{ s.N }}</tspan>
          </text>
          <text v-if="stage >= 3" :x="s.x" :y="B + 50" text-anchor="middle" class="mark">
            {{ s.rejected ? '✗' : '✓' }}
          </text>
        </g>
      </template>
    </svg>

    <p class="one-shot-law">
      <span v-if="stage < 2">pilot at <b>N₀ = N<sub>min</sub> = {{ N0 }}</b>, <b>m₀ = {{ M0 }}</b> shots ·
        each probe <b>m′ = {{ shots }}</b> shots · safe depth here is <b>N ≤ {{ N_OPT }}</b></span>
      <span v-else>reject when the probe lands below
        φ₁ = F⁻¹(α), for inverse CDF F⁻¹, α = {{ ALPHA }}</span>
    </p>
    <p v-if="caption" class="one-shot-caption">{{ caption }}</p>
  </div>
</template>

<style scoped>
.one-shot{margin-top:2px}
.one-shot svg{display:block;width:100%;height:var(--figure-height,318px);overflow:visible;
  font-family:"Aptos","Segoe UI",Arial,sans-serif}
.bell{fill:none;stroke:var(--muted);stroke-width:3}
.tail{fill:var(--red);opacity:.16}
.axis{stroke:#8c9fa7;stroke-width:1.8}
.centre{stroke:var(--muted);stroke-width:1.8;stroke-dasharray:7 6}
.centre-tag{fill:var(--ink);font-size:21px}
.law{fill:var(--muted);font-size:20px}
.law-sub{font-size:17px}
.threshold{stroke:var(--red);stroke-width:2.4;stroke-dasharray:7 5}
.threshold-tag{fill:var(--red);font-size:20px}
.reject{fill:var(--red);font-size:16px}
.probe{fill:var(--teal)}
.probe-tag{fill:var(--teal);font-size:19px}
.mark{fill:var(--teal);font-size:22px}
.probe-group.bad .probe,.probe-group.bad .mark{fill:var(--red)}
.probe-group.bad .probe-tag{fill:var(--red)}
.sub{font-size:14px !important}
.one-shot-law{text-align:center;font-size:20px;color:var(--muted);margin-top:2px!important}
.one-shot-caption{text-align:center;font-size:21px;color:var(--teal);margin-top:10px!important}
</style>
