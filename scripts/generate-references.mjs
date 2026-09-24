import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const snapshot = resolve(root, 'sources', 'references.bib')
const thesisBib = resolve(root, '..', 'thesis', 'references.bib')
const shouldSync = process.argv.includes('--sync')

if (shouldSync) {
  if (!existsSync(thesisBib)) throw new Error(`Thesis bibliography not found: ${thesisBib}`)
  copyFileSync(thesisBib, snapshot)
  console.log('Synced sources/references.bib from thesis/references.bib')
}
if (!existsSync(snapshot)) throw new Error('Missing sources/references.bib; run npm run refs:sync in the full thesis workspace')

function splitTopLevel(text) {
  const parts = []
  let start = 0, braces = 0, quote = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"' && text[i - 1] !== '\\') quote = !quote
    if (!quote && char === '{') braces++
    if (!quote && char === '}') braces--
    if (!quote && braces === 0 && char === ',') {
      parts.push(text.slice(start, i)); start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

function parseBib(text) {
  const entries = new Map()
  let cursor = 0
  while ((cursor = text.indexOf('@', cursor)) !== -1) {
    const open = text.indexOf('{', cursor)
    if (open === -1) break
    const type = text.slice(cursor + 1, open).trim().toLowerCase()
    let depth = 1, quote = false, end = open + 1
    for (; end < text.length && depth; end++) {
      const char = text[end]
      if (char === '"' && text[end - 1] !== '\\') quote = !quote
      if (!quote && char === '{') depth++
      if (!quote && char === '}') depth--
    }
    const body = text.slice(open + 1, end - 1)
    const comma = body.indexOf(',')
    const key = body.slice(0, comma).trim()
    const fields = {}
    for (const chunk of splitTopLevel(body.slice(comma + 1))) {
      const match = chunk.match(/^\s*([\w-]+)\s*=\s*([\s\S]+?)\s*$/)
      if (!match) continue
      fields[match[1].toLowerCase()] = match[2].replace(/^\{|\}$/g, '').replace(/^"|"$/g, '').trim()
    }
    entries.set(key, { key, type, ...fields })
    cursor = end
  }
  return entries
}

const latexCommands = new Map([
  ['\\&', '&'], ['--', '–'], ['``', '“'], ["''", '”'], ['\\textendash', '–']
])
function plain(value = '') {
  let result = value
  for (const [from, to] of latexCommands) result = result.split(from).join(to)
  return result
    .replace(/\\url\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\s*/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
function escapeHtml(value = '') {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}
function authorSurname(author) {
  const clean = plain(author).replace(/family=([^,]+),\s*given=([^,]+).*$/i, '$1')
  return clean.includes(',') ? clean.split(',')[0].trim() : clean.trim().split(/\s+/).at(-1)
}
function shortLabel(entry) {
  const authors = (entry.author || '').split(/\s+and\s+/i).map(authorSurname)
  const name = authors.length > 2 ? `${authors[0]} et al.` : authors.join(' & ')
  return `${name || plain(entry.title)} ${plain(entry.date).slice(0, 4)}`.trim()
}
function fullReference(entry) {
  const authorList = (entry.author || '').split(/\s+and\s+/i).map(plain)
  const authors = authorList.length > 3 ? `${authorList.slice(0, 3).join('; ')}; et al.` : authorList.join('; ')
  const year = plain(entry.date).slice(0, 4)
  const title = plain(entry.title)
  const venue = plain(entry.journaltitle || entry.publisher || entry.institution || entry.type)
  const detail = [entry.volume && plain(entry.volume), entry.number && `(${plain(entry.number)})`, entry.pages && `, ${plain(entry.pages)}`].filter(Boolean).join('')
  const doi = entry.doi ? ` doi:${plain(entry.doi)}` : ''
  const url = !entry.doi && entry.url ? ` ${plain(entry.url)}` : ''
  return `${authors}. (${year}). <i>${title}</i>. ${venue}${detail ? `, ${detail}` : ''}.${doi}${url}`.replace(/\s+/g, ' ').trim()
}

const groups = JSON.parse(readFileSync(resolve(root, 'citations.json'), 'utf8'))
const bibText = readFileSync(snapshot, 'utf8')
const bib = parseBib(bibText)
const keys = [...new Set(Object.values(groups).flat())]
const missing = keys.filter(key => !bib.has(key))
if (missing.length) throw new Error(`Citation keys missing from sources/references.bib: ${missing.join(', ')}`)
for (const key of keys) {
  const entry = bib.get(key)
  const required = ['author', 'title', 'date']
  if (entry.type === 'article') required.push('journaltitle', 'volume', 'pages')
  if (entry.type === 'software' || entry.type === 'online') required.push('url')
  const absent = required.filter(field => !entry[field])
  if (absent.length) throw new Error(`${key}: missing required field(s): ${absent.join(', ')}`)
  if (entry.type === 'article' && !entry.doi && !entry.note) throw new Error(`${key}: article has neither DOI nor an explanatory note`)
}

const refs = Object.fromEntries(keys.map((key, index) => {
  const entry = bib.get(key)
  return [key, { key, number: index + 1, short: shortLabel(entry), title: plain(entry.title), full: fullReference(entry) }]
}))
writeFileSync(resolve(root, 'src', 'citations.generated.js'), `// Generated by scripts/generate-references.mjs; do not edit.\nexport const citationGroups = ${JSON.stringify(groups, null, 2)}\nexport const referencesByKey = ${JSON.stringify(refs, null, 2)}\n`, 'utf8')

const items = keys.map(key => {
  const ref = refs[key]
  return `<div class="reference-entry"><b>[${ref.number}]</b><span>${escapeHtml(ref.full).replaceAll('&lt;i&gt;', '<i>').replaceAll('&lt;/i&gt;', '</i>')}</span></div>`
}).join('\n')
const hash = createHash('sha256').update(bibText).digest('hex')
const page = `---\nclass: references-slide\n---\n\n<div class="supp-tag">REFERENCES</div>\n\n# References\n\n<div class="reference-grid">\n${items}\n</div>\n`
writeFileSync(resolve(root, 'pages', 'references.generated.md'), page, 'utf8')
console.log(`Generated citations for ${Object.keys(groups).length} slides and ${keys.length} references`)
