function processHierarchyData(entries) {
  const invalidEntries = [];
  const duplicateEdges = [];

  const seenEdges = new Set();
  const duplicateLogged = new Set();

  const childToParent = new Map();
  const adjacency = new Map();
  const indegree = new Map();
  const undirected = new Map();
  const nodeFirstSeen = new Map();
  let orderCounter = 0;

  const ensureNode = (node) => {
    if (!adjacency.has(node)) adjacency.set(node, []);
    if (!indegree.has(node)) indegree.set(node, 0);
    if (!undirected.has(node)) undirected.set(node, new Set());
    if (!nodeFirstSeen.has(node)) {
      nodeFirstSeen.set(node, orderCounter);
      orderCounter += 1;
    }
  };

  for (const rawEntry of entries) {
    if (typeof rawEntry !== "string") {
      invalidEntries.push(String(rawEntry));
      continue;
    }

    const entry = rawEntry.trim();
    const match = /^([A-Z])->([A-Z])$/.exec(entry);

    if (!match) {
      invalidEntries.push(entry);
      continue;
    }

    const parent = match[1];
    const child = match[2];

    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    const edgeKey = `${parent}->${child}`;

    if (seenEdges.has(edgeKey)) {
      if (!duplicateLogged.has(edgeKey)) {
        duplicateEdges.push(edgeKey);
        duplicateLogged.add(edgeKey);
      }
      continue;
    }

    seenEdges.add(edgeKey);

    // First encountered parent for a child wins.
    if (childToParent.has(child)) {
      continue;
    }

    ensureNode(parent);
    ensureNode(child);

    childToParent.set(child, parent);
    adjacency.get(parent).push(child);
    indegree.set(child, (indegree.get(child) || 0) + 1);

    undirected.get(parent).add(child);
    undirected.get(child).add(parent);
  }

  const allNodes = Array.from(adjacency.keys()).sort();
  const visitedUndirected = new Set();
  const components = [];

  for (const startNode of allNodes) {
    if (visitedUndirected.has(startNode)) continue;

    const stack = [startNode];
    const componentNodes = [];
    visitedUndirected.add(startNode);

    while (stack.length > 0) {
      const node = stack.pop();
      componentNodes.push(node);

      for (const neighbor of undirected.get(node) || []) {
        if (!visitedUndirected.has(neighbor)) {
          visitedUndirected.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    componentNodes.sort();
    const firstSeenIndex = Math.min(...componentNodes.map((n) => nodeFirstSeen.get(n) || 0));
    components.push({ nodes: componentNodes, firstSeenIndex });
  }

  components.sort((a, b) => a.firstSeenIndex - b.firstSeenIndex);

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = "";
  let largestDepth = -1;

  const detectCycleForComponent = (componentSet) => {
    const state = new Map();

    const dfs = (node) => {
      state.set(node, 1);
      for (const child of adjacency.get(node) || []) {
        if (!componentSet.has(child)) continue;

        const childState = state.get(child) || 0;
        if (childState === 1) return true;
        if (childState === 0 && dfs(child)) return true;
      }
      state.set(node, 2);
      return false;
    };

    for (const node of componentSet) {
      if ((state.get(node) || 0) === 0) {
        if (dfs(node)) return true;
      }
    }
    return false;
  };

  const buildTree = (node, componentSet) => {
    const children = (adjacency.get(node) || []).filter((c) => componentSet.has(c));
    const nested = {};
    for (const child of children) {
      nested[child] = buildTree(child, componentSet);
    }
    return nested;
  };

  const computeDepth = (node, componentSet) => {
    const children = (adjacency.get(node) || []).filter((c) => componentSet.has(c));
    if (children.length === 0) return 1;
    let maxChildDepth = 0;
    for (const child of children) {
      maxChildDepth = Math.max(maxChildDepth, computeDepth(child, componentSet));
    }
    return 1 + maxChildDepth;
  };

  for (const component of components) {
    const componentSet = new Set(component.nodes);
    const roots = component.nodes.filter((node) => (indegree.get(node) || 0) === 0).sort();
    const hasCycle = detectCycleForComponent(componentSet);

    const root = roots.length > 0 ? roots[0] : component.nodes[0];

    if (hasCycle) {
      totalCycles += 1;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      continue;
    }

    const depth = computeDepth(root, componentSet);
    const tree = { [root]: buildTree(root, componentSet) };

    totalTrees += 1;

    if (
      depth > largestDepth ||
      (depth === largestDepth && (largestTreeRoot === "" || root < largestTreeRoot))
    ) {
      largestDepth = depth;
      largestTreeRoot = root;
    }

    hierarchies.push({
      root,
      tree,
      depth,
    });
  }

  return {
    hierarchies,
    invalidEntries,
    duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

module.exports = {
  processHierarchyData,
};
