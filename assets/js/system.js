function titleCase(value) {
  return String(value).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderLanes(catalog) {
  const root = document.querySelector("#lane-cards");
  catalog.lanes.forEach((lane) => {
    const card = document.createElement("article");
    card.className = "info-card";
    const heading = document.createElement("h3");
    heading.textContent = titleCase(lane.lane_id);
    const depth = document.createElement("p");
    depth.textContent = lane.record_depth;
    const gates = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Required gates: ";
    gates.append(strong, document.createTextNode(lane.required_gates.join(", ")));
    const independence = document.createElement("p");
    independence.textContent = lane.independence;
    card.append(heading, depth, gates, independence);
    root.append(card);
  });
}

function renderGates(catalog) {
  const root = document.querySelector("#gate-rows");
  catalog.gates.forEach((gate) => {
    const row = document.createElement("tr");
    const id = document.createElement("th");
    id.scope = "row";
    id.textContent = `${gate.gate_id} — ${gate.name}`;
    const stage = document.createElement("td");
    stage.textContent = titleCase(gate.stage);
    const decision = document.createElement("td");
    decision.textContent = gate.decision;
    const authority = document.createElement("td");
    authority.textContent = gate.human_authority_required ? "Required" : "Recorded review; authorization remains separate";
    row.append(id, stage, decision, authority);
    root.append(row);
  });
}

Promise.all([
  fetch("decisions/lanes.json").then((response) => { if (!response.ok) throw new Error("Lane data unavailable"); return response.json(); }),
  fetch("decisions/gates.json").then((response) => { if (!response.ok) throw new Error("Gate data unavailable"); return response.json(); })
]).then(([lanes, gates]) => {
  renderLanes(lanes);
  renderGates(gates);
  document.querySelector("#system-load-status").textContent = "Governed lane and gate data loaded from the controlled JSON catalogs.";
}).catch((error) => {
  console.error(error);
  document.querySelector("#system-load-status").textContent = "Governed lane or gate data could not be loaded. Use the linked repository records.";
});
