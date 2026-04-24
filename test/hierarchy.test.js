const assert = require("node:assert/strict");
const { processHierarchyData } = require("../src/hierarchy");

function runTests() {
  const input = [
    "A->B",
    "A->C",
    "B->D",
    "C->E",
    "E->F",
    "X->Y",
    "Y->Z",
    "Z->X",
    "P->Q",
    "Q->R",
    "G->H",
    "G->H",
    "G->I",
    "hello",
    "1->2",
    "A->",
  ];

  const result = processHierarchyData(input);

  assert.equal(result.summary.total_trees, 3);
  assert.equal(result.summary.total_cycles, 1);
  assert.equal(result.summary.largest_tree_root, "A");

  assert.deepEqual(result.invalidEntries, ["hello", "1->2", "A->"]);
  assert.deepEqual(result.duplicateEdges, ["G->H"]);

  const cycleHierarchy = result.hierarchies.find((h) => h.root === "X");
  assert.ok(cycleHierarchy);
  assert.equal(cycleHierarchy.has_cycle, true);
  assert.deepEqual(cycleHierarchy.tree, {});

  const aTree = result.hierarchies.find((h) => h.root === "A");
  assert.ok(aTree);
  assert.equal(aTree.depth, 4);

  // Multi-parent rule: only first parent for D should survive.
  const multiParent = processHierarchyData(["A->D", "B->D", "A->B"]);
  const mp = multiParent.hierarchies.find((h) => h.root === "A");
  assert.ok(mp);
  assert.deepEqual(mp.tree, { A: { D: {}, B: {} } });

  console.log("All tests passed.");
}

runTests();
