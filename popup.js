
const $ = (sel) => document.querySelector(sel);

function fmtLatency(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms/1000).toFixed(2)} s`;
}

function relativeTime(iso) {
  if (!iso) return "jamais";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime())/1000;
  if (diff < 60) return "à l’instant";
  if (diff < 3600) return `il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)} h`;
  return d.toLocaleString();
}

async function load() {
  const { services = [], lastResults = {} } = await browser.storage.local.get(["services","lastResults"]);
  $("#countBadge").textContent = `${services.length} services`;
  const list = $("#list");
  list.innerHTML = "";
  if (services.length === 0) {
    $("#empty").style.display = "";
    return;
  } else {
    $("#empty").style.display = "none";
  }

  for (const s of services) {
    const r = lastResults[s.id] || {};
    const up = r.status === "up";
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="meta">
        <div><span class="status-dot ${up ? "dot-up" : "dot-down"}"></span><strong>${s.name}</strong></div>
        <div class="small">${s.url}</div>
        <div class="kv">
          <span class="pill">État : ${r.status ?? "inconnu"}</span>
          <span class="pill">Latence : ${fmtLatency(r.latency_ms)}</span>
          <span class="pill">Vérifié : ${relativeTime(r.checked_at)}</span>
        </div>
      </div>
      <div class="hstack">
      </div>
    `;
    list.appendChild(item);
    item.querySelector("button").addEventListener("click", async () => {
      await refreshNow();
    });
  }
}

async function refreshNow() {
  $("#spinner").style.display = "";
  $("#refreshLabel").style.display = "none";
  try {
    await browser.runtime.sendMessage({ type: "refresh-now" });
  } finally {
    setTimeout(async () => {
      $("#spinner").style.display = "none";
      $("#refreshLabel").style.display = "";
      await load();
    }, 300);
  }
}

$("#refreshBtn").addEventListener("click", refreshNow);
browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "results-updated") {
    load();
  }
});

load();
