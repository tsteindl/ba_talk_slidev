# BA talk — Slidev

Editable Slidev presentation for the bachelor-thesis institute talk. The repository contains unpublished thesis-derived figures, theorem excerpts, algorithms, and generated results tables. Keep the GitHub repository **private**.

## Working deck

`slides-main.md` is the only working entry point. It contains:

1. the selected ice-cube opening;
2. the main talk and estimator derivation;
3. supplementary slides after the normal final slide.

The other opening files remain available as standalone alternatives but are not imported by `slides-main.md`.

## Run locally

Install Node.js 22, then:

```sh
npm ci
npm run start:local
```

Use the arrow keys to move. Press `o` for the overview and `p` for presenter mode.

## Run on the Ubuntu tower and view on the laptop

On the tower:

```sh
git clone git@github.com:YOUR-USER/ba_talk_slidev.git
cd ba_talk_slidev
nvm install
nvm use
npm ci
npm start
```

`npm start` binds Slidev to the tower's loopback interface on port 3030. It does not expose the presentation to the local network.

From the laptop, open an SSH tunnel:

```sh
ssh -L 3030:127.0.0.1:3030 YOUR-USER@YOUR-TOWER
```

Keep that SSH connection open and visit:

```text
http://127.0.0.1:3030
```

The Node/Slidev process runs on the tower; the laptop browser only displays the forwarded page. If the process should survive a dropped SSH connection, run it in `tmux` on the tower:

```sh
tmux new -s ba-talk
npm start
```

Detach with `Ctrl-B`, then `D`. Reattach with `tmux attach -t ba-talk`.

VS Code's Remote SSH extension can edit the tower checkout directly while the same tunnel serves the presentation to the laptop.

## Put this repository on GitHub

Create an empty **private** GitHub repository named `ba_talk_slidev`, without adding a README or `.gitignore`. Then run in this directory:

```sh
git remote add origin git@github.com:YOUR-USER/ba_talk_slidev.git
git push -u origin main
```

The included GitHub Actions workflow runs `npm ci` and `npm run build` on Ubuntu after every push.

## Edit the talk

- `slides-main.md` controls the working deck and slide order.
- `pages/main.md` contains the original main-talk titles and notes.
- `pages/estimator-derivation.md` contains the click-through estimator derivation.
- `pages/supplementary.md` contains the hand-designed overview and theory backup slides.
- `pages/generated-supplementary.md` is generated from LaTeX-rendered thesis crops and thesis figures.
- `components/EstimatorStory.vue` draws and animates the estimator pipeline.
- `components/BranchBounds.vue` animates how the phase prior `[0.01, 0.1]` becomes the admissible range `N = 15 … 157`.
  A slide gets an animated figure by naming it in `talk-core.js` — `{figure:'BranchBounds', clicks:4}` — and registering
  it in the `figures` map in `components/TalkBody.vue`. Click counts come from `data-fragment-index` markers in the slide
  body, so a slide whose clicks live inside a component has to declare `clicks` explicitly.
- `src/talk-core.js` contains the more elaborate deterministic figures.
- `styles/index.css` controls the visual system.
- `openings/*.md` contains the optional opening modules.
- `sources/` records the exact thesis LaTeX and generated-table provenance used by the backup slides.
- `citations.json` maps stable slide IDs to keys from the thesis bibliography.
- `sources/references.bib` is a generated snapshot of `thesis/references.bib`; do not edit it separately.

A slide is separated by `---`. Ordinary Markdown works directly; Vue components are used for diagrams and controlled animations. Presenter notes go in an HTML comment at the end of a slide:

```md
# Slide title

Visible content

<!--
Presenter notes and [Sources].
-->
```

## Refresh supplementary sources

From the full thesis workspace, first regenerate the thesis tables:

```sh
cd ba_thesis_sim
python analysis/thesis_tables.py
```

Then return to this repository and run:

```sh
python scripts/copy_supplementary_sources.py
python scripts/render_backup_assets.py
npm run supplementary:generate
```

Rebuild `thesis/main-thesis.pdf` with the normal thesis LaTeX pipeline before running these commands. The renderer locates every algorithm and table caption in that PDF, crops the compiled output, and fails if an expected caption is missing or ambiguous. Slidev displays those crops directly; it does not reinterpret the pseudocode or reconstruct the tables. Do not edit the generated slide page or crop images by hand. The committed assets make the presentation reproducible on the tower even when the thesis repository is not checked out there.

Three of those steps exist because a slide is smaller than a thesis page:

```sh
python scripts/rebalance_split_crops.py     # after render_backup_assets.py
python scripts/render_talk_tables.py        # needs pdflatex; --refresh re-runs the generator
python scripts/render_talk_theorems.py      # needs pdflatex
```

`rebalance_split_crops.py` re-cuts the two-part crops of Algorithm 4 and Algorithm 6 so both halves are the same height. The hand-picked split left the first half much taller than the second, and `object-fit: contain` then shrank it the hardest, so the linear- and binary-search pseudocode was the smallest type in the deck.

`render_talk_tables.py` re-typesets the handful of tables whose thesis caption runs several lines — 3.1, 4.1, 4.2, 4.4, B.2 and C.2. It takes the `tabular` from `analysis/thesis_tables.py` unchanged, gives it a short one-line caption, drops the explanatory footnote, and compiles it with `standalone` so the bounding box hugs the table. **Match the thesis font**: `lmodern`, which is the Latin Modern that `scrbook` gives you, not the default of `article` on a bare TeX install. `pdffonts` on the output should list the same `LMRoman*`/`LMMathItalic*` families as the corresponding page of the thesis PDF. A no-root TeX Live (TinyTeX) is enough:

```sh
wget -qO- "https://yihui.org/tinytex/install-bin-unix.sh" | sh
tlmgr install koma-script booktabs makecell multirow standalone lm amsmath
```

`render_talk_theorems.py` compiles each environment of `sources/theorems.tex` on its own and writes `theorem-*.png`, so the backup section shows the thesis statements verbatim rather than a retyped paraphrase. It fills in the thesis numbering and cross-references by hand (`NUMBERS`, `REFS` in the script), because a single environment compiled alone has no counters; check them against the thesis after renumbering.

The backup section is deliberately thin: exact statements, exact pseudocode, exact tables, thesis figures, plus one derivation (the sequential protocol) that the main talk only alludes to. Anything already shown in the main talk does not belong there — `generate-supplementary.mjs` keeps a `used` set of figures for exactly that reason, and it has to be updated when a figure moves into the main talk.

The tables it re-typesets are marked `"rendered": "talk"` in `sources/backup-crops.json`, and the slide generator credits them as re-typeset rather than as exact crops. Every other table and all pseudocode stay exact crops of the thesis PDF.

## Citations and references

The thesis bibliography remains the source of truth. In the full thesis workspace, synchronize it with:

```sh
npm run refs:sync
```

This copies `thesis/references.bib` into the portable talk repository and regenerates both the compact slide citations and the final references slide. To cite a source on another slide, add its existing BibTeX key to the corresponding stable slide ID in `citations.json`. `npm start`, `npm run start:local`, `npm run build`, and `npm run export` regenerate the presentation artifacts automatically.

The generated files `src/citations.generated.js` and `pages/references.generated.md` must not be edited by hand. If a bibliographic record needs correction, correct it once in `thesis/references.bib` and run `npm run refs:sync` again.

## Build

```sh
npm run build
```

The static result is written to `dist/`.
