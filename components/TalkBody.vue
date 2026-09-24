<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import katex from 'katex'
import SlideCite from './SlideCite.vue'
import BranchBounds from './BranchBounds.vue'
import SearchErrorEvolution from './SearchErrorEvolution.vue'
import OneShotCriterion from './OneShotCriterion.vue'
import GuessQuality from './GuessQuality.vue'
import { main, backup, m, eq, states, svg, chart, text, line, circle, pipeline, ink, teal, blue, gray } from '../src/talk-core.js'
import { buildOpeningModules } from '../src/openings.js'

const props=defineProps({
  number:{type:Number,default:1}, module:{type:String,default:''}, index:{type:Number,default:0},
  clicks:{type:Number,default:0}, page:{type:Number,default:1},
})
const root=ref()
// Slides whose figure has to animate over time name a component here; everything
// else stays a plain HTML string built in talk-core.js.
const figures={BranchBounds,SearchErrorEvolution,OneShotCriterion,GuessQuality}
const modules={...buildOpeningModules({m,eq,states,svg,chart,text,line,circle,pipeline,ink,teal,blue,gray}),backup}
// The deck's first section is labelled 'METROLOGY' internally; the nav shows
// the full name.
const SECTION_LABEL={METROLOGY:'QUANTUM METROLOGY'}
const slide=computed(()=>{
  if(!props.module)return main[props.number-1]
  const [title,body,notes]=modules[props.module][props.index]
  return {title,body,notes,section:'METROLOGY',module:props.module}
})
const sectionName=computed(()=>SECTION_LABEL[slide.value.section]||slide.value.section)
const memory=computed(()=>slide.value.estimator?m('\\hat\\phi_{\\mathrm{ent}}=\\frac1N\\arccos\\sqrt{\\hat p_0}')+'<br>'+m('0\\leq\\phi\\leq\\pi/(2N)'):'')
const scenario=computed(()=>slide.value.scenario?m('\\phi\\in[0.01,0.1]')+'\u2003'+m('N_{\\mathrm{opt}}\\in\\{15,\\ldots,157\\}')+'<br>'+m('C=10{,}000\\quad\\epsilon=10^{-3}')+'<br>'+m('\\text{goal: }|\\phi-\\hat\\phi|<\\epsilon'):'')
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
      <template v-for="(name,i) in ['QUANTUM METROLOGY','MODEL','ADAPTIVE N','RESULTS']" :key="name">
        <span v-if="i" class="sep">·</span><span :class="{active:name===sectionName}">{{ name }}</span>
      </template>
    </div>
    <div v-if="slide.section" class="folio">{{ String(page).padStart(2,'0') }}</div>
    <div class="talk-content" v-html="slide.body"></div>
    <component v-if="slide.figure" :is="figures[slide.figure]" :clicks="clicks" v-bind="slide.figureProps || {}" />
    <div v-if="slide.source" class="source" v-html="slide.source"></div>
    <SlideCite v-if="!module" :id="`main-${number}`" />
    <div v-if="memory" class="memory" v-html="memory"></div>
    <div v-if="scenario" class="scenario" v-html="scenario"></div>
  </div>
</template>
