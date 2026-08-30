#!/usr/bin/env python3
"""Validate TEOS JSON records, cross-references, links, and generic boundaries."""

from __future__ import annotations

import json
import hashlib
import re
import sys
from pathlib import Path
from urllib.parse import urldefrag

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"JSON parse failed: {path.relative_to(ROOT)}: {exc}")
        return None


def resolve_pointer(document, fragment: str):
    current = document
    if not fragment:
        return current
    pointer = fragment.removeprefix("/")
    for token in pointer.split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[token]
    return current


def resolve_ref(ref: str, schema_path: Path):
    file_part, fragment = urldefrag(ref)
    target_path = (schema_path.parent / file_part).resolve() if file_part else schema_path
    target = load_json(target_path)
    if target is None:
        return None, target_path
    try:
        return resolve_pointer(target, fragment), target_path
    except Exception as exc:
        fail(f"Unresolved schema reference {ref} from {schema_path.relative_to(ROOT)}: {exc}")
        return None, target_path


def validate(instance, schema, schema_path: Path, location: str) -> None:
    if not isinstance(schema, dict):
        return
    if "$ref" in schema:
        target, target_path = resolve_ref(schema["$ref"], schema_path)
        if target is not None:
            validate(instance, target, target_path, location)
        return

    expected = schema.get("type")
    type_map = {
        "object": dict,
        "array": list,
        "string": str,
        "integer": int,
        "number": (int, float),
        "boolean": bool,
        "null": type(None),
    }
    if expected and not isinstance(instance, type_map[expected]):
        fail(f"{location}: expected {expected}, found {type(instance).__name__}")
        return
    if "enum" in schema and instance not in schema["enum"]:
        fail(f"{location}: value {instance!r} is not in {schema['enum']}")
    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            fail(f"{location}: shorter than minLength {schema['minLength']}")
        if "pattern" in schema and not re.search(schema["pattern"], instance):
            fail(f"{location}: value {instance!r} does not match {schema['pattern']}")
        if schema.get("format") == "date" and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", instance):
            fail(f"{location}: expected YYYY-MM-DD date")
    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            fail(f"{location}: below minimum {schema['minimum']}")
    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            fail(f"{location}: fewer than {schema['minItems']} items")
        if "items" in schema:
            for index, value in enumerate(instance):
                validate(value, schema["items"], schema_path, f"{location}[{index}]")
    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                fail(f"{location}: missing required property {key}")
        for key, subschema in schema.get("properties", {}).items():
            if key in instance:
                validate(instance[key], subschema, schema_path, f"{location}.{key}")


def validate_json_files() -> None:
    for path in sorted(ROOT.rglob("*.json")):
        if path.name == "MANIFEST.json":
            continue
        data = load_json(path)
        if data is None or not isinstance(data, dict):
            continue
        if path.parent.name == "schemas":
            if "$schema" not in data or "$id" not in data:
                fail(f"Schema missing $schema or $id: {path.relative_to(ROOT)}")
            continue
        schema_ref = data.get("$schema")
        if schema_ref and not schema_ref.startswith("http"):
            schema_path = (path.parent / schema_ref).resolve()
            schema = load_json(schema_path)
            if schema is not None:
                validate(data, schema, schema_path, str(path.relative_to(ROOT)))


def validate_cross_references() -> None:
    gates = load_json(ROOT / "decisions/gates.json")
    lanes = load_json(ROOT / "decisions/lanes.json")
    if not gates or not lanes:
        return
    gate_ids = [item["gate_id"] for item in gates["gates"]]
    if len(gate_ids) != len(set(gate_ids)):
        fail("Duplicate gate IDs")
    for lane in lanes["lanes"]:
        for gate_id in lane["required_gates"] + lane["conditional_gates"]:
            if gate_id not in gate_ids:
                fail(f"Lane {lane['lane_id']} references unknown gate {gate_id}")
    workflow_ids = []
    for path in sorted((ROOT / "workflows").glob("WF-*.md")):
        match = re.search(r"WF-[0-9]{3}", path.name)
        if match:
            workflow_ids.append(match.group(0))
    if len(workflow_ids) != len(set(workflow_ids)):
        fail("Duplicate workflow IDs")


def validate_markdown_links() -> None:
    pattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
    for path in sorted(ROOT.rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        for target in pattern.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            target_file = target.split("#", 1)[0]
            if target_file and not (path.parent / target_file).resolve().exists():
                fail(f"Broken Markdown link in {path.relative_to(ROOT)}: {target}")


def validate_generic_boundary() -> None:
    prohibited = [
        "BC" + "BSKS",
        "Blue Cross" + " Blue Shield",
        "Service" + "Desk@",
        r"IT\." + "Training@",
    ]
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.name == "MANIFEST.json":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for pattern in prohibited:
            if re.search(pattern, text, re.IGNORECASE):
                fail(f"Generic-boundary violation in {path.relative_to(ROOT)}: {pattern}")


def validate_manifest() -> None:
    manifest_path = ROOT / "MANIFEST.json"
    if not manifest_path.exists():
        fail("MANIFEST.json is missing; run scripts/generate_manifest.py")
        return
    manifest = load_json(manifest_path)
    if not manifest:
        return
    entries = manifest.get("files", [])
    listed = {item["path"] for item in entries}
    actual = {
        str(path.relative_to(ROOT))
        for path in ROOT.rglob("*")
        if path.is_file() and path.name != "MANIFEST.json" and ".git" not in path.parts and "__pycache__" not in path.parts
    }
    if listed != actual:
        fail(f"Manifest drift: missing={sorted(actual-listed)}, stale={sorted(listed-actual)}")
    for item in entries:
        path = ROOT / item["path"]
        if not path.is_file():
            continue
        data = path.read_bytes()
        if item.get("size_bytes") != len(data):
            fail(f"Manifest size mismatch: {item['path']}")
        if item.get("sha256") != hashlib.sha256(data).hexdigest():
            fail(f"Manifest hash mismatch: {item['path']}")


def main() -> int:
    validate_json_files()
    validate_cross_references()
    validate_markdown_links()
    validate_generic_boundary()
    validate_manifest()
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        print(f"Validation failed with {len(ERRORS)} error(s).")
        return 1
    print("TEOS core validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
