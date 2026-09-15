import { mkdirSync, writeFileSync } from 'node:fs'
import { main, m, eq, states, svg, chart, text, line, circle, pipeline, ink, teal, blue, gray } from '../src/talk-core.js'
import { buildOpeningModules } from '../src/openings.js'

const modules = buildOpeningModules({ m, eq, states, svg, chart, text, line, circle, pipeline, ink, teal, blue, gray })
const config = src => `---\ntheme: default\ntitle: Evaluating adaptive quantum metrology protocols\ncolorSchema: light\ncanvasWidth: 1280\naspectRatio: 16/9\ntransition: none\nfonts:\n  provider: none\nmdc: true\nsrc: ${src}\n---\n`
const clicks = body => Math.max(-1, ...[...body.matchAll(/data-fragment-index="(\d+)"/g)].map(x => +x[1])) + 1
const note = text => `<!--\n${text.replaceAll('--', '—')}\n-->`

function content(slide, { number, module = '', index = 0, first = false } = {}) {
  const n = clicks(slide.body)
  const frontmatter = first
    ? (n ? `---\nclicks: ${n}\n---\n\n` : '')
    : (n ? `---\nclicks: ${n}\n---\n\n` : `---\n\n`)
  const title = slide.title ? `# ${slide.title}\n\n` : ''
  return `${frontmatter}${title}<TalkBody :number="${number || 1}"${module ? ` module="${module}" :index="${index}"` : ''} :clicks="$clicks" :page="$page" />\n\n${note(slide.notes)}`
}

mkdirSync(new URL('../pages/', import.meta.url), { recursive: true })
mkdirSync(new URL('../openings/', import.meta.url), { recursive: true })
writeFileSync(new URL('../pages/title.md', import.meta.url), content(main[0], { number: 1, first: true }) + '\n')
writeFileSync(new URL('../pages/main.md', import.meta.url), main.slice(1).map((slide, i) => content(slide, { number: i + 2, first: i === 0 })).join('\n\n') + '\n')

for (const [key, items] of Object.entries(modules)) {
  const slides = items.map(([title, body, notes], i) => content({ title, body, notes }, { module: key, index: i, first: i === 0 })).join('\n\n') + '\n'
  writeFileSync(new URL(`../openings/${key}.md`, import.meta.url), slides)
  writeFileSync(new URL(`../slides-${key}.md`, import.meta.url), config('./pages/title.md') + `\n---\nsrc: ./openings/${key}.md\n---\n\n---\nsrc: ./pages/main.md\n---\n`)
}

writeFileSync(new URL('../slides.md', import.meta.url), config('./pages/title.md') + '\n---\nsrc: ./pages/main.md\n---\n')
console.log(`Generated ${main.length} main slides and ${Object.keys(modules).length} removable opening files.`)
