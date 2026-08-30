#!/usr/bin/env python3
"""Generate a deterministic manifest for the TEOS candidate package."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
files = []
for path in sorted(ROOT.rglob("*")):
    if not path.is_file() or path.name == "MANIFEST.json" or ".git" in path.parts or "__pycache__" in path.parts:
        continue
    data = path.read_bytes()
    files.append({
        "path": str(path.relative_to(ROOT)),
        "size_bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
    })

manifest = {
    "package": "L-D-OS",
    "version": (ROOT / "VERSION").read_text(encoding="utf-8").strip(),
    "status": "pilot-candidate",
    "files": files,
}
(ROOT / "MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(f"Wrote MANIFEST.json with {len(files)} files.")
