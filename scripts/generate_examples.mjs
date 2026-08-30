import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildMarkdown, buildRequestRecord } from "../assets/js/app.js";

const root = new URL("../", import.meta.url);
const state = JSON.parse(await readFile(new URL("tests/fixtures/complete-state.json", root), "utf8"));
const lanes = JSON.parse(await readFile(new URL("decisions/lanes.json", root), "utf8"));
const output = new URL("examples/intake/", root);
await mkdir(output, { recursive: true });

const record = buildRequestRecord(state, {
  complete: true,
  laneCatalog: lanes,
  requestId: "REQ-20260830-SAMPLE",
  now: new Date("2026-08-30T12:00:00Z")
});
await writeFile(new URL("sample-complete.json", output), `${JSON.stringify(record, null, 2)}\n`);
await writeFile(new URL("sample-complete.md", output), buildMarkdown(state, { record, laneCatalog: lanes }));
console.log("Generated sample intake JSON and Markdown.");
