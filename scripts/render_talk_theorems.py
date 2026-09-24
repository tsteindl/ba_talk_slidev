"""Render the thesis theorem environments exactly, for the backup slides.

`sources/theorems.tex` holds the environments as the thesis states them, copied
out verbatim by `scripts/copy_supplementary_sources.py`. Retyping them into HTML
loses the thesis wording, so instead each environment is compiled on its own
with the thesis font -- Latin Modern via `lmodern`, what `scrbook` gives you --
and `standalone`, so the slide shows the real thing.

    python scripts/render_talk_theorems.py

Requires a LaTeX installation on PATH (TinyTeX is enough) and `pdftoppm`.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SOURCE = HERE / "sources" / "theorems.tex"
OUTPUT = HERE / "public" / "assets" / "backup-latex"
MANIFEST = HERE / "sources" / "theorem-crops.json"

# The thesis numbers these; a single environment compiled alone has no counter,
# so the numbers are supplied here and shown exactly as the thesis shows them.
NUMBERS = {
    "thm:qcrb": ("Theorem", "2.5.1"),
    "fact:sql-vs-hl": ("Fact", "2.6.1"),
    "thm:delta-method": ("Theorem", "2.6.2"),
    "lemma:asymp-dist-est": ("Lemma", "2.6.3"),
    "thm:asympt-dist-given-pilot": ("Theorem", "3.2.1"),
    "thm:stat-safeguard": ("Theorem", "3.2.2"),
}

# Cross-references the thesis resolves through its .aux file.
REFS = {
    "thm:qcrb": "2.5.1",
    "fact:sql-vs-hl": "2.6.1",
    "thm:delta-method": "2.6.2",
    "lemma:asymp-dist-est": "2.6.3",
    "thm:asympt-dist-given-pilot": "3.2.1",
    "thm:stat-safeguard": "3.2.2",
    "eq:est-ent": "2.10",
    "alg:statistical-safeguard": "5",
}

PREAMBLE = r"""\documentclass[border=6pt]{standalone}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage{amsmath,amssymb,amsthm}
\usepackage{varwidth}
\makeatletter
\newcommand{\talkref}[2]{\expandafter\gdef\csname talkref@#1\endcsname{#2}}
\renewcommand{\ref}[1]{%
  \ifcsname talkref@#1\endcsname\csname talkref@#1\endcsname\else\textbf{??}\fi}
\newcommand{\talkcite}[2]{\expandafter\gdef\csname talkcite@#1\endcsname{#2}}
\renewcommand{\cite}[1]{%
  \ifcsname talkcite@#1\endcsname[\csname talkcite@#1\endcsname]\else\textbf{[?]}\fi}
\makeatother
%REFS%
%CITES%
% The thesis numbers come from its own counters, so they are set literally.
% amsthm's `definition' style: bold run-in heading, upright body -- what the
% thesis uses. Citations resolve to the talk's own reference numbers.
\newenvironment{talkbox}[1]{\par\noindent\textbf{#1.}\ }{\par}
\begin{document}
\begin{varwidth}{%WIDTH%pt}
%BODY%
\end{varwidth}
\end{document}
"""

ENV = re.compile(
    r"\\begin\{(theorem|lemma|fact|definition|corollary|proposition)\}"
    r"(\[[^\]]*\])?\\label\{([^}]*)\}(.*?)\\end\{\1\}", re.S)


def environments() -> list[dict]:
    text = SOURCE.read_text(encoding="utf-8")
    found = []
    for match in ENV.finditer(text):
        kind, title, label, body = match.groups()
        found.append({
            "label": label,
            "title": (title or "")[1:-1],
            "body": body.strip(),
        })
    if not found:
        raise RuntimeError(f"no theorem environments in {SOURCE}")
    return found


CITE = re.compile(r"\\cite\{([^}]*)\}")


def reference_numbers() -> dict[str, int]:
    """The talk's own reference numbers, from the generated citation module.

    The thesis numbers its bibliography differently, so a theorem lifted from it
    has to be renumbered to match the deck's References slide.
    """
    generated = HERE / "src" / "citations.generated.js"
    if not generated.exists():
        raise SystemExit("run `npm run refs:generate` first: " + str(generated))
    text = generated.read_text(encoding="utf-8")
    body = text[text.index("referencesByKey = ") + len("referencesByKey = "):].strip()
    return {k: v["number"] for k, v in json.loads(body).items()}


def numberless(body: str) -> str:
    """A standalone environment has no equation counter, so drop the numbers."""
    for env in ("align", "equation", "gather"):
        body = body.replace(rf"\begin{{{env}}}", rf"\begin{{{env}*}}")
        body = body.replace(rf"\end{{{env}}}", rf"\end{{{env}*}}")
    return body


def render(item: dict, tmp: Path, width: int = 430) -> Path:
    kind, number = NUMBERS.get(item["label"], ("Theorem", ""))
    heading = f"{kind} {number}" if number else kind
    if item["title"]:
        heading += f" ({item['title']})"
    body = (rf"\begin{{talkbox}}{{{heading}}}" + "\n" + numberless(item["body"])
            + "\n" + r"\end{talkbox}")
    refs = "\n".join(rf"\talkref{{{k}}}{{{v}}}" for k, v in REFS.items())
    numbers = reference_numbers()
    keys = [k for group in CITE.findall(item["body"]) for k in group.split(",")]
    missing = [k.strip() for k in keys if k.strip() not in numbers]
    if missing:
        raise SystemExit(f"{item['label']} cites {missing}, which are not in citations.json")
    cites = "\n".join(rf"\talkcite{{{k.strip()}}}{{{numbers[k.strip()]}}}" for k in keys)
    doc = (PREAMBLE.replace("%REFS%", refs).replace("%CITES%", cites)
           .replace("%WIDTH%", str(width)).replace("%BODY%", body))
    stem = tmp / item["label"].replace(":", "-")
    stem.with_suffix(".tex").write_text(doc, encoding="utf-8")
    run = subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error",
                          stem.with_suffix(".tex").name],
                         cwd=tmp, capture_output=True, text=True)
    if run.returncode or not stem.with_suffix(".pdf").exists():
        log = stem.with_suffix(".log")
        tail = log.read_text(errors="replace")[-2500:] if log.exists() else run.stdout[-2500:]
        raise RuntimeError(f"pdflatex failed for {item['label']}:\n{tail}")
    subprocess.run(["pdftoppm", "-png", "-r", "300", "-singlefile",
                    stem.with_suffix(".pdf").name, stem.name],
                   cwd=tmp, check=True, capture_output=True)
    return stem.with_suffix(".png")


def main() -> None:
    if not shutil.which("pdflatex"):
        raise SystemExit("pdflatex not on PATH (install TinyTeX or TeX Live)")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    with tempfile.TemporaryDirectory() as raw:
        tmp = Path(raw)
        for item in environments():
            name = "theorem-" + item["label"].replace(":", "-") + ".png"
            shutil.copyfile(render(item, tmp), OUTPUT / name)
            kind, number = NUMBERS.get(item["label"], ("Theorem", ""))
            cited = sorted({k.strip() for g in CITE.findall(item["body"]) for k in g.split(",")})
            manifest.append({"file": name, "label": item["label"], "kind": kind,
                             "number": number, "title": item["title"], "cites": cited})
            print(f"rendered {name}")
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
