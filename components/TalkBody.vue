<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import katex from 'katex'
import SlideCite from './SlideCite.vue'
import { main, m, eq, states, svg, chart, text, line, circle, pipeline, ink, teal, blue, gray } from '../src/talk-core.js'
import { buildOpeningModules } from '../src/openings.js'

const props=defineProps({
  number:{type:Number,default:1}, module:{type:String,default:''}, index:{type:Number,default:0},
  clicks:{type:Number,default:0}, page:{type:Number,default:1},
})
const root=ref()
const modules=buildOpeningModules({m,eq,states,svg,chart,text,line,circle,pipeline,ink,teal,blue,gray})
const slide=computed(()=>{
  if(!props.module)return main[props.number-1]
  const [title,body,notes]=modules[props.module][props.index]
  return {title,body,notes,section:'METROLOGY',module:props.module}
})
const memory=computed(()=>slide.value.estimator?m('\\hat\\phi_N=\\frac1N\\arccos\\sqrt{\\hat p_0}')+(slide.value.branch?'<br>'+m('N\\phi\\leq\\pi/2'):''):'')
const scenario=computed(()=>slide.value.scenario?m('\\phi\\in[0.01,0.1]')+'<br>'+m('C=10{,}000\\quad\\epsilon=10^{-3}'):'')
function update(){
  if(!root.value)return
  for(const el of root.value.querySelectorAll('.math'))if(!el.dataset.rendered){
    katex.render(el.textContent,el,{throwOnError:true,trust:false});el.dataset.rendered='1'
  }
  for(const el of root.value.querySelectorAll('.fragment')){
    const index=Number(el.dataset.fragmentIndex||0)
    const shown=el.classList.contains('fade-out')?props.clicks<=index:el.classList.contains('current-visible')?props.clicks===index+1:props.clicks>index
    el.style.visibility=shown?'visible':'hidden';el.style.opacity=shown?'1':'0';el.style.pointerEvents=shown?'auto':'none'
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
    for(const el of root.value.querySelectorAll('animateMotion'))try{el.beginElement()}catch{}
}
onMounted(()=>nextTick(update))
watch(()=>[props.clicks,props.number,props.module,props.index],()=>nextTick(update))
</script>

<template>
  <div ref="root" class="talk-frame" :class="[slide.className,{'title-slide':number===1&&!module}]">
    <div v-if="slide.section" class="nav">
      <template v-for="(name,i) in ['METROLOGY','MODEL','ADAPTIVE N','RESULTS']" :key="name">
        <span v-if="i" class="sep">·</span><span :class="{active:name===slide.section}">{{ name }}</span>
      </template>
    </div>
    <div v-if="slide.section" class="folio">{{ String(page).padStart(2,'0') }}</div>
    <div class="talk-content" v-html="slide.body"></div>
    <div v-if="slide.source" class="source" v-html="slide.source"></div>
    <SlideCite v-if="!module" :id="`main-${number}`" />
    <div v-if="memory" class="memory" v-html="memory"></div>
    <div v-if="scenario" class="scenario" v-html="scenario"></div>
  </div>
</template>
