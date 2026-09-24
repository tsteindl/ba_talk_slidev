<script setup>
defineProps({ clicks: { type: Number, default: 0 } })
const bits = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0]
</script>

<template>
  <div class="estimator-story" :data-step="clicks">
    <div class="story-node phase" :class="{ active: clicks === 0 }"><div class="story-symbol"><MathEq tex="\phi" :display="false" /></div><span>hidden phase</span></div>
    <div class="story-arrow"><i :class="{ flow: clicks >= 1 }" />→</div>
    <div class="story-node experiment" :class="{ active: clicks === 1 }">
      <div class="story-symbol"><img class="mini-circuit-img" src="/assets/thesis/1 qubit single use.drawio.png" alt="One-qubit circuit: prepare zero, H, U(phi), H, measure"></div><span>quantum exp. encoding our hidden phase <MathEq tex="\phi" :display="false" /></span>
    </div>
    <div class="story-arrow"><i :class="{ flow: clicks >= 2 }" />→</div>
    <div class="story-node bit-node" :class="{ active: clicks === 2 }"><div class="story-symbol"><div class="bit-stream"><b v-for="(bit, i) in bits" :key="i" :style="`--i:${i}`">{{ bit }}</b></div></div><span>repeated outcomes</span></div>
    <div class="story-arrow"><i :class="{ flow: clicks >= 3 }" />→</div>
    <div class="story-node estimate big" :class="{ active: clicks === 3 }"><div class="story-symbol"><MathEq tex="\hat p_0=0.60" :display="false" /></div><span>response estimate</span></div>
    <div class="story-arrow"><i :class="{ flow: clicks >= 4 }" />→</div>
    <div class="story-node answer big" :class="{ active: clicks >= 4 }"><div class="story-symbol"><MathEq tex="\hat\phi" :display="false" /></div><span>invert the response</span></div>
  </div>
  <div class="story-caption">
    <span v-if="clicks === 0">quantity we want to learn</span>
    <span v-else-if="clicks === 1">encode <MathEq tex="\phi" :display="false" /> into a measurable probability</span>
    <span v-else-if="clicks === 2">readout bitstring from quantum computer</span>
    <span v-else-if="clicks === 3">count zeros: <MathEq tex="\hat p_0=\#0/m" :display="false" /></span>
  </div>
</template>

<style scoped>
.estimator-story{height:300px;display:flex;align-items:flex-start;justify-content:center;gap:6px;margin-top:55px}.story-node{flex:0 0 auto;min-width:105px;text-align:center;font-family:KaTeX_Main,"Times New Roman",serif;font-size:46px;opacity:.35;transition:opacity .35s ease,color .35s ease;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}.story-symbol{height:118px;display:flex;align-items:center;justify-content:center}.story-node.active{opacity:1;color:#007e80}.story-node>span:not(.math-eq){display:block;margin-top:10px;color:#5c6b73;font:17px "Aptos","Segoe UI",sans-serif;white-space:nowrap}.story-node>span:not(.math-eq) .math-eq{font-size:17px}.story-node.experiment{min-width:230px}.story-node.experiment>span:not(.math-eq){white-space:normal;line-height:1.35}.mini-circuit-img{display:block;width:230px;max-height:100px;object-fit:contain;margin:0 auto}.story-node.big{font-size:46px;white-space:nowrap}.story-node.big>span:not(.math-eq){margin-top:10px}.mini-circuit{display:flex;align-items:center;gap:8px;border-bottom:2px solid #91a3aa;padding:0 2px 11px}.mini-circuit em{font:22px "Aptos","Segoe UI",sans-serif;border:2px solid #007e80;padding:10px 9px;background:#f7f8f5}.mini-circuit b{font:18px "Aptos","Segoe UI",sans-serif}.story-arrow{flex:0 0 auto;position:relative;color:#90a1a8;font-size:32px;padding:0 4px;margin-top:48px}.story-arrow i{position:absolute;width:9px;height:9px;border-radius:50%;background:#007e80;left:-4px;top:20px;opacity:0}.story-arrow i.flow{animation:flow .65s ease-out}.bit-stream{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;font:22px "Aptos","Segoe UI",sans-serif;width:165px;margin:0 auto}.bit-stream b{border-bottom:2px solid #007e80;opacity:0;animation:pop .18s ease forwards;animation-delay:calc(var(--i)*.055s)}.estimator-story[data-step="0"] .bit-stream b,.estimator-story[data-step="1"] .bit-stream b{animation:none}.story-caption{text-align:center;color:#007e80;font-size:30px;margin-top:35px}@keyframes pop{to{opacity:1}}@keyframes flow{0%{opacity:0;transform:translateX(0)}40%{opacity:1}100%{opacity:0;transform:translateX(48px)}}
</style>
