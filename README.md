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
- `pages/supplementary.md` contains all backup slides.
- `components/EstimatorStory.vue` draws and animates the estimator pipeline.
- `src/talk-core.js` contains the more elaborate deterministic figures.
- `styles/index.css` controls the visual system.
- `openings/*.md` contains the optional opening modules.
- `sources/` records the exact thesis LaTeX and generated-table provenance used by the backup slides.

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
```

The committed source excerpts make the presentation reproducible on the tower even when the thesis repository is not checked out there.

## Build

```sh
npm run build
```

The static result is written to `dist/`.
