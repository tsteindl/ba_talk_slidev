<script setup>
const props=defineProps({clicks:{type:Number,default:0}})
const bits=[0,1,0,0,1,0,1,0,0,1,0,0]
</script>

<template>
  <div class="estimator-story" :data-step="clicks">
    <div class="story-node phase" :class="{active:clicks===0}">φ<span>hidden phase</span></div>
    <div class="story-arrow"><i :class="{flow:clicks>=1}"></i>→</div>
    <div class="story-node experiment" :class="{active:clicks===1}">
      <div class="mini-circuit"><b>|0〉</b><em>H</em><em>U(φ)</em><em>H</em><b>⏱</b></div><span>known experiment</span>
    </div>
    <div class="story-arrow"><i :class="{flow:clicks>=2}"></i>→</div>
    <div class="story-node bit-node" :class="{active:clicks===2}"><div class="bit-stream"><b v-for="(bit,i) in bits" :key="i" :style="`--i:${i}`">{{bit}}</b></div><span>repeated outcomes</span></div>
    <div class="story-arrow"><i :class="{flow:clicks>=3}"></i>→</div>
    <div class="story-node estimate" :class="{active:clicks===3}">p̂₀ = 0.60<span>response estimate</span></div>
    <div class="story-arrow"><i :class="{flow:clicks>=4}"></i>→</div>
    <div class="story-node answer" :class="{active:clicks>=4}">φ̂<span>invert the response</span></div>
  </div>
  <div class="story-caption">
    <span v-if="clicks===0">choose the quantity we want to learn</span>
    <span v-else-if="clicks===1">encode φ into a measurable probability</span>
    <span v-else-if="clicks===2">one bit is random; the stream is informative</span>
    <span v-else-if="clicks===3">count zeros: p̂₀ = #0 / m</span>
    <span v-else>apply the inverse response on an identifiable branch</span>
  </div>
</template>

<style scoped>
.estimator-story{height:300px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:30px}.story-node{min-width:125px;text-align:center;font-family:KaTeX_Main,"Times New Roman",serif;font-size:52px;opacity:.35;transform:scale(.94);transition:.35s ease}.story-node.active{opacity:1;transform:scale(1.06);color:#007e80}.story-node span{display:block;margin-top:19px;color:#5c6b73;font:17px "Aptos","Segoe UI",sans-serif}.story-node.experiment{min-width:275px}.mini-circuit{display:flex;align-items:center;gap:8px;border-bottom:2px solid #91a3aa;padding:0 2px 11px}.mini-circuit em{font:22px "Aptos","Segoe UI",sans-serif;border:2px solid #007e80;padding:10px 9px;background:#f7f8f5}.mini-circuit b{font:22px "Aptos","Segoe UI",sans-serif}.story-arrow{position:relative;color:#90a1a8;font-size:35px}.story-arrow i{position:absolute;width:9px;height:9px;border-radius:50%;background:#007e80;left:-4px;top:20px;opacity:0}.story-arrow i.flow{animation:flow .65s ease-out}.bit-stream{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;font:22px "Aptos","Segoe UI",sans-serif;width:180px}.bit-stream b{border-bottom:2px solid #007e80;opacity:0;animation:pop .18s ease forwards;animation-delay:calc(var(--i)*.055s)}.estimator-story[data-step="0"] .bit-stream b,.estimator-story[data-step="1"] .bit-stream b{animation:none}.story-caption{text-align:center;color:#007e80;font-size:30px;margin-top:35px}@keyframes pop{to{opacity:1}}@keyframes flow{0%{opacity:0;transform:translateX(0)}40%{opacity:1}100%{opacity:0;transform:translateX(48px)}}
</style>
