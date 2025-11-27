const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Load metadata từ file JSON
const TOKENS = require("./tokens.json");

// --- API METADATA ---

// Lấy danh sách tất cả token
app.get("/api/tokens", (req, res) => {
  const tokens = Object.values(TOKENS);
  res.json(tokens);
});

// Lấy 1 token theo chainId + address
app.get("/api/token/:chainId/:address", (req, res) => {
  const chainId = req.params.chainId;
  const address = req.params.address.toLowerCase();

  const key = `${chainId}:${address}`;
  const token = TOKENS[key];

  if (!token) {
    return res.status(404).json({ error: "Token not found" });
  }

  res.json(token);
});

// Tokenlist kiểu Uniswap
app.get("/tokenlist.json", (req, res) => {
  const tokens = Object.values(TOKENS);
  res.json({
    name: "CodeAny Token List",
    timestamp: new Date().toISOString(),
    version: { major: 1, minor: 0, patch: 0 },
    tokens
  });
});

// Serve logo tĩnh: /logos/...
app.use("/logos", express.static(path.join(__dirname, "logos")));

// Serve frontend: / → file trong thư mục public
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Four.meme clone running on port " + PORT);
});
