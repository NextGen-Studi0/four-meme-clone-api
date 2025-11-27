const API_BASE = "const API_BASE = "const API_BASE = "https://four-meme-clone-api.onrender.com";

async function fetchTokens() {
  const res = await fetch(`${API_BASE}/api/tokens`);
  if (!res.ok) {
    throw new Error("Không load được token list");
  }
  return res.json();
}

async function fetchToken(chainId, address) {
  const res = await fetch(
    `${API_BASE}/api/token/${chainId}/${address.toLowerCase()}`
  );
  if (!res.ok) {
    throw new Error("Không tìm thấy token");
  }
  return res.json();
}

function renderTokenList(tokens) {
  const listEl = document.getElementById("token-list");
  listEl.innerHTML = "";

  if (!tokens.length) {
    listEl.innerHTML = "<p>Chưa có token nào trong hệ thống.</p>";
    return;
  }

  tokens.forEach((t) => {
    const item = document.createElement("div");
    item.className = "token-item";
    item.innerHTML = `
      <img src="${t.logoURI}" alt="${t.symbol}" onerror="this.src='https://via.placeholder.com/32'" />
      <div>
        <div class="token-symbol">${t.symbol}</div>
        <div class="token-name">${t.name}</div>
      </div>
      <div class="token-chain">Chain ${t.chainId}</div>
    `;
    item.onclick = () => {
      renderTokenDetail(t);
    };
    listEl.appendChild(item);
  });
}

function renderTokenDetail(token) {
  const detailEl = document.getElementById("token-detail");
  detailEl.classList.remove("empty");
  detailEl.innerHTML = `
    <div class="top">
      <img src="${token.logoURI}" alt="${token.symbol}" onerror="this.src='https://via.placeholder.com/56'" />
      <div>
        <div class="symbol">${token.symbol}</div>
        <div class="name">${token.name}</div>
      </div>
    </div>

    <div class="field"><span>Address:</span> ${token.address}</div>
    <div class="field"><span>Chain ID:</span> ${token.chainId}</div>
    <div class="field"><span>Decimals:</span> ${token.decimals}</div>

    <div class="description">
      ${token.description || "No description."}
    </div>

    <div class="actions">
      <button class="primary" onclick='addToWallet(${JSON.stringify(
        token
      )})'>Add to Wallet</button>
      <button class="secondary" onclick='viewOnBscScan("${token.address}")'>View on BscScan</button>
    </div>
  `;
}

function viewOnBscScan(address) {
  window.open(`https://bscscan.com/token/${address}`, "_blank");
}

// Nút Add to Wallet – dùng wallet_watchAsset
async function addToWallet(token) {
  if (!window.ethereum) {
    alert("Không tìm thấy ví Web3 (MetaMask / Trust / OKX). Hãy mở trong DApp browser.");
    return;
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol.slice(0, 11),
          decimals: token.decimals,
          image: token.logoURI
        }
      }
    });

    if (wasAdded) {
      alert("Token đã được thêm vào ví (nếu ví hỗ trợ).");
    } else {
      alert("Bạn đã huỷ thao tác thêm token.");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi khi thêm token vào ví.");
  }
}

async function init() {
  try {
    const tokens = await fetchTokens();
    renderTokenList(tokens);

    if (tokens.length) {
      renderTokenDetail(tokens[0]);
    }
  } catch (err) {
    console.error(err);
    document.getElementById("token-list").innerHTML =
      "<p>Lỗi tải dữ liệu token.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);
