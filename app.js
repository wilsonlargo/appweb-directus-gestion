const DIRECTUS_URL = "http://100.105.113.77:8055";

let accessToken = localStorage.getItem("directus_access_token") || "";
let refreshToken = localStorage.getItem("directus_refresh_token") || "";
let contratos = [];

const $ = (selector) => document.querySelector(selector);

const elements = {
  toast: $("#toast"),
  loginView: $("#loginView"),
  appView: $("#appView"),
  loginForm: $("#loginForm"),
  loginEmail: $("#loginEmail"),
  loginPassword: $("#loginPassword"),
  loginMessage: $("#loginMessage"),
  btnTestApi: $("#btnTestApi"),
  directusUrlText: $("#directusUrlText"),
  btnLogout: $("#btnLogout"),
  btnRefresh: $("#btnRefresh"),
  btnNewContract: $("#btnNewContract"),
  btnMenu: $("#btnMenu"),
  sidebar: $("#sidebar"),
  contractsTable: $("#contractsTable"),
  searchInput: $("#searchInput"),
  loadingBox: $("#loadingBox"),
  emptyState: $("#emptyState"),
  contractDialog: $("#contractDialog"),
  contractForm: $("#contractForm"),
  dialogTitle: $("#dialogTitle"),
  btnCloseDialog: $("#btnCloseDialog"),
  btnCancel: $("#btnCancel"),
  contractId: $("#contractId"),
  statContratos: $("#statContratos"),
  statConFechaFin: $("#statConFechaFin"),
  statSinFechaFin: $("#statSinFechaFin"),
  pageTitle: $("#pageTitle"),
  pageSubtitle: $("#pageSubtitle"),
};

const fields = {
  numero_contrato: $("#numero_contrato"),
  objeto: $("#objeto"),
  entidad: $("#entidad"),
  contratista: $("#contratista"),
  supervisor: $("#supervisor"),
  fecha_inicio: $("#fecha_inicio"),
  fecha_fin: $("#fecha_fin"),
};

elements.directusUrlText.textContent = DIRECTUS_URL;

function toast(message, type = "ok") {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type === "error" ? "error" : ""}`;
  elements.toast.classList.remove("oculto");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => elements.toast.classList.add("oculto"), 3200);
}

function setLoading(isLoading) {
  elements.loadingBox.classList.toggle("oculto", !isLoading);
}

function showApp() {
  elements.loginView.classList.add("oculto");
  elements.appView.classList.remove("oculto");
  loadContracts();
}

function showLogin() {
  elements.appView.classList.add("oculto");
  elements.loginView.classList.remove("oculto");
}

function saveTokens(data) {
  accessToken = data.access_token || "";
  refreshToken = data.refresh_token || "";
  localStorage.setItem("directus_access_token", accessToken);
  if (refreshToken) localStorage.setItem("directus_refresh_token", refreshToken);
}

function clearTokens() {
  accessToken = "";
  refreshToken = "";
  localStorage.removeItem("directus_access_token");
  localStorage.removeItem("directus_refresh_token");
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${DIRECTUS_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (!response.ok) {
    const message = payload?.errors?.[0]?.message || payload?.message || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function testApi() {
  elements.loginMessage.textContent = "Probando conexión...";
  try {
    const response = await fetch(`${DIRECTUS_URL}/server/ping`);
    if (!response.ok) throw new Error("No respondió correctamente");
    elements.loginMessage.textContent = "API conectada correctamente.";
  } catch (error) {
    console.error(error);
    elements.loginMessage.textContent = "No se pudo conectar con Directus. Revisa URL, red o CORS.";
  }
}

async function login(event) {
  event.preventDefault();
  elements.loginMessage.textContent = "Ingresando...";

  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: elements.loginEmail.value.trim(),
        password: elements.loginPassword.value,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.errors?.[0]?.message || "No se pudo iniciar sesión");

    saveTokens(payload.data);
    elements.loginMessage.textContent = "";
    toast("Sesión iniciada");
    showApp();
  } catch (error) {
    console.error(error);
    elements.loginMessage.textContent = "No se pudo iniciar sesión. Revisa usuario, contraseña o permisos.";
  }
}

function logout() {
  clearTokens();
  contratos = [];
  renderContracts();
  showLogin();
  toast("Sesión cerrada");
}

function dateShort(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadContracts() {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      sort: "-created_at",
      fields: "id,numero_contrato,objeto,entidad,contratista,supervisor,fecha_inicio,fecha_fin,created_at",
      limit: "200",
    });
    const payload = await api(`/items/contratos?${params.toString()}`);
    contratos = payload.data || [];
    renderContracts();
    updateStats();
  } catch (error) {
    console.error(error);
    toast(`Error cargando contratos: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
}

function getFilteredContracts() {
  const query = elements.searchInput.value.trim().toLowerCase();
  if (!query) return contratos;
  return contratos.filter((item) => [
    item.numero_contrato,
    item.entidad,
    item.contratista,
    item.supervisor,
    item.objeto,
  ].some((value) => String(value || "").toLowerCase().includes(query)));
}

function renderContracts() {
  const data = getFilteredContracts();
  elements.contractsTable.innerHTML = "";
  elements.emptyState.classList.toggle("oculto", data.length > 0);

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge">${escapeHtml(item.numero_contrato || "Sin número")}</span></td>
      <td>${escapeHtml(item.entidad || "")}<div class="muted">${escapeHtml(item.objeto || "")}</div></td>
      <td>${escapeHtml(item.contratista || "")}</td>
      <td>${escapeHtml(item.supervisor || "")}</td>
      <td>${escapeHtml(dateShort(item.fecha_inicio))}<br><span class="muted">${escapeHtml(dateShort(item.fecha_fin))}</span></td>
      <td class="actions">
        <button class="btn btn-light" data-action="edit" data-id="${item.id}">Editar</button>
        <button class="btn btn-danger" data-action="delete" data-id="${item.id}">Eliminar</button>
      </td>
    `;
    elements.contractsTable.appendChild(tr);
  });
}

function updateStats() {
  elements.statContratos.textContent = contratos.length;
  elements.statConFechaFin.textContent = contratos.filter((c) => c.fecha_fin).length;
  elements.statSinFechaFin.textContent = contratos.filter((c) => !c.fecha_fin).length;
}

function openNewContract() {
  elements.dialogTitle.textContent = "Nuevo contrato";
  elements.contractForm.reset();
  elements.contractId.value = "";
  elements.contractDialog.showModal();
}

function openEditContract(id) {
  const item = contratos.find((c) => c.id === id);
  if (!item) return;

  elements.dialogTitle.textContent = `Editar contrato ${item.numero_contrato || ""}`;
  elements.contractId.value = item.id;
  fields.numero_contrato.value = item.numero_contrato || "";
  fields.objeto.value = item.objeto || "";
  fields.entidad.value = item.entidad || "";
  fields.contratista.value = item.contratista || "";
  fields.supervisor.value = item.supervisor || "";
  fields.fecha_inicio.value = dateShort(item.fecha_inicio);
  fields.fecha_fin.value = dateShort(item.fecha_fin);
  elements.contractDialog.showModal();
}

function collectContractForm() {
  return {
    numero_contrato: fields.numero_contrato.value.trim(),
    objeto: fields.objeto.value.trim() || null,
    entidad: fields.entidad.value.trim() || null,
    contratista: fields.contratista.value.trim() || null,
    supervisor: fields.supervisor.value.trim() || null,
    fecha_inicio: fields.fecha_inicio.value || null,
    fecha_fin: fields.fecha_fin.value || null,
  };
}

async function saveContract(event) {
  event.preventDefault();

  const id = elements.contractId.value;
  const body = collectContractForm();
  if (!body.numero_contrato) {
    toast("El número de contrato es obligatorio", "error");
    return;
  }

  try {
    if (id) {
      await api(`/items/contratos/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast("Contrato actualizado");
    } else {
      await api("/items/contratos", { method: "POST", body: JSON.stringify(body) });
      toast("Contrato creado");
    }
    elements.contractDialog.close();
    await loadContracts();
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar: ${error.message}`, "error");
  }
}

async function deleteContract(id) {
  const item = contratos.find((c) => c.id === id);
  const label = item?.numero_contrato || id;
  const ok = confirm(`¿Eliminar el contrato ${label}? Esta acción puede fallar si tiene obligaciones o informes asociados.`);
  if (!ok) return;

  try {
    await api(`/items/contratos/${id}`, { method: "DELETE" });
    toast("Contrato eliminado");
    await loadContracts();
  } catch (error) {
    console.error(error);
    toast(`No se pudo eliminar: ${error.message}`, "error");
  }
}

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.toggle("activo", btn.dataset.view === view));
  $("#contratosView").classList.toggle("oculto", view !== "contratos");
  $("#resumenView").classList.toggle("oculto", view !== "resumen");
  elements.pageTitle.textContent = view === "contratos" ? "Contratos" : "Resumen";
  elements.pageSubtitle.textContent = view === "contratos"
    ? "Crea, consulta y edita contratos desde la AppWeb."
    : "Indicadores rápidos de los contratos cargados.";
  if (window.innerWidth <= 820) elements.sidebar.classList.remove("abierto");
}

function attachEvents() {
  elements.btnTestApi.addEventListener("click", testApi);
  elements.loginForm.addEventListener("submit", login);
  elements.btnLogout.addEventListener("click", logout);
  elements.btnRefresh.addEventListener("click", loadContracts);
  elements.btnNewContract.addEventListener("click", openNewContract);
  elements.btnCloseDialog.addEventListener("click", () => elements.contractDialog.close());
  elements.btnCancel.addEventListener("click", () => elements.contractDialog.close());
  elements.contractForm.addEventListener("submit", saveContract);
  elements.searchInput.addEventListener("input", renderContracts);
  elements.btnMenu.addEventListener("click", () => elements.sidebar.classList.toggle("abierto"));

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  elements.contractsTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "edit") openEditContract(id);
    if (button.dataset.action === "delete") deleteContract(id);
  });
}

attachEvents();

if (accessToken) showApp();
else showLogin();
