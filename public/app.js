const submitBtn = document.getElementById("submitBtn");
const nodesInput = document.getElementById("nodesInput");
const statusEl = document.getElementById("status");
const responseSection = document.getElementById("responseSection");
const jsonOutput = document.getElementById("jsonOutput");
const summaryCards = document.getElementById("summaryCards");
const hierarchyCards = document.getElementById("hierarchyCards");

function parseInput(raw) {
  const lines = raw
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => (line === '""' ? "" : line));
}

function card(title, contentHtml) {
  return `<article class="card"><h3>${title}</h3><div>${contentHtml}</div></article>`;
}

function renderResponse(data) {
  jsonOutput.textContent = JSON.stringify(data, null, 2);

  summaryCards.innerHTML = [
    card("User", `<strong>${data.user_id}</strong>`),
    card("Email", `<strong>${data.email_id}</strong>`),
    card("Roll Number", `<strong>${data.college_roll_number}</strong>`),
    card(
      "Summary",
      `<div>Total Trees: <strong>${data.summary.total_trees}</strong></div>
       <div>Total Cycles: <strong>${data.summary.total_cycles}</strong></div>
       <div>Largest Tree Root: <strong>${data.summary.largest_tree_root || "-"}</strong></div>`
    ),
    card("Invalid Entries", data.invalid_entries.length ? data.invalid_entries.join(", ") : '<span class="muted">None</span>'),
    card("Duplicate Edges", data.duplicate_edges.length ? data.duplicate_edges.join(", ") : '<span class="muted">None</span>'),
  ].join("");

  hierarchyCards.innerHTML = (data.hierarchies || [])
    .map((h, idx) => {
      const treeView = Object.keys(h.tree || {}).length
        ? `<pre>${JSON.stringify(h.tree, null, 2)}</pre>`
        : '<span class="muted">No tree (cycle group)</span>';

      return card(
        `Hierarchy ${idx + 1}`,
        `<div>Root: <strong>${h.root}</strong></div>
         <div>Cycle: <strong>${h.has_cycle ? "Yes" : "No"}</strong></div>
         <div>Depth: <strong>${typeof h.depth === "number" ? h.depth : "-"}</strong></div>
         ${treeView}`
      );
    })
    .join("");

  responseSection.classList.remove("hidden");
}

submitBtn.addEventListener("click", async () => {
  const data = parseInput(nodesInput.value);
  statusEl.textContent = "Calling API...";
  statusEl.style.color = "#145f70";

  try {
    const response = await fetch("/bfhl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();
    renderResponse(result);
    statusEl.textContent = "Success.";
    statusEl.style.color = "#166534";
  } catch (error) {
    responseSection.classList.add("hidden");
    statusEl.textContent = `API Error: ${error.message}`;
    statusEl.style.color = "#b91c1c";
  }
});
