
// StatusWatch - background service worker
const DEFAULTS = {
  apiBaseUrl: "",
  apiKey: "",
  refreshIntervalSec: 60,
  services: [], // {id,name,url}
  lastResults: {}, // id -> {status, latency_ms, checked_at}
};

async function getSettings() {
  const data = await browser.storage.local.get(Object.keys(DEFAULTS));
  return Object.assign({}, DEFAULTS, data);
}

async function setSettings(patch) {
  await browser.storage.local.set(patch);
}

async function fetchStatuses() {
  const s = await getSettings();
  if (!s.apiBaseUrl || s.services.length === 0) return;

  try {
    // Generic POST to external API.
    // Expected response shape:
    // { results: [{ id, status: "up"|"down", latency_ms, error? }] }
    const resp = await fetch(`${s.apiBaseUrl.replace(/\/$/,"")}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(s.apiKey ? { "Authorization": `Bearer ${s.apiKey}` } : {}),
      },
      body: JSON.stringify({ services: s.services.map(({id, url}) => ({ id, url })) }),
    });

    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json();
    const now = new Date().toISOString();

    const next = { ...s.lastResults };
    for (const r of (data.results || [])) {
      next[r.id] = { status: r.status || "unknown", latency_ms: r.latency_ms ?? null, error: r.error || null, checked_at: now };
    }

    await setSettings({ lastResults: next });
    browser.runtime.sendMessage({ type: "results-updated" }).catch(()=>{});

  } catch (e) {
    console.error("fetchStatuses failed", e);
    // Optional: notify on failure
    try {
      browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-48.png",
        title: "StatusWatch: Erreur API",
        message: String(e.message || e)
      });
    } catch {}
  }
}

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "refresh") {
    fetchStatuses();
  }
});

browser.runtime.onInstalled.addListener(async () => {
  const s = await getSettings();
  browser.alarms.create("refresh", { periodInMinutes: Math.max(1, (s.refreshIntervalSec || 60) / 60) });
});

browser.runtime.onStartup.addListener(async () => {
  const s = await getSettings();
  browser.alarms.create("refresh", { periodInMinutes: Math.max(1, (s.refreshIntervalSec || 60) / 60) });
});

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "refresh-now") {
    await fetchStatuses();
    return { ok: true };
  }
  if (msg?.type === "save-settings") {
    const patch = msg.payload || {};
    await setSettings(patch);
    if (typeof patch.refreshIntervalSec === "number") {
      browser.alarms.create("refresh", { periodInMinutes: Math.max(1, (patch.refreshIntervalSec || 60) / 60) });
    }
    return { ok: true };
  }
});
