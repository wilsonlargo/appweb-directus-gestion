const DIRECTUS_URL = "http://100.105.113.77:8055";

let accessToken = localStorage.getItem("directus_access_token") || "";
let refreshToken = localStorage.getItem("directus_refresh_token") || "";
let contratos = [];
let obligacionesActuales = [];
let informesActuales = [];
let obligacionesParaInforme = [];
let contratoSeleccionado = null;

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
  obligationsDialog: $("#obligationsDialog"),
  obligationsTitle: $("#obligationsTitle"),
  obligationsSubtitle: $("#obligationsSubtitle"),
  obligationsCount: $("#obligationsCount"),
  obligationsList: $("#obligationsList"),
  obligationsEmpty: $("#obligationsEmpty"),
  obligationsLoading: $("#obligationsLoading"),
  obligationForm: $("#obligationForm"),
  obligationFormTitle: $("#obligationFormTitle"),
  obligationId: $("#obligationId"),
  obligacionNumero: $("#obligacion_numero"),
  obligacionDescripcion: $("#obligacion_descripcion"),
  btnCloseObligations: $("#btnCloseObligations"),
  btnCloseObligationsFooter: $("#btnCloseObligationsFooter"),
  btnClearObligation: $("#btnClearObligation"),
  btnReloadObligations: $("#btnReloadObligations"),
  reportsDialog: $("#reportsDialog"),
  reportsTitle: $("#reportsTitle"),
  reportsSubtitle: $("#reportsSubtitle"),
  reportsCount: $("#reportsCount"),
  reportsList: $("#reportsList"),
  reportsEmpty: $("#reportsEmpty"),
  reportsLoading: $("#reportsLoading"),
  reportForm: $("#reportForm"),
  reportFormTitle: $("#reportFormTitle"),
  reportId: $("#reportId"),
  informeAnio: $("#informe_anio"),
  informeMes: $("#informe_mes"),
  informeEstado: $("#informe_estado"),
  reportObligationsLoading: $("#reportObligationsLoading"),
  reportObligationsList: $("#reportObligationsList"),
  reportObligationsEmpty: $("#reportObligationsEmpty"),
  btnCloseReports: $("#btnCloseReports"),
  btnCloseReportsFooter: $("#btnCloseReportsFooter"),
  btnClearReport: $("#btnClearReport"),
  btnReloadReports: $("#btnReloadReports"),
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
        <button class="btn btn-light" data-action="obligations" data-id="${item.id}">Obligaciones</button>
        <button class="btn btn-light" data-action="reports" data-id="${item.id}">Informes</button>
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

function obligationLabel(item) {
  return `Obligación ${item.numero ?? ""}`.trim();
}

function setObligationsLoading(isLoading) {
  elements.obligationsLoading.classList.toggle("oculto", !isLoading);
}

function resetObligationForm() {
  elements.obligationForm.reset();
  elements.obligationId.value = "";
  elements.obligationFormTitle.textContent = "Nueva obligación";
}

async function openObligationsManager(contractId) {
  const contract = contratos.find((item) => item.id === contractId);
  if (!contract) return;

  contratoSeleccionado = contract;
  obligacionesActuales = [];
  resetObligationForm();
  elements.obligationsTitle.textContent = `Obligaciones: ${contract.numero_contrato || "Contrato"}`;
  elements.obligationsSubtitle.textContent = contract.entidad
    ? `${contract.entidad}`
    : "Crea, edita o elimina obligaciones asociadas a este contrato.";
  elements.obligationsDialog.showModal();
  await loadObligations(contractId);
}

async function loadObligations(contractId = contratoSeleccionado?.id) {
  if (!contractId) return;
  setObligationsLoading(true);

  try {
    const params = new URLSearchParams({
      "filter[contrato_id][_eq]": contractId,
      fields: "id,contrato_id,numero,descripcion,created_at",
      sort: "numero",
      limit: "200",
    });

    const payload = await api(`/items/obligaciones?${params.toString()}`);
    obligacionesActuales = payload.data || [];
    renderObligations();
  } catch (error) {
    console.error(error);
    toast(`Error cargando obligaciones: ${error.message}`, "error");
  } finally {
    setObligationsLoading(false);
  }
}

function renderObligations() {
  elements.obligationsList.innerHTML = "";
  elements.obligationsCount.textContent = `${obligacionesActuales.length} obligación${obligacionesActuales.length === 1 ? "" : "es"}`;
  elements.obligationsEmpty.classList.toggle("oculto", obligacionesActuales.length > 0);

  obligacionesActuales.forEach((item) => {
    const article = document.createElement("article");
    article.className = "obligation-card";
    article.innerHTML = `
      <div>
        <strong>${escapeHtml(obligationLabel(item))}</strong>
        <p>${escapeHtml(item.descripcion || "")}</p>
      </div>
      <div class="card-actions">
        <button class="btn btn-light" data-obligation-action="edit" data-id="${item.id}">Editar</button>
        <button class="btn btn-danger" data-obligation-action="delete" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    elements.obligationsList.appendChild(article);
  });
}

function editObligation(id) {
  const item = obligacionesActuales.find((ob) => ob.id === id);
  if (!item) return;
  elements.obligationFormTitle.textContent = `Editar ${obligationLabel(item)}`;
  elements.obligationId.value = item.id;
  elements.obligacionNumero.value = item.numero ?? "";
  elements.obligacionDescripcion.value = item.descripcion || "";
  elements.obligacionNumero.focus();
}

async function saveObligation(event) {
  event.preventDefault();
  if (!contratoSeleccionado?.id) {
    toast("Primero selecciona un contrato", "error");
    return;
  }

  const id = elements.obligationId.value;
  const numero = Number(elements.obligacionNumero.value);
  const descripcion = elements.obligacionDescripcion.value.trim();

  if (!numero || numero < 1) {
    toast("El número de la obligación es obligatorio", "error");
    return;
  }
  if (!descripcion) {
    toast("La descripción de la obligación es obligatoria", "error");
    return;
  }

  const body = {
    numero,
    descripcion,
    contrato_id: contratoSeleccionado.id,
  };

  try {
    if (id) {
      await api(`/items/obligaciones/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast("Obligación actualizada");
    } else {
      await api("/items/obligaciones", { method: "POST", body: JSON.stringify(body) });
      toast("Obligación creada");
    }
    resetObligationForm();
    await loadObligations();
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar la obligación: ${error.message}`, "error");
  }
}

async function deleteObligation(id) {
  const item = obligacionesActuales.find((ob) => ob.id === id);
  const ok = confirm(`¿Eliminar ${obligationLabel(item || {})}?`);
  if (!ok) return;

  try {
    await api(`/items/obligaciones/${id}`, { method: "DELETE" });
    toast("Obligación eliminada");
    await loadObligations();
  } catch (error) {
    console.error(error);
    toast(`No se pudo eliminar la obligación: ${error.message}`, "error");
  }
}

function monthName(value) {
  const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return months[Number(value)] || value || "";
}

function reportLabel(item) {
  return `${monthName(item.mes)} ${item.anio || ""}`.trim();
}

function setReportsLoading(isLoading) {
  elements.reportsLoading.classList.toggle("oculto", !isLoading);
}

function setReportObligationsLoading(isLoading) {
  elements.reportObligationsLoading.classList.toggle("oculto", !isLoading);
}

function resetReportForm() {
  elements.reportForm.reset();
  elements.reportId.value = "";
  elements.reportFormTitle.textContent = "Nuevo informe mensual";
  const currentYear = new Date().getFullYear();
  elements.informeAnio.value = currentYear;
  elements.informeEstado.value = "borrador";
}

async function openReportsManager(contractId) {
  const contract = contratos.find((item) => item.id === contractId);
  if (!contract) return;

  contratoSeleccionado = contract;
  informesActuales = [];
  obligacionesParaInforme = [];
  resetReportForm();
  elements.reportsTitle.textContent = `Informes: ${contract.numero_contrato || "Contrato"}`;
  elements.reportsSubtitle.textContent = contract.entidad
    ? `${contract.entidad}`
    : "Crea, edita o elimina informes mensuales asociados a este contrato.";
  elements.reportsDialog.showModal();
  await Promise.all([
    loadReports(contractId),
    loadReportObligations(contractId),
  ]);
}

async function loadReports(contractId = contratoSeleccionado?.id) {
  if (!contractId) return;
  setReportsLoading(true);

  try {
    const params = new URLSearchParams({
      "filter[contrato_id][_eq]": contractId,
      fields: "id,contrato_id,anio,mes,estado,created_at",
      sort: "-anio,-mes",
      limit: "200",
    });

    const payload = await api(`/items/informes_mensuales?${params.toString()}`);
    informesActuales = payload.data || [];
    renderReports();
  } catch (error) {
    console.error(error);
    toast(`Error cargando informes: ${error.message}`, "error");
  } finally {
    setReportsLoading(false);
  }
}

async function loadReportObligations(contractId = contratoSeleccionado?.id) {
  if (!contractId) return;
  setReportObligationsLoading(true);

  try {
    const params = new URLSearchParams({
      "filter[contrato_id][_eq]": contractId,
      fields: "id,numero,descripcion",
      sort: "numero",
      limit: "200",
    });

    const payload = await api(`/items/obligaciones?${params.toString()}`);
    obligacionesParaInforme = payload.data || [];
    renderReportObligations();
  } catch (error) {
    console.error(error);
    toast(`Error cargando obligaciones del contrato: ${error.message}`, "error");
  } finally {
    setReportObligationsLoading(false);
  }
}

function renderReports() {
  elements.reportsList.innerHTML = "";
  elements.reportsCount.textContent = `${informesActuales.length} informe${informesActuales.length === 1 ? "" : "s"}`;
  elements.reportsEmpty.classList.toggle("oculto", informesActuales.length > 0);

  informesActuales.forEach((item) => {
    const article = document.createElement("article");
    article.className = "obligation-card";
    article.innerHTML = `
      <div>
        <strong>${escapeHtml(reportLabel(item))}</strong>
        <p><span class="badge">${escapeHtml(item.estado || "borrador")}</span></p>
      </div>
      <div class="card-actions">
        <button class="btn btn-light" data-report-action="edit" data-id="${item.id}">Editar</button>
        <button class="btn btn-danger" data-report-action="delete" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    elements.reportsList.appendChild(article);
  });
}

function renderReportObligations() {
  elements.reportObligationsList.innerHTML = "";
  elements.reportObligationsEmpty.classList.toggle("oculto", obligacionesParaInforme.length > 0);

  obligacionesParaInforme.forEach((item) => {
    const article = document.createElement("article");
    article.className = "obligation-card compact-card";
    article.innerHTML = `
      <div>
        <strong>${escapeHtml(obligationLabel(item))}</strong>
        <p>${escapeHtml(item.descripcion || "")}</p>
      </div>
    `;
    elements.reportObligationsList.appendChild(article);
  });
}

function editReport(id) {
  const item = informesActuales.find((report) => report.id === id);
  if (!item) return;
  elements.reportFormTitle.textContent = `Editar ${reportLabel(item)}`;
  elements.reportId.value = item.id;
  elements.informeAnio.value = item.anio || "";
  elements.informeMes.value = item.mes || "";
  elements.informeEstado.value = item.estado || "borrador";
  elements.informeAnio.focus();
}

async function saveReport(event) {
  event.preventDefault();
  if (!contratoSeleccionado?.id) {
    toast("Primero selecciona un contrato", "error");
    return;
  }

  const id = elements.reportId.value;
  const anio = Number(elements.informeAnio.value);
  const mes = Number(elements.informeMes.value);
  const estado = elements.informeEstado.value || "borrador";

  if (!anio || anio < 2000) {
    toast("El año del informe es obligatorio", "error");
    return;
  }
  if (!mes || mes < 1 || mes > 12) {
    toast("Selecciona un mes válido", "error");
    return;
  }

  const body = {
    anio,
    mes,
    estado,
    contrato_id: contratoSeleccionado.id,
  };

  try {
    if (id) {
      await api(`/items/informes_mensuales/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast("Informe mensual actualizado");
    } else {
      await api("/items/informes_mensuales", { method: "POST", body: JSON.stringify(body) });
      toast("Informe mensual creado");
    }
    resetReportForm();
    await loadReports();
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar el informe: ${error.message}`, "error");
  }
}

async function deleteReport(id) {
  const item = informesActuales.find((report) => report.id === id);
  const ok = confirm(`¿Eliminar el informe ${reportLabel(item || {})}?`);
  if (!ok) return;

  try {
    await api(`/items/informes_mensuales/${id}`, { method: "DELETE" });
    toast("Informe mensual eliminado");
    await loadReports();
  } catch (error) {
    console.error(error);
    toast(`No se pudo eliminar el informe: ${error.message}`, "error");
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
  elements.obligationForm.addEventListener("submit", saveObligation);
  elements.btnClearObligation.addEventListener("click", resetObligationForm);
  elements.btnReloadObligations.addEventListener("click", () => loadObligations());
  elements.btnCloseObligations.addEventListener("click", () => elements.obligationsDialog.close());
  elements.btnCloseObligationsFooter.addEventListener("click", () => elements.obligationsDialog.close());
  elements.reportForm.addEventListener("submit", saveReport);
  elements.btnClearReport.addEventListener("click", resetReportForm);
  elements.btnReloadReports.addEventListener("click", () => Promise.all([loadReports(), loadReportObligations()]));
  elements.btnCloseReports.addEventListener("click", () => elements.reportsDialog.close());
  elements.btnCloseReportsFooter.addEventListener("click", () => elements.reportsDialog.close());
  elements.searchInput.addEventListener("input", renderContracts);
  elements.btnMenu.addEventListener("click", () => elements.sidebar.classList.toggle("abierto"));

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  elements.contractsTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.action === "obligations") openObligationsManager(id);
    if (button.dataset.action === "reports") openReportsManager(id);
    if (button.dataset.action === "edit") openEditContract(id);
    if (button.dataset.action === "delete") deleteContract(id);
  });

  elements.obligationsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-obligation-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.obligationAction === "edit") editObligation(id);
    if (button.dataset.obligationAction === "delete") deleteObligation(id);
  });

  elements.reportsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-report-action]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.reportAction === "edit") editReport(id);
    if (button.dataset.reportAction === "delete") deleteReport(id);
  });
}

attachEvents();

if (accessToken) showApp();
else showLogin();
