"""Render every state of the expanded Slidev deck and check basic visual fit."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
from threading import Thread

HERE = Path(__file__).resolve().parents[1]
DIST = HERE / "dist"
QA = HERE / "qa"
QA.mkdir(exist_ok=True)
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(HERE.parent / "institute-talk-v1" / ".runtime" / "browsers")

from playwright.sync_api import sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 3041), partial(QuietHandler, directory=str(DIST)))
Thread(target=server.serve_forever, daemon=True).start()

report = {"states": [], "errors": [], "external_requests": []}
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
    page.on("pageerror", lambda error: report["errors"].append(str(error)) if "Wake Lock" not in str(error) else None)
    page.on(
        "request",
        lambda request: report["external_requests"].append(request.url)
        if not request.url.startswith(("http://127.0.0.1:3041", "data:", "blob:"))
        else None,
    )
    page.goto("http://127.0.0.1:3041/")
    page.wait_for_selector(".slidev-layout")
    page.evaluate("document.fonts.ready")

    for _ in range(160):
        page.wait_for_timeout(120)
        state = page.evaluate(
            """() => {
              const number = Number(location.pathname.slice(1)) || 1
              const slide = document.querySelector(`[data-slidev-no="${number}"]`)
              const layout = slide?.querySelector('.slidev-layout')
              if (!slide || !layout) return { number, missing: true }
              const box = layout.getBoundingClientRect()
              const bad = []
              for (const el of layout.querySelectorAll('h1,h2,p,img,table,.talk-body > *,.derivation > *,.estimator-story > *,.theorem-box,.algorithm-flow,.algorithm-steps,.slide-citations,.reference-entry')) {
                const style = getComputedStyle(el)
                if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
                const rect = el.getBoundingClientRect()
                if (!rect.width && !rect.height) continue
                if (rect.left < box.left - 3 || rect.right > box.right + 3 || rect.top < box.top - 3 || rect.bottom > box.bottom + 3)
                  bad.push({ tag: el.tagName, cls: el.className, text: el.textContent?.slice(0, 80), rect: [rect.x, rect.y, rect.width, rect.height] })
              }
              const unloaded = [...layout.querySelectorAll('img')].filter(img => !img.complete || !img.naturalWidth).map(img => img.src)
              return {
                number,
                clicks: Number(new URLSearchParams(location.search).get('clicks') || 0),
                title: layout.querySelector('h1')?.innerText || '',
                bad,
                unloaded,
                scroll: [layout.scrollWidth, layout.scrollHeight],
                text: layout.innerText.slice(0, 180),
              }
            }"""
        )
        filename = f"expanded-{state['number']:02d}-{state.get('clicks', 0):02d}.png"
        page.screenshot(path=str(QA / filename))
        state["file"] = filename
        report["states"].append(state)
        previous = page.url
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(120)
        if page.url == previous:
            break

    browser.close()

server.shutdown()
report["slide_count"] = max(state.get("number", 0) for state in report["states"])
(QA / "slidev-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

failures = [state for state in report["states"] if state.get("missing") or state.get("bad") or state.get("unloaded")]
print(json.dumps({
    "slide_count": report["slide_count"],
    "state_count": len(report["states"]),
    "failures": failures,
    "errors": report["errors"],
    "external_requests": report["external_requests"],
}, indent=2))
raise SystemExit(bool(failures or report["errors"] or report["external_requests"] or report["slide_count"] < 52))
