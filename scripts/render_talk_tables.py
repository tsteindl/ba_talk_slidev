"""Re-render the thesis tables that do not fit on a slide.

Most backup slides use exact crops of `thesis/main-thesis.pdf`
(`scripts/render_backup_assets.py`). A handful of those tables carry a caption
paragraph several lines long, so `object-fit: contain` shrinks the numbers until
they are unreadable on a projector.

For those tables only, this script takes the `tabular` body produced by
`ba_thesis_sim/analysis/thesis_tables.py` byte-for-byte, replaces the long
caption with a short one, drops the explanatory footnote, and compiles the
result on its own. The font is the one the thesis uses -- Latin Modern via
`lmodern`, which is what `scrbook` gives you -- and `standalone` makes the PDF
bounding box hug the table, so the slide scales the numbers up instead of down.

The generator writes two registers: `results/tex` (the compact tables the main
chapters use) and `results/tex_long` (the scenario-grouped appendix tables).
Each entry below names the register the thesis actually typeset.

    python scripts/render_talk_tables.py            # use existing generator output
    python scripts/render_talk_tables.py --refresh  # re-run the generator first

Requires a LaTeX installation on PATH (TinyTeX is enough) and `pdftoppm`.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SIM = HERE.parent / "ba_thesis_sim"
OUTPUT = HERE / "public" / "assets" / "backup-latex"

# Cross-references the thesis resolves through its own .aux file. A single table
# compiled on its own has no .aux, so the numbers are supplied explicitly.
REFS = {
    "alg:simulation": "1",
    "alg:simulate-entangled": "2",
    "alg:brute-force": "3",
    "alg:linear-search": "4",
    "alg:statistical-safeguard": "5",
    "alg:binary-search": "6",
    "alg:reverse-engineering": "7",
    "tab:summary-low-prec-ci": "4.1",
    "tab:summary-all-ci": "4.2",
    "tab:ratios": "4.3",
    "tab:scaling-with-prec-ci": "4.4",
    "tab:diag-search": "4.5",
    "tab:diag-downstream": "4.6",
    "tab:robustness-across-thresholds": "B.1",
    "tab:diag-exploration": "B.2",
    "tab:diag-exploration-priors": "B.3",
    "tab:opt-param-first-tab": "C.1",
    "tab:opt-param-second-tab": "C.2",
    "tab:overshoot-operating": "3.1",
    "lemma:asymp-dist-est": "2.6.3",
    "thm:stat-safeguard": "3.1",
}

# Only the tables whose thesis caption makes them illegible on a slide.
# `register` is the generator directory the thesis typeset from, `block` selects
# one table when a generator file holds several, and `part` splits a
# scenario-grouped table into (index, count) shares that each fit a slide.
TABLES = [
    dict(out="table-03-01.png", file="tab_overshoot_operating", register="tex",
         number="3.1",
         caption="Normal quantile against the exact Kolmogorov distance"),
    dict(out="table-04-01.png", file="tab_summary_low_prec_ci", register="tex",
         number="4.1",
         caption=r"Algorithm performance at $\epsilon=10^{-3}$, "
                 r"$\phi\sim\mathcal{U}(0.01,0.1)$"),
    dict(out="table-04-02.png", file="tab_summary_all_ci", register="tex",
         number="4.2", caption=r"Budget required to reach $90\%$ convergence"),
    dict(out="table-04-04.png", file="tab_scaling_with_prec_ci", register="tex",
         number="4.4", caption="Improvement factor over the brute-force baseline"),
    dict(out="table-b-02a.png", file="tab_diag_exploration", register="tex_long",
         block=0, part=(0, 2), number="B.2",
         caption=r"Quality of the $N$ exploration returns, "
                 r"before the safeguard (1/2)"),
    dict(out="table-b-02b.png", file="tab_diag_exploration", register="tex_long",
         block=0, part=(1, 2), number="B.2",
         caption=r"Quality of the $N$ exploration returns, "
                 r"before the safeguard (2/2)"),
    dict(out="table-c-02.png", file="tab_opt_param_second", register="tex",
         number="C.2",
         caption=r"Parameter configurations near the $90\%$-convergence budget"),
]

PREAMBLE = r"""\documentclass[border=5pt]{standalone}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{amsmath,amssymb}
\usepackage{booktabs,makecell,multirow,array}
\makeatletter
\newcommand{\talkref}[2]{\expandafter\gdef\csname talkref@#1\endcsname{#2}}
\renewcommand{\ref}[1]{%
  \ifcsname talkref@#1\endcsname\csname talkref@#1\endcsname\else\textbf{??}\fi}
\makeatother
%REFS%
\newsavebox{\talktable}
\begin{document}
\savebox{\talktable}{%
%BODY%
}%
% The minipage is exactly as wide as the table, so the standalone bounding box
% hugs it and the caption wraps to the table width, not to a page width.
\begin{minipage}{\wd\talktable}
\centering
{\small\textbf{Table %NUM%:} %CAPTION%}\par\medskip
\usebox{\talktable}
\end{minipage}
\end{document}
"""

GROUP = re.compile(r"^\\multicolumn\{\d+\}\{l\}\{\\itshape")


def read_block(spec: dict) -> str:
    path = SIM / "results" / spec["register"] / f"{spec['file']}.tex"
    if not path.exists():
        raise SystemExit(f"generator output missing: {path}\nrun again with --refresh")
    blocks = re.findall(r"\\begin\{table\}.*?\\end\{table\}", path.read_text(), re.S)
    if not blocks:
        raise RuntimeError(f"no table environment in {path}")
    return blocks[spec.get("block", 0)]


def tabular_only(tex: str) -> str:
    """Keep the tabular and its size/tabcolsep setup; drop float, caption, foot.

    The numbers, column specification and rules are untouched.
    """
    body = re.search(r"\\begin\{tabular\}.*?\\end\{tabular\}", tex, re.S)
    if not body:
        raise RuntimeError("no tabular environment in generated table")
    setup = [line for line in tex[: body.start()].splitlines()
             if line.startswith((r"\small", r"\footnotesize", r"\scriptsize",
                                 r"\setlength{\tabcolsep}"))]
    return "\n".join(setup + [body.group(0)])


def take_part(tex: str, index: int, count: int) -> str:
    """Keep one share of a scenario-grouped table, with its column header intact."""
    lines = tex.splitlines()
    starts = [i for i, line in enumerate(lines) if GROUP.match(line)]
    if len(starts) < count:
        raise RuntimeError(f"expected at least {count} scenario groups, got {len(starts)}")
    end = next(i for i, line in enumerate(lines) if line.startswith(r"\bottomrule"))
    bounds = starts + [end]
    groups = [[line for line in lines[bounds[i]: bounds[i + 1]]
               if not line.startswith(r"\midrule")] for i in range(len(starts))]
    size = -(-len(groups) // count)                      # ceiling division
    out = list(lines[: starts[0]])
    for i, group in enumerate(groups[index * size: (index + 1) * size]):
        if i:
            out.append(r"\midrule")
        out += group
    return "\n".join(out + [r"\bottomrule", r"\end{tabular}"])


def render(spec: dict, body: str, tmp: Path) -> Path:
    refs = "\n".join(rf"\talkref{{{k}}}{{{v}}}" for k, v in REFS.items())
    doc = (PREAMBLE.replace("%REFS%", refs).replace("%NUM%", spec["number"])
           .replace("%CAPTION%", spec["caption"]).replace("%BODY%", body))
    stem = tmp / Path(spec["out"]).stem
    stem.with_suffix(".tex").write_text(doc, encoding="utf-8")
    run = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error",
                          stem.with_suffix(".tex").name],
                         cwd=tmp, capture_output=True, text=True)
    if run.returncode or not stem.with_suffix(".pdf").exists():
        log = stem.with_suffix(".log")
        tail = log.read_text(errors="replace")[-2500:] if log.exists() else run.stdout[-2500:]
        raise RuntimeError(f"pdflatex failed for {spec['out']}:\n{tail}")
    subprocess.run(["pdftoppm", "-png", "-r", "300", "-singlefile",
                    stem.with_suffix(".pdf").name, stem.name],
                   cwd=tmp, check=True, capture_output=True)
    return stem.with_suffix(".png")


def refresh() -> None:
    for extra in ([], ["--long"]):
        subprocess.run([sys.executable, "analysis/thesis_tables.py", *extra],
                       cwd=SIM, check=True)


def main() -> None:
    if not shutil.which("pdflatex"):
        raise SystemExit("pdflatex not on PATH (install TinyTeX or TeX Live)")
    if not SIM.exists():
        raise SystemExit(f"thesis simulation repository not found: {SIM}")
    if "--refresh" in sys.argv:
        refresh()

    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as raw:
        tmp = Path(raw)
        for spec in TABLES:
            body = tabular_only(read_block(spec))
            if "part" in spec:
                body = take_part(body, *spec["part"])
            shutil.copyfile(render(spec, body, tmp), OUTPUT / spec["out"])
            print(f"rendered {spec['out']} (Table {spec['number']})")

    stale = OUTPUT / "table-b-02.png"       # earlier single-image attempt
    if stale.exists():
        stale.unlink()

    # Mark the re-typeset entries so the slide generator credits them correctly
    # instead of claiming they are exact crops of the thesis PDF.
    manifest_path = HERE / "sources" / "backup-crops.json"
    manifest = json.loads(manifest_path.read_text())
    retypeset = {spec["out"] for spec in TABLES}
    for entry in manifest:
        if entry["file"] in retypeset:
            entry["rendered"] = "talk"
        else:
            entry.pop("rendered", None)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"marked {len(retypeset)} re-typeset entries in {manifest_path.name}")


if __name__ == "__main__":
    main()
