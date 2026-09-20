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
- `pages/generated-supplementary.md` is generated from the shared algorithm files, generated tables, and thesis figures.
- `components/EstimatorStory.vue` draws and animates the estimator pipeline.
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
npm run supplementary:generate
```

The thesis imports its pseudocode from `thesis/algorithms/*.tex`; the sync script copies those exact files. Every table slide is parsed from the `.tex` files emitted by `ba_thesis_sim/analysis/thesis_tables.py`. Do not edit the generated slide page by hand. The committed source snapshots make the presentation reproducible on the tower even when the thesis repository is not checked out there.

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
