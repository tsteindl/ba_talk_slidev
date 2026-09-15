# Estimating an Unknown Quantum Phase — Slidev edition

This is the editable Markdown/Vue version of the institute talk. The original Reveal.js version remains in `../institute-talk-v1`.

The local assets include thesis-derived figures. Keep this repository private unless those figures are cleared for publication.

## Start the presentation

Install Node.js once, then run:

```sh
npm install
npm start
```

`npm start` opens the current working version: the ice-cube opening followed by the animated estimator explanation and the full talk.

Other useful versions:

```sh
npm run main             # faithful 23-slide port without an opening
npm run ice              # ice opening + faithful main talk
npm run echo             # echo opening + faithful main talk
npm run shadow           # shadow-length opening + faithful main talk
npm run sun-angle        # infer the solar-elevation angle from a shadow
npm run cookie-reference
npm run cookie-law
npm run pumpkin-oil
```

Use the arrow keys to move. Press `o` for the overview and `p` for presenter mode.

## Edit it

The presentation is deliberately split by what is easiest to edit:

- `slides-ice-expanded.md` controls the order of the current working deck.
- `pages/estimator-derivation.md` contains the new click-through derivation.
- `pages/main.md` contains the titles and speaker notes of the faithful main talk.
- `openings/*.md` contains each optional three-slide opening.
- `components/EstimatorStory.vue` draws and animates the phase-to-estimate pipeline.
- `src/talk-core.js` and `src/openings.js` contain the more elaborate SVG/HTML figures carried over from Reveal.
- `styles/index.css` controls the visual design.
- `public/assets/thesis` contains the selectively reused thesis circuit figures.

A Slidev slide is separated by `---`. Ordinary Markdown works directly. Vue components can be placed inside a slide when a diagram or animation needs more control. Presenter notes go in an HTML comment at the end of a slide:

```md
# Slide title

Visible content

<!--
Presenter notes.
-->
```

The thesis circuit figures are included only where they support the estimator derivation. Keep the large type, whitespace, and one-main-idea-per-slide structure when adding material; a paper figure usually needs cropping, simplification, or its own slide before it works in a talk.

## Build

```sh
npm run build
```

The static result is written to `dist/`.
