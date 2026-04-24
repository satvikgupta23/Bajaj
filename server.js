const express = require("express");
const cors = require("cors");
const { processHierarchyData } = require("./src/hierarchy");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const IDENTITY = {
  user_id: process.env.USER_ID || "Satvik Gupta_23082005",
  email_id: process.env.EMAIL_ID || "sg9820@srmist.edu.in",
  college_roll_number: process.env.COLLEGE_ROLL_NUMBER || "RA2311028010071",
};

app.post("/bfhl", (req, res) => {
  const { data } = req.body || {};

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "Request body must include a 'data' array of strings.",
    });
  }

  const processed = processHierarchyData(data);

  return res.json({
    ...IDENTITY,
    hierarchies: processed.hierarchies,
    invalid_entries: processed.invalidEntries,
    duplicate_edges: processed.duplicateEdges,
    summary: processed.summary,
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
