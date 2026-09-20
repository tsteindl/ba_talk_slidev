import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sources = resolve(root, 'sources')
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function uncomment(line) {
  for (let i = 0; i < line.length; i++) if (line[i] === '%' && line[i - 1] !== '\\') return line.slice(0, i)
  return line
}

function unwrap(text, command) {
  let out = text
  while (out.includes(`\\${command}`)) {
    const start = out.indexOf(`\\${command}`), open = out.indexOf('{', start)
    if (open < 0) break
    let depth = 1, end = open + 1
    for (; end < out.length && depth; end++) { if (out[end] === '{') depth++; if (out[end] === '}') depth-- }
    if (depth) break
    out = out.slice(0, start) + out.slice(open + 1, end - 1) + out.slice(end)
  }
  return out
}

function plain(value) {
  let text = value
  for (const cmd of ['makecell','textit','textbf','mathrm','text','emph','texttt']) text = unwrap(text, cmd)
  return text.replace(/A\.~\\ref\{[^}]+\}:?\s*/g, '').replace(/\\(?:ref|label)\{[^}]+\}/g, '')
    .replace(/\\hspace\{[^}]+\}/g, ' ').replace(/\\(?:scriptsize|footnotesize)\b/g, '').replace(/\\(?:left|right|qquad|quad|,|;|!)/g, ' ')
    .replace(/\\texttimes|\\times/g, 'x').replace(/\\cdot/g, '*').replace(/\\gets/g, '<-')
    .replace(/\\leq/g, '<=').replace(/\\geq/g, '>=').replace(/\\neq/g, '!=').replace(/\\phi/g, 'phi')
    .replace(/\\epsilon/g, 'epsilon').replace(/\\alpha/g, 'alpha').replace(/\\pi/g, 'pi')
    .replace(/\\sigma/g, 'sigma').replace(/\\Phi/g, 'Phi').replace(/\\mathbb\s*|\\mathcal\s*/g, '')
    .replace(/\\lfloor/g, 'floor(').replace(/\\rfloor/g, ')').replace(/\\sqrt/g, 'sqrt')
    .replace(/\\dfrac|\\frac/g, '/').replace(/\\operatorname/g, '').replace(/\\%/g, '%').replace(/\\_/g, '_')
    .replace(/~/g, ' ').replace(/\$|\\\(|\\\)/g, '').replace(/[{}]/g, '').replace(/\\\\/g, ' / ')
    .replace(/\\[A-Za-z]+/g, '').replace(/``|''/g, '"').replace(/\s+/g, ' ').trim()
}

function mixed(value) {
  return value.split(/(\$[^$]*\$)/g).map(piece => {
    if (piece.startsWith('$') && piece.endsWith('$')) {
      const math = piece.slice(1, -1).replace(/\\Call\{([^}]+)\}\{([^}]*)\}/g, '\\operatorname{$1}($2)')
      return katex.renderToString(math, { throwOnError: false, output: 'html' })
    }
    return esc(piece.replace(/\\(?:textit|textbf)\{([^}]*)\}/g, '$1').replace(/\\Return\s*/g, 'return ').replace(/``|''/g, '"').replace(/~/g, ' '))
  }).join('')
}

function algorithm(path) {
  const source = readFileSync(path, 'utf8')
  const caption = plain(source.match(/\\caption\{([\s\S]*?)\}\s*\\label/)?.[1] || path)
  const body = source.match(/\\begin\{algorithmic\}([\s\S]*?)\\end\{algorithmic\}/)?.[1] || ''
  const start = /^(\\Procedure|\\EndProcedure|\\State|\\Comment|\\While|\\EndWhile|\\If|\\ElsIf|\\Else|\\EndIf|\\For|\\EndFor|\\Do|\\doWhile)/
  const logical = []
  for (const raw of body.split(/\r?\n/)) {
    const line = uncomment(raw).trim()
    if (!line) continue
    if (start.test(line)) logical.push(line); else if (logical.length) logical.at(-1).text += ` ${line}`
    if (typeof logical.at(-1) === 'string') logical[logical.length - 1] = { text: logical.at(-1) }
  }
  let indent = 0; const rows = []
  for (const item of logical) {
    const line = item.text
    if (/^\\(EndProcedure|EndWhile|EndIf|EndFor|Else|ElsIf|doWhile)/.test(line)) indent = Math.max(0, indent - 1)
    let kind = 'state', content = line.replace(/^\\State\s*/, '')
    const patterns = [
      [/^\\Procedure\{([^}]*)\}\{([\s\S]*)\}$/, 'procedure', m => `procedure ${m[1]}(${m[2]})`],
      [/^\\EndProcedure/, 'control', ()=>'end procedure'], [/^\\While\s*\{([\s\S]*)\}$/, 'control', m=>`while ${m[1]} do`],
      [/^\\EndWhile/, 'control', ()=>'end while'], [/^\\For\{([\s\S]*)\}$/, 'control', m=>`for ${m[1]} do`],
      [/^\\EndFor/, 'control', ()=>'end for'], [/^\\If\s*\{([\s\S]*)\}$/, 'control', m=>`if ${m[1]} then`],
      [/^\\ElsIf\s*\{([\s\S]*)\}$/, 'control', m=>`else if ${m[1]} then`], [/^\\Else/, 'control', ()=>'else'],
      [/^\\EndIf/, 'control', ()=>'end if'], [/^\\Do/, 'control', ()=>'repeat'],
      [/^\\doWhile\s*\{([\s\S]*)\}$/, 'control', m=>`until ${m[1]}`], [/^\\Comment\{([\s\S]*)\}$/, 'comment', m=>`// ${m[1]}`],
    ]
    for (const [regex, rowKind, format] of patterns) { const match=line.match(regex); if(match){kind=rowKind;content=format(match);break} }
    content = content.replace(/\\Comment\{([\s\S]*)\}$/, '  // $1')
    if (content.trim()) rows.push({ indent, kind, html:mixed(content) })
    if (/^\\(Procedure|While|For|If|ElsIf|Else|Do)/.test(line)) indent++
  }
  return { caption, rows }
}

function split(text, separator) {
  const parts=[]; let start=0, depth=0
  for(let i=0;i<text.length;i++){if(text[i]==='{')depth++;if(text[i]==='}')depth--;if(depth===0&&text.startsWith(separator,i)){parts.push(text.slice(start,i));start=i+separator.length;i+=separator.length-1}}
  parts.push(text.slice(start)); return parts
}
function table(path) {
  const source=readFileSync(path,'utf8'), body=source.match(/\\begin\{tabular\}\{[^}]+\}([\s\S]*?)\\end\{tabular\}/)?.[1]
  if(!body) throw new Error(`No tabular environment in ${path}`)
  return split(body.replace(/\\(?:toprule|midrule|bottomrule)/g,''),'\\\\').map(row=>split(row,'&').map(plain)).filter(row=>row.some(Boolean))
}

const slides=[]
slides.push(`---\nclass: supplement supplement-divider\n---\n\n<div class="supp-tag">SUPPLEMENT</div>\n\n# Exact pseudocode\n\n<p>generated from the same TeX files imported by the thesis</p>`)
for(const filename of readdirSync(resolve(sources,'algorithms')).filter(x=>x.endsWith('.tex')).sort()){
  const parsed=algorithm(resolve(sources,'algorithms',filename)), chunks=[]
  for(let i=0;i<parsed.rows.length;i+=15)chunks.push(parsed.rows.slice(i,i+15))
  chunks.forEach((chunk,index)=>{const lines=chunk.map(row=>`<div class="pseudo-line ${row.kind}" style="--indent:${row.indent}"><span>${row.html}</span></div>`).join('\n');slides.push(`---\nclass: supplement pseudocode-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; EXACT PSEUDOCODE</div>\n\n# ${esc(parsed.caption)}${chunks.length>1?` (${index+1}/${chunks.length})`:''}\n\n<div class="pseudocode">${lines}</div>\n\n<p class="generated-source">Source: thesis/algorithms/${filename}</p>`)})
}

const titles={tab_summary_low_prec_ci:'Performance in the main setting',tab_summary_all_ci:'Performance across all scenarios',tab_ratios:'Budget ratios across tested scenarios',tab_scaling_with_prec_ci:'Precision scaling with 95% intervals',tab_diag_search:'What exploration finds before the safeguard',tab_diag_downstream:'How the safeguard changes the choice',tab_diag_exploration:'Exploration diagnostics across scenarios',tab_overshoot_operating:'Finite-sample detector check',tab_robustness_across_thresholds:'Robustness across reliability thresholds',tab_opt_param_first:'Selected parameters: main setting',tab_opt_param_second:'Selected parameters: remaining settings'}
slides.push(`---\nclass: supplement supplement-divider\n---\n\n<div class="supp-tag">SUPPLEMENT</div>\n\n# Generated tables\n\n<p>read directly from thesis_tables.py output</p>`)
for(const filename of readdirSync(resolve(sources,'generated-tables')).filter(x=>x.endsWith('.tex')).sort()){
  const stem=filename.slice(0,-4),rows=table(resolve(sources,'generated-tables',filename)),width=rows[0]?.length>5?' very-wide':rows[0]?.length>4?' wide':''
  const head=`<thead><tr>${rows[0].map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`,body=`<tbody>${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
  slides.push(`---\nclass: supplement generated-table-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; GENERATED TABLE</div>\n\n# ${titles[stem]||stem}\n\n<table class="backup-table auto-table${width}">${head}${body}</table>\n\n<p class="generated-source">Source: ba_thesis_sim/analysis/thesis_tables.py &rarr; ${filename}</p>`)
}

const used=new Set(['n qubit multiple uses.png','entangled circuit.png','proba_comparison.png'])
const figureTitles={'qm.png':'Quantum-metrology workflow','1qubit many uses.drawio.png':'Sequential phase-gate uses','all_plots3.png':'Estimator convergence with increasing shots','na_over_N_3.png':'Protocol error versus phase-gate uses','fig_story.png':'Convergence versus budget','fig_error_variance.png':'Estimator error and variance','fig_precision.png':'Advantage under tighter precision','fig_algorithm_diagnostics.png':'Algorithm diagnostics'}
slides.push(`---\nclass: supplement supplement-divider\n---\n\n<div class="supp-tag">SUPPLEMENT</div>\n\n# Thesis figures\n\n<p>remaining figures not already used in the main talk</p>`)
for(const filename of readdirSync(resolve(root,'public','assets','thesis')).filter(x=>x.endsWith('.png')).sort()){if(used.has(filename))continue;slides.push(`---\nclass: supplement thesis-figure-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; THESIS FIGURE</div>\n\n# ${figureTitles[filename]||filename}\n\n<img src="/assets/thesis/${filename}" alt="${esc(figureTitles[filename]||filename)}">\n\n<p class="generated-source">Source: thesis/fig/${filename}</p>`)}
writeFileSync(resolve(root,'pages','generated-supplementary.md'),slides.join('\n\n')+'\n','utf8')
console.log(`Generated ${slides.length} supplementary slides from thesis sources`)
