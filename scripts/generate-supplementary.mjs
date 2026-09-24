import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const crops = JSON.parse(readFileSync(resolve(root, 'sources', 'backup-crops.json'), 'utf8'))
const slides = []

function divider(title, detail = '') {
  slides.push(`---\nclass: supplement supplement-divider\n---\n\n<div class="supp-tag">SUPPLEMENT</div>\n\n# ${title}${detail ? `\n\n<p>${detail}</p>` : ''}`)
}

function cropSlides(kind, tag) {
  for (const crop of crops.filter(item => item.kind === kind)) {
    const origin = crop.rendered === 'talk'
      ? `Re-typeset for the talk from the thesis table generator, short caption, same Latin Modern font. Values are the generator's, unchanged.`
      : `Exact crop from thesis/main-thesis.pdf, PDF page ${crop.thesis_page}.`
    slides.push(`---\nclass: supplement latex-crop-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; ${tag}</div>\n\n<img src="/assets/backup-latex/${crop.file}" alt="${crop.anchor}">\n\n<!--\n${origin}\n-->`)
  }
}

// Theorems first: the exact environments, compiled from sources/theorems.tex.
const theorems = JSON.parse(readFileSync(resolve(root, 'sources', 'theorem-crops.json'), 'utf8'))
for (const item of theorems.filter(t => t.label !== 'fact:sql-vs-hl')) {
  const name = `${item.kind} ${item.number}${item.title ? ' \u2014 ' + item.title : ''}`
  slides.push(`---\nclass: supplement latex-crop-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; LATEX STATEMENT</div>\n\n<img src="/assets/backup-latex/${item.file}" alt="${name}">${(item.cites || []).length ? '\n\n<SlideCite id="supp-theorem-pilot" />' : ''}`)
}

divider('Algorithms pseudocode')
cropSlides('algorithm', 'LATEX ALGORITHM')
divider('Thesis tables')
cropSlides('table', 'LATEX TABLE')

// Figures the main talk already shows; the backup section must not repeat them.
const used = new Set(['n qubit multiple uses.png', 'entangled circuit.png', 'proba_comparison.png',
  '1 qubit single use.drawio.png', 'all_plots3.png', 'na_over_N_3.png',
  'fig_precision.png', '1qubit many uses.drawio.png', 'qm.png'])
const titles = {
  'qm.png': 'Quantum-metrology workflow',
  '1qubit many uses.drawio.png': 'Sequential phase-gate uses',
  'all_plots3.png': 'Estimator convergence with increasing shots',
  'na_over_N_3.png': 'Protocol error versus phase-gate uses',
  'fig_story.png': 'Convergence versus budget',
  'fig_error_variance.png': 'Estimator error and variance',
  'fig_precision.png': 'Advantage under tighter precision',
  'fig_algorithm_diagnostics.png': 'Algorithm diagnostics',
}
divider('Thesis figures')
for (const filename of readdirSync(resolve(root, 'public', 'assets', 'thesis')).filter(name => name.endsWith('.png')).sort()) {
  if (used.has(filename)) continue
  slides.push(`---\nclass: supplement thesis-figure-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; THESIS FIGURE</div>\n\n# ${titles[filename] || filename}\n\n<img src="/assets/thesis/${filename}" alt="${titles[filename] || filename}">`)
}

writeFileSync(resolve(root, 'pages', 'generated-supplementary.md'), slides.join('\n\n') + '\n', 'utf8')
console.log(`Generated ${slides.length} supplementary slides from rendered thesis assets`)
