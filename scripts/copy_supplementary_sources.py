"""Synchronize exact thesis algorithms, theorems, figures, and generated tables."""

from pathlib import Path
import shutil

HERE = Path(__file__).resolve().parents[1]
WORKSPACE = HERE.parent
SOURCE_DIR = HERE / "sources"
TABLE_DIR = SOURCE_DIR / "generated-tables"
ALGORITHM_DIR = SOURCE_DIR / "algorithms"
FIGURE_DIR = HERE / "public" / "assets" / "thesis"
SOURCE_DIR.mkdir(exist_ok=True)
TABLE_DIR.mkdir(exist_ok=True)
ALGORITHM_DIR.mkdir(exist_ok=True)
FIGURE_DIR.mkdir(parents=True, exist_ok=True)


def environment_with_label(text: str, label: str, environments: tuple[str, ...]) -> str:
    label_token = rf"\label{{{label}}}"
    # Some older variants are retained as commented LaTeX. The active environment is last.
    label_at = text.rfind(label_token)
    candidates = []
    for environment in environments:
        start_token = rf"\begin{{{environment}}}"
        start = text.rfind(start_token, 0, label_at)
        if start >= 0:
            candidates.append((start, environment))
    if not candidates:
        raise ValueError(f"No supported environment before {label}")
    start, environment = max(candidates)
    end_token = rf"\end{{{environment}}}"
    end = text.index(end_token, label_at) + len(end_token)
    return text[start:end]


theory = (WORKSPACE / "thesis" / "02-theory.tex").read_text(encoding="utf-8")
methodology = (WORKSPACE / "thesis" / "03-methodology.tex").read_text(encoding="utf-8")

theorem_labels = [
    "thm:qcrb",
    "fact:sql-vs-hl",
    "thm:delta-method",
    "lemma:asymp-dist-est",
    "thm:asympt-dist-given-pilot",
    "thm:stat-safeguard",
]
theorem_parts = []
for label in theorem_labels:
    source = methodology if label.startswith("thm:asympt") or label == "thm:stat-safeguard" else theory
    theorem_parts.append(f"% ---- {label} ----\n" + environment_with_label(source, label, ("theorem", "lemma", "fact")))
(SOURCE_DIR / "theorems.tex").write_text("\n\n".join(theorem_parts) + "\n", encoding="utf-8", newline="\n")

algorithm_source = WORKSPACE / "thesis" / "algorithms"
algorithm_files = sorted(algorithm_source.glob("*.tex"))
if not algorithm_files:
    raise FileNotFoundError("No shared thesis algorithms found under thesis/algorithms")
for algorithm in algorithm_files:
    shutil.copy2(algorithm, ALGORITHM_DIR / algorithm.name)
(SOURCE_DIR / "algorithms.tex").write_text(
    "\n\n".join((ALGORITHM_DIR / path.name).read_text(encoding="utf-8").rstrip() for path in algorithm_files) + "\n",
    encoding="utf-8",
    newline="\n",
)

generated = WORKSPACE / "ba_thesis_sim" / "results" / "tex"
for table in generated.glob("*.tex"):
    shutil.copy2(table, TABLE_DIR / table.name)

figure_source = WORKSPACE / "thesis" / "fig"
figure_files = sorted(figure_source.glob("*.png"))
for figure in figure_files:
    shutil.copy2(figure, FIGURE_DIR / figure.name)

(SOURCE_DIR / "README.md").write_text(
    "# Supplementary-source provenance\n\n"
    "- `theorems.tex`: exact environments extracted from `thesis/02-theory.tex` and `thesis/03-methodology.tex`.\n"
    "- `algorithms/`: exact files imported by `thesis/03-methodology.tex`.\n"
    "- `algorithms.tex`: generated concatenation for quick inspection.\n"
    "- `generated-tables/`: output of `ba_thesis_sim/analysis/thesis_tables.py` using the current result CSVs.\n\n"
    "- `public/assets/thesis/`: synchronized thesis figures.\n\n"
    "- `references.bib`: generated snapshot of the thesis bibliography.\n\n"
    "Run `scripts/copy_supplementary_sources.py` from the full thesis workspace after regenerating tables.\n",
    encoding="utf-8",
    newline="\n",
)

print(f"Copied {len(theorem_labels)} theorem/fact environments, {len(algorithm_files)} algorithms, {len(list(TABLE_DIR.glob('*.tex')))} tables, and {len(figure_files)} figures.")
