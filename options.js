
import { nanoid } from "./util.js";

const $ = (sel) => document.querySelector(sel);

async function load() {
  const s = await browser.storage.local.get(["apiBaseUrl","apiKey","refreshIntervalSec","services"]);
  $("#apiBaseUrl").value = s.apiBaseUrl || "";
  $("#apiKey").value = s.apiKey || "";
  $("#refreshIntervalSec").value = s.refreshIntervalSec || 60;
  renderServices(s.services || []);
}

function renderServices(services) {
  const box = $("#svcList");
  box.innerHTML = "";
  if (services.length === 0) {
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = "Aucun service pour l’instant.";
    box.appendChild(d);
    return;
  }
  for (const svc of services) {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="meta">
        <div><strong>${svc.name}</strong></div>
        <div class="small">${svc.url}</div>
      </div>
      <div class="hstack">
        <button class="button secondary" data-action="edit" data-id="${svc.id}">Modifier</button>
        <button class="button secondary" data-action="delete" data-id="${svc.id}">Supprimer</button>
      </div>
    `;
    box.appendChild(row);
  }
  box.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const { services=[] } = await browser.storage.local.get("services");
    const idx = services.findIndex((x) => x.id === id);
    if (idx < 0) return;
    if (action === "delete") {
      services.splice(idx,1);
      await browser.storage.local.set({ services });
      renderServices(services);
    } else if (action === "edit") {
      const name = prompt("Nom du service:", services[idx].name);
      if (!name) return;
      const url = prompt("URL/Hostname:", services[idx].url);
      if (!url) return;
      services[idx] = { ...services[idx], name, url };
      await browser.storage.local.set({ services });
      renderServices(services);
    }
  }, { once: true });
}

$("#saveApi").addEventListener("click", async () => {
  const refreshIntervalSec = Math.max(60, Number($("#refreshIntervalSec").value || 60));
  await browser.runtime.sendMessage({
    type: "save-settings",
    payload: {
      apiBaseUrl: $("#apiBaseUrl").value.trim(),
      apiKey: $("#apiKey").value.trim(),
      refreshIntervalSec
    }
  });
  alert("Paramètres enregistrés.");
});

$("#addSvc").addEventListener("click", async () => {
  const name = $("#svcName").value.trim();
  const url = $("#svcUrl").value.trim();
  if (!name || !url) { alert("Veuillez renseigner nom et URL."); return; }
  const { services = [] } = await browser.storage.local.get("services");
  services.push({ id: nanoid(), name, url });
  await browser.storage.local.set({ services });
  $("#svcName").value = "";
  $("#svcUrl").value = "";
  renderServices(services);
});

$("#testNow").addEventListener("click", async () => {
  await browser.runtime.sendMessage({ type: "refresh-now" });
  alert("Requête envoyée. Ouvrez le popup pour voir les résultats.");
});

load();
