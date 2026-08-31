#!/usr/bin/env python3
"""Validate the dependency-free GitHub Pages surface and intake contract."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


class PageParser(HTMLParser):
    def __init__(self, path: Path):
        super().__init__()
        self.path = path
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.has_main = False
        self.has_h1 = False
        self.lang = None
        self.title_depth = 0
        self.title_text = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "html":
            self.lang = values.get("lang")
        if tag == "main":
            self.has_main = True
        if tag == "h1":
            self.has_h1 = True
        if tag == "title":
            self.title_depth += 1
        if values.get("id"):
            if values["id"] in self.ids:
                fail(f"Duplicate HTML id in {self.path.relative_to(ROOT)}: {values['id']}")
            self.ids.add(values["id"])
        if tag in {"a", "link", "script", "img"}:
            target = values.get("href") or values.get("src")
            if target:
                self.links.append(target)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.title_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.title_depth:
            self.title_text += data


def validate_pages() -> None:
    for path in sorted(ROOT.glob("*.html")):
        parser = PageParser(path)
        parser.feed(path.read_text(encoding="utf-8"))
        if parser.lang != "en":
            fail(f"Missing lang=en in {path.name}")
        if not parser.has_main:
            fail(f"Missing main landmark in {path.name}")
        if not parser.has_h1:
            fail(f"Missing h1 in {path.name}")
        if not parser.title_text.strip():
            fail(f"Missing title in {path.name}")
        for target in parser.links:
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith(("#", "mailto:", "data:")):
                continue
            local = (path.parent / parsed.path).resolve()
            if parsed.path and not local.exists():
                fail(f"Broken page link in {path.name}: {target}")


def validate_config() -> None:
    config_path = ROOT / "data/intake-form.json"
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"Intake config parse failed: {exc}")
        return
    steps = config.get("steps", [])
    if len(steps) < 2:
        fail("Intake config requires at least two steps")
    step_ids = [step.get("id") for step in steps]
    if len(step_ids) != len(set(step_ids)):
        fail("Duplicate intake step IDs")
    fields = [field for step in steps for field in step.get("fields", [])]
    field_ids = [field.get("id") for field in fields]
    if len(field_ids) != len(set(field_ids)):
        fail("Duplicate intake field IDs")
    known_fields = set(field_ids)
    for field in fields:
        condition = field.get("showWhen")
        if condition and condition.get("field") not in known_fields:
            fail(f"Conditional field {field.get('id')} references unknown field {condition.get('field')}")
        if field.get("type") in {"select", "checkboxes"} and not field.get("options"):
            fail(f"Choice field has no options: {field.get('id')}")
        if field.get("type") == "repeatable" and not field.get("fields"):
            fail(f"Repeatable field has no subfields: {field.get('id')}")
    required_contract = {
        "title", "requester", "request_type", "business_need", "desired_outcome",
        "audience_description", "estimated_reach", "current_proficiency", "needed_by",
        "flexibility", "constraints", "public_data_acknowledgment", "success_measures",
        "acceptance_criteria", "asset_owner", "review_trigger"
    }
    missing = required_contract - known_fields
    if missing:
        fail(f"Intake configuration is missing contract fields: {sorted(missing)}")
    if config.get("repository") != "travis-true/L-D-OS":
        fail("Intake repository target does not match travis-true/L-D-OS")


def validate_security_and_accessibility_markers() -> None:
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    app = (ROOT / "assets/js/app.js").read_text(encoding="utf-8")
    css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
    required_index = ["skip-link", "aria-live", "error-summary", "novalidate", "public-data boundary", 'id="main-content" tabindex="-1"']
    for marker in required_index:
        if marker.lower() not in index.lower():
            fail(f"Missing accessibility/privacy marker in index.html: {marker}")
    required_app = ["textContent", "localStorage", "public_data_acknowledgment", "useClipboardFallback", "not gate approval"]
    for marker in required_app:
        if marker not in app:
            fail(f"Missing intake behavior marker in app.js: {marker}")
    if "prefers-reduced-motion" not in css or ":focus-visible" not in css:
        fail("CSS is missing reduced-motion or visible-focus support")
    if re.search(r"innerHTML\s*=(?!\s*[`\"'])", app):
        fail("Review dynamic innerHTML assignment for unsafe untrusted content")


def luminance(hex_color: str) -> float:
    channels = [int(hex_color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    adjusted = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
    return 0.2126 * adjusted[0] + 0.7152 * adjusted[1] + 0.0722 * adjusted[2]


def contrast_ratio(first: str, second: str) -> float:
    lighter, darker = sorted((luminance(first), luminance(second)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def validate_contrast_tokens() -> None:
    pairs = {
        "body text on white": ("#172033", "#ffffff", 4.5),
        "muted text on white": ("#475569", "#ffffff", 4.5),
        "primary link on white": ("#0369a1", "#ffffff", 4.5),
        "white on primary button": ("#ffffff", "#075985", 4.5),
        "white on hero": ("#ffffff", "#083344", 4.5),
        "footer link on footer": ("#99f6e4", "#0f172a", 4.5),
        "error on error surface": ("#b42318", "#fef3f2", 4.5)
    }
    for name, (foreground, background, minimum) in pairs.items():
        ratio = contrast_ratio(foreground, background)
        if ratio < minimum:
            fail(f"Contrast token failed for {name}: {ratio:.2f}:1")


def main() -> int:
    validate_pages()
    validate_config()
    validate_security_and_accessibility_markers()
    validate_contrast_tokens()
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        print(f"Site validation failed with {len(ERRORS)} error(s).")
        return 1
    print("L&D OS site validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
