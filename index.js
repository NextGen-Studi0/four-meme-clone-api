const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "tokens.json");

// Load file JSON mỗi lần truy cập (không cache)
function loadTokens() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tokens, null, 2));
}

// GET ALL TOKENS
app.get("/api/tokens", (req, res) => {
  const TOKENS = loadTokens();
  const tokens = Object.values(TOKENS);
  res.json(tokens);
});

// GET TOKEN BY CHAIN + ADDRESS
app.get("/api/token/:chainId/:address", (req, res) => {
  const chainId = req.params.chainId;
  const address = req.params.address.toLowerCase();
  const TOKENS = loadTokens();

  const key = `${chainId}:${address}`;
  const token = TOKENS[key];

  if (!token) return res.status(404).json({ error: "Token not found" });
  res.json(token);
});

// CREATE TOKEN METADATA
app.post("/api/tokens", (req, res) => {
  const TOKENS = loadTokens();
  const body = req.body;

  const key = `${body.chainId}:${body.address.toLowerCase()}`;
  if (TOKENS[key])
    return res.status(400).json({ error: "Token already exists" });

  TOKENS[key] = body;
  saveTokens(TOKENS);

  res.json(body);
});

// TOKENLIST.JSON
app.get("/tokenlist.json", (req, res) => {
  const TOKENS = loadTokens();
  res.json({
    name: "CodeAny Token List",
    timestamp: new Date().toISOString(),
    version: { major: 1, minor: 0, patch: 0 },
    tokens: Object.values(TOKENS),
  });
});

// STATIC LOGO
app.use("/logos", express.static(path.join(__dirname, "logos")));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));
