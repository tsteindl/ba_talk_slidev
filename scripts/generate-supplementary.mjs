import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const crops = JSON.parse(readFileSync(resolve(root, 'sources', 'backup-crops.json'), 'utf8'))
const slides = []

function divider(title, detail) {
  slides.push(`---\nclass: supplement supplement-divider\n---\n\n<div class="supp-tag">SUPPLEMENT</div>\n\n# ${title}\n\n<p>${detail}</p>`)
}

function cropSlides(kind, tag) {
  for (const crop of crops.filter(item => item.kind === kind)) {
    slides.push(`---\nclass: supplement latex-crop-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; ${tag}</div>\n\n<img src="/assets/backup-latex/${crop.file}" alt="${crop.anchor}">\n\n<p class="generated-source">Exact crop from thesis/main-thesis.pdf, PDF page ${crop.thesis_page}</p>`)
  }
}

divider('Exact pseudocode', 'rendered by the thesis LaTeX compiler')
cropSlides('algorithm', 'LATEX ALGORITHM')
divider('Generated tables', 'rendered by the thesis LaTeX compiler')
cropSlides('table', 'LATEX TABLE')

const used = new Set(['n qubit multiple uses.png', 'entangled circuit.png', 'proba_comparison.png'])
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
divider('Thesis figures', 'remaining figures not already used in the main talk')
for (const filename of readdirSync(resolve(root, 'public', 'assets', 'thesis')).filter(name => name.endsWith('.png')).sort()) {
  if (used.has(filename)) continue
  slides.push(`---\nclass: supplement thesis-figure-slide\n---\n\n<div class="supp-tag">SUPPLEMENT &middot; THESIS FIGURE</div>\n\n# ${titles[filename] || filename}\n\n<img src="/assets/thesis/${filename}" alt="${titles[filename] || filename}">\n\n<p class="generated-source">Source: thesis/fig/${filename}</p>`)
}

writeFileSync(resolve(root, 'pages', 'generated-supplementary.md'), slides.join('\n\n') + '\n', 'utf8')
console.log(`Generated ${slides.length} supplementary slides from rendered thesis assets`)
