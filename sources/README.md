# Supplementary-source provenance

- `theorems.tex`: exact environments extracted from `thesis/02-theory.tex` and `thesis/03-methodology.tex`.
- `algorithms.tex`: exact algorithm environments extracted from `thesis/03-methodology.tex`.
- `generated-tables/`: output of `ba_thesis_sim/analysis/thesis_tables.py` using the current result CSVs.

Run `scripts/copy_supplementary_sources.py` from the full thesis workspace after regenerating tables.

`references.bib` is a generated snapshot of `thesis/references.bib`. Refresh it with `npm run refs:sync`; do not edit it independently.
