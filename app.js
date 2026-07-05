const DIRECTUS_URL = "http://100.105.113.77:8055";

let accessToken = localStorage.getItem("directus_access_token") || "";
let refreshToken = localStorage.getItem("directus_refresh_token") || "";
let contratos = [];
let obligacionesActuales = [];
let informesActuales = [];
let obligacionesParaInforme = [];
let actividadesActuales = [];
let informeSeleccionado = null;
let obligacionSeleccionadaParaActividad = null;
let contratoSeleccionado = null;
let actividadSeleccionadaParaArchivos = null;
let archivosActividadActuales = [];
let archivoPegado = null;
let memoActualHtml = "";
let memoActualNombre = "ayudamemoria";
const assetDataUrlCache = new Map();

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
  activitiesDialog: $("#activitiesDialog"),
  activitiesTitle: $("#activitiesTitle"),
  activitiesSubtitle: $("#activitiesSubtitle"),
  activitiesCount: $("#activitiesCount"),
  activitiesNestedList: $("#activitiesNestedList"),
  activitiesEmpty: $("#activitiesEmpty"),
  activitiesLoading: $("#activitiesLoading"),
  activityForm: $("#activityForm"),
  activityFormTitle: $("#activityFormTitle"),
  activityContext: $("#activityContext"),
  activityId: $("#activityId"),
  activityObligationId: $("#activityObligationId"),
  activityObligationLabel: $("#activityObligationLabel"),
  actividadCodigo: $("#actividad_codigo"),
  actividadFecha: $("#actividad_fecha"),
  actividadTitulo: $("#actividad_titulo"),
  actividadDescripcion: $("#actividad_descripcion"),
  actividadTipo: $("#actividad_tipo"),
  actividadLugar: $("#actividad_lugar"),
  actividadEntidades: $("#actividad_entidades"),
  actividadObservaciones: $("#actividad_observaciones"),
  btnCloseActivities: $("#btnCloseActivities"),
  btnCloseActivitiesFooter: $("#btnCloseActivitiesFooter"),
  btnBackToReports: $("#btnBackToReports"),
  btnClearActivity: $("#btnClearActivity"),
  btnReloadActivities: $("#btnReloadActivities"),
  btnExportReportCsv: $("#btnExportReportCsv"),
  btnExportReportExcel: $("#btnExportReportExcel"),
  filesDialog: $("#filesDialog"),
  filesTitle: $("#filesTitle"),
  filesSubtitle: $("#filesSubtitle"),
  fileForm: $("#fileForm"),
  fileFormTitle: $("#fileFormTitle"),
  fileItemId: $("#fileItemId"),
  archivoCategoria: $("#archivo_categoria"),
  archivoDescripcion: $("#archivo_descripcion"),
  archivoOrden: $("#archivo_orden"),
  archivoFile: $("#archivo_file"),
  pasteZone: $("#pasteZone"),
  pasteFileName: $("#pasteFileName"),
  filePreview: $("#filePreview"),
  filesCount: $("#filesCount"),
  filesList: $("#filesList"),
  filesEmpty: $("#filesEmpty"),
  filesLoading: $("#filesLoading"),
  btnCloseFiles: $("#btnCloseFiles"),
  btnCloseFilesFooter: $("#btnCloseFilesFooter"),
  btnClearFile: $("#btnClearFile"),
  btnReloadFiles: $("#btnReloadFiles"),
  memoDialog: $("#memoDialog"),
  memoTitle: $("#memoTitle"),
  memoSubtitle: $("#memoSubtitle"),
  memoPreview: $("#memoPreview"),
  btnCloseMemo: $("#btnCloseMemo"),
  btnCloseMemoFooter: $("#btnCloseMemoFooter"),
  btnDownloadMemoWord: $("#btnDownloadMemoWord"),
  btnPrintMemoPdf: $("#btnPrintMemoPdf"),
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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) headers.set("Content-Type", "application/json");
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

function plainText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

const ICON_PATHS = {
  clipboardCheck: '<path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>',
  calendar: '<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/><path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>',
  pencil: '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>',
  trash: '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1M4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11z"/>',
  folderOpen: '<path d="m1.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 3.826 14h8.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 12.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H3.5a2 2 0 0 0-2 2m.694 2.09A1 1 0 0 1 3.19 4h9.62a1 1 0 0 1 .996 1.09l-.637 7a1 1 0 0 1-.995.91H3.826a1 1 0 0 1-.995-.91zM3.5 2h2.672a1 1 0 0 1 .707.293L7.707 3.12A3 3 0 0 0 9.828 4h2.982a2 2 0 0 1 1.414.586l-.029-.321A2 2 0 0 0 12.174 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H3.5a2 2 0 0 0-2 2v1.55A2.99 2.99 0 0 1 3.5 2"/>',
  plusCircle: '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>',
  image: '<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>',
  fileText: '<path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"/><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>',
  eye: '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>'
};

function iconSvg(name) {
  const path = ICON_PATHS[name] || ICON_PATHS.fileText;
  return `<svg class="bi" width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">${path}</svg>`;
}

function iconButton({ className = "btn btn-light btn-icon", actionAttr = "", id = "", icon = "fileText", label = "Acción" }) {
  const dataPart = actionAttr ? ` ${actionAttr}` : "";
  const idPart = id ? ` data-id="${escapeHtml(id)}"` : "";
  const iconMarkup = icon && icon.includes("<svg") ? icon : iconSvg(icon);
  return `<button class="${className}"${dataPart}${idPart} title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><span class="btn-ico" aria-hidden="true">${iconMarkup}</span><span class="btn-label">${escapeHtml(label)}</span></button>`;
}

function fileSafe(value) {
  return String(value || "archivo")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "archivo";
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function excelHtmlDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    th, td { border: 1px solid #000; padding: 6px; vertical-align: top; white-space: pre-line; mso-data-placement: same-cell; }
    th { background: #f2f2f2; font-weight: bold; text-align: left; }
    th:first-child, td:first-child { width: 38%; }
    th:last-child, td:last-child { width: 62%; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
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
      <td class="actions action-toolbar">
        ${iconButton({ actionAttr: 'data-action="obligations"', id: item.id, icon: "clipboardCheck", label: "Obligaciones" })}
        ${iconButton({ actionAttr: 'data-action="reports"', id: item.id, icon: "calendar", label: "Informes" })}
        ${iconButton({ actionAttr: 'data-action="edit"', id: item.id, icon: "pencil", label: "Editar" })}
        ${iconButton({ className: "btn btn-danger btn-icon", actionAttr: 'data-action="delete"', id: item.id, icon: "trash", label: "Eliminar" })}
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
      <div class="card-actions action-toolbar">
        ${iconButton({ actionAttr: 'data-obligation-action="edit"', id: item.id, icon: "pencil", label: "Editar obligación" })}
        ${iconButton({ className: "btn btn-danger btn-icon", actionAttr: 'data-obligation-action="delete"', id: item.id, icon: "trash", label: "Eliminar obligación" })}
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
      <div class="card-actions action-toolbar">
        ${iconButton({ className: "btn btn-primary btn-icon", actionAttr: 'data-report-action="open"', id: item.id, icon: "folderOpen", label: "Abrir informe" })}
        ${iconButton({ actionAttr: 'data-report-action="edit"', id: item.id, icon: "pencil", label: "Editar informe" })}
        ${iconButton({ className: "btn btn-danger btn-icon", actionAttr: 'data-report-action="delete"', id: item.id, icon: "trash", label: "Eliminar informe" })}
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


function setActivitiesLoading(isLoading) {
  elements.activitiesLoading.classList.toggle("oculto", !isLoading);
}

function activityLabel(item) {
  const title = item.titulo || dateShort(item.fecha_actividad) || "Actividad";
  return item.codigo ? `${item.codigo}. ${title}` : title;
}

function resetActivityForm() {
  elements.activityForm.reset();
  elements.activityId.value = "";
  elements.activityObligationId.value = "";
  elements.activityObligationLabel.value = "";
  elements.activityFormTitle.textContent = "Nueva actividad";
  elements.activityContext.textContent = "Selecciona una obligación desde el panel derecho.";
  obligacionSeleccionadaParaActividad = null;
}

function selectObligationForActivity(obligationId) {
  const item = obligacionesParaInforme.find((ob) => ob.id === obligationId);
  if (!item) return;
  obligacionSeleccionadaParaActividad = item;
  elements.activityId.value = "";
  elements.activityObligationId.value = item.id;
  elements.activityObligationLabel.value = `${obligationLabel(item)} - ${(item.descripcion || "").slice(0, 80)}`;
  elements.activityFormTitle.textContent = `Nueva actividad para ${obligationLabel(item)}`;
  elements.activityContext.textContent = `Informe: ${reportLabel(informeSeleccionado || {})}`;
  elements.actividadCodigo.value = nextActivityCode();
  elements.actividadFecha.focus();
}

function editActivity(activityId) {
  const item = actividadesActuales.find((act) => act.id === activityId);
  if (!item) return;
  const obligationId = typeof item.obligacion_id === "object" ? item.obligacion_id?.id : item.obligacion_id;
  const obligation = obligacionesParaInforme.find((ob) => ob.id === obligationId);
  obligacionSeleccionadaParaActividad = obligation || null;

  elements.activityFormTitle.textContent = `Editar ${activityLabel(item)}`;
  elements.activityId.value = item.id;
  elements.activityObligationId.value = obligationId || "";
  elements.activityObligationLabel.value = obligation
    ? `${obligationLabel(obligation)} - ${(obligation.descripcion || "").slice(0, 80)}`
    : "Obligación no encontrada";
  elements.actividadCodigo.value = item.codigo || "";
  elements.actividadFecha.value = dateShort(item.fecha_actividad);
  elements.actividadTitulo.value = item.titulo || "";
  elements.actividadDescripcion.value = item.descripcion || "";
  elements.actividadTipo.value = item.tipo_actividad || "";
  elements.actividadLugar.value = item.lugar || "";
  elements.actividadEntidades.value = item.entidades || "";
  elements.actividadObservaciones.value = item.observaciones || "";
  elements.actividadFecha.focus();
}

async function openActivitiesManager(reportId) {
  const report = informesActuales.find((item) => item.id === reportId);
  if (!report || !contratoSeleccionado?.id) return;

  informeSeleccionado = report;
  actividadesActuales = [];
  resetActivityForm();

  elements.activitiesTitle.textContent = `Informe: ${reportLabel(report)}`;
  elements.activitiesSubtitle.textContent = `${contratoSeleccionado.numero_contrato || "Contrato"}${contratoSeleccionado.entidad ? " · " + contratoSeleccionado.entidad : ""}`;
  elements.activitiesDialog.showModal();
  await loadActivitiesNested();
}

async function loadActivitiesNested() {
  if (!informeSeleccionado?.id || !contratoSeleccionado?.id) return;
  setActivitiesLoading(true);

  try {
    const obligationsParams = new URLSearchParams({
      "filter[contrato_id][_eq]": contratoSeleccionado.id,
      fields: "id,numero,descripcion",
      sort: "numero",
      limit: "200",
    });
    const activitiesParams = new URLSearchParams({
      "filter[informe_id][_eq]": informeSeleccionado.id,
      fields: "id,informe_id,obligacion_id,codigo,fecha_actividad,titulo,descripcion,tipo_actividad,lugar,entidades,observaciones,created_at",
      sort: "obligacion_id,fecha_actividad,created_at",
      limit: "500",
    });

    const [obligationsPayload, activitiesPayload] = await Promise.all([
      api(`/items/obligaciones?${obligationsParams.toString()}`),
      api(`/items/actividades?${activitiesParams.toString()}`),
    ]);

    obligacionesParaInforme = obligationsPayload.data || [];
    actividadesActuales = activitiesPayload.data || [];
    renderActivitiesNested();
  } catch (error) {
    console.error(error);
    toast(`Error cargando el informe: ${error.message}`, "error");
  } finally {
    setActivitiesLoading(false);
  }
}

function getActivityObligationId(activity) {
  return typeof activity.obligacion_id === "object" ? activity.obligacion_id?.id : activity.obligacion_id;
}

function renderActivitiesNested() {
  elements.activitiesNestedList.innerHTML = "";
  elements.activitiesEmpty.classList.toggle("oculto", obligacionesParaInforme.length > 0);
  elements.activitiesCount.textContent = `${actividadesActuales.length} actividad${actividadesActuales.length === 1 ? "" : "es"}`;

  obligacionesParaInforme.forEach((obligation) => {
    const activities = actividadesActuales.filter((act) => getActivityObligationId(act) === obligation.id);
    const section = document.createElement("article");
    section.className = "nested-obligation";
    section.innerHTML = `
      <div class="nested-obligation-header">
        <div>
          <strong>${escapeHtml(obligationLabel(obligation))}</strong>
          <p>${escapeHtml(obligation.descripcion || "")}</p>
        </div>
        <button class="btn btn-primary btn-icon btn-icon-wide" data-activity-action="new" data-obligation-id="${obligation.id}" title="Agregar actividad" aria-label="Agregar actividad"><span class="btn-ico" aria-hidden="true">${iconSvg("plusCircle")}</span><span class="btn-label">Actividad</span></button>
      </div>
      <div class="activity-list">
        ${activities.length ? activities.map((activity) => `
          <div class="activity-card">
            <div>
              <strong>${escapeHtml(activityLabel(activity))}</strong>
              <p class="muted">${escapeHtml(dateShort(activity.fecha_actividad))}${activity.tipo_actividad ? " · " + escapeHtml(activity.tipo_actividad) : ""}${activity.lugar ? " · " + escapeHtml(activity.lugar) : ""}</p>
              <p>${escapeHtml(activity.descripcion || "")}</p>
              ${activity.entidades ? `<p class="small-text"><strong>Entidades:</strong> ${escapeHtml(activity.entidades)}</p>` : ""}
              ${activity.observaciones ? `<p class="small-text"><strong>Observaciones:</strong> ${escapeHtml(activity.observaciones)}</p>` : ""}
            </div>
            <div class="card-actions action-toolbar">
              ${iconButton({ actionAttr: 'data-activity-action="files"', id: activity.id, icon: "image", label: "Imágenes" })}
              ${iconButton({ actionAttr: 'data-activity-action="memo"', id: activity.id, icon: "fileText", label: "Ayudamemoria" })}
              ${iconButton({ actionAttr: 'data-activity-action="edit"', id: activity.id, icon: "pencil", label: "Editar actividad" })}
              ${iconButton({ className: "btn btn-danger btn-icon", actionAttr: 'data-activity-action="delete"', id: activity.id, icon: "trash", label: "Eliminar actividad" })}
            </div>
          </div>
        `).join("") : `<div class="empty-inline">Sin actividades para esta obligación en este informe.</div>`}
      </div>
    `;
    elements.activitiesNestedList.appendChild(section);
  });
}

async function saveActivity(event) {
  event.preventDefault();
  if (!informeSeleccionado?.id) {
    toast("Primero abre un informe mensual", "error");
    return;
  }

  const activityId = elements.activityId.value;
  const obligationId = elements.activityObligationId.value;
  const descripcion = elements.actividadDescripcion.value.trim();

  if (!obligationId) {
    toast("Selecciona una obligación para agregar la actividad", "error");
    return;
  }
  if (!descripcion) {
    toast("La descripción de la actividad es obligatoria", "error");
    return;
  }

  const body = {
    informe_id: informeSeleccionado.id,
    obligacion_id: obligationId,
    codigo: activityId
      ? (elements.actividadCodigo.value.trim() || actividadesActuales.find((act) => act.id === activityId)?.codigo || nextActivityCode())
      : nextActivityCode(),
    fecha_actividad: elements.actividadFecha.value || null,
    titulo: elements.actividadTitulo.value.trim() || null,
    descripcion,
    tipo_actividad: elements.actividadTipo.value.trim() || null,
    lugar: elements.actividadLugar.value.trim() || null,
    entidades: elements.actividadEntidades.value.trim() || null,
    observaciones: elements.actividadObservaciones.value.trim() || null,
  };

  try {
    if (activityId) {
      await api(`/items/actividades/${activityId}`, { method: "PATCH", body: JSON.stringify(body) });
      toast("Actividad actualizada");
    } else {
      await api("/items/actividades", { method: "POST", body: JSON.stringify(body) });
      toast("Actividad creada");
    }
    resetActivityForm();
    await loadActivitiesNested();
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar la actividad: ${error.message}`, "error");
  }
}

async function deleteActivity(activityId) {
  const item = actividadesActuales.find((act) => act.id === activityId);
  const ok = confirm(`¿Eliminar la actividad ${activityLabel(item || {})}?`);
  if (!ok) return;

  try {
    await api(`/items/actividades/${activityId}`, { method: "DELETE" });
    toast("Actividad eliminada");
    await loadActivitiesNested();
  } catch (error) {
    console.error(error);
    toast(`No se pudo eliminar la actividad: ${error.message}`, "error");
  }
}


function activitiesForObligation(obligationId) {
  return actividadesActuales
    .filter((act) => getActivityObligationId(act) === obligationId)
    .sort(compareActivitiesForReport);
}

function activityCodeNumber(value) {
  const match = String(value || "").trim().match(/^A(\d+)$/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function compareActivitiesForReport(a, b) {
  const codeDiff = activityCodeNumber(a.codigo) - activityCodeNumber(b.codigo);
  if (Number.isFinite(codeDiff) && codeDiff !== 0) return codeDiff;
  const dateDiff = String(a.fecha_actividad || "").localeCompare(String(b.fecha_actividad || ""));
  if (dateDiff !== 0) return dateDiff;
  return String(a.created_at || a.id || "").localeCompare(String(b.created_at || b.id || ""));
}

function nextActivityCode() {
  const max = actividadesActuales.reduce((acc, act) => {
    const num = activityCodeNumber(act.codigo);
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `A${max + 1}`;
}

function activityDisplayCode(activity) {
  if (activity?.codigo) return String(activity.codigo).trim();
  return "";
}

function activityExportText(activity) {
  const code = activityDisplayCode(activity);
  const title = plainText(activity.titulo || "");
  const description = plainText(activity.descripcion || "");
  const main = title && description && title !== description
    ? `${title}: ${description}`
    : (title || description || "Actividad registrada");
  return `${code ? code + ". " : ""}${main}`;
}

function buildReportMatrixRows() {
  return obligacionesParaInforme.map((obligation) => {
    const activities = activitiesForObligation(obligation.id);
    return {
      obligacion: `${obligation.numero ?? ""}\n${plainText(obligation.descripcion)}`.trim(),
      actividades: activities.length
        ? activities.map((activity) => activityExportText(activity)).join("\n")
        : "",
    };
  });
}

function ensureReportReadyForExport() {
  if (!informeSeleccionado?.id || !contratoSeleccionado?.id) {
    toast("Primero abre un informe mensual", "error");
    return false;
  }
  if (!obligacionesParaInforme.length) {
    toast("El contrato no tiene obligaciones para exportar", "error");
    return false;
  }
  return true;
}

function reportFileBaseName() {
  const contract = fileSafe(contratoSeleccionado?.numero_contrato || "contrato");
  const report = fileSafe(reportLabel(informeSeleccionado || {}));
  return `informe-${contract}-${report}`;
}

function exportReportCsv() {
  if (!ensureReportReadyForExport()) return;
  const rows = buildReportMatrixRows();
  const csv = [
    ["ID OBLIGACIÓN", monthName(informeSeleccionado?.mes).toUpperCase()].map(csvCell).join(","),
    ...rows.map((row) => [csvCell(row.obligacion), csvCell(row.actividades)].join(",")),
  ].join("\r\n");
  downloadTextFile(`${reportFileBaseName()}.csv`, "\ufeff" + csv, "text/csv;charset=utf-8");
  toast("CSV descargado");
}

function exportReportExcel() {
  if (!ensureReportReadyForExport()) return;
  const rows = buildReportMatrixRows();
  const monthHeader = monthName(informeSeleccionado?.mes).toUpperCase();
  const title = `Informe ${reportLabel(informeSeleccionado || {})}`;
  const body = `
    <table class="report-export-table">
      <thead><tr><th>ID OBLIGACIÓN</th><th>${escapeHtml(monthHeader)}</th></tr></thead>
      <tbody>
        ${rows.map((row) => `<tr><td>${escapeHtml(row.obligacion)}</td><td>${escapeHtml(row.actividades)}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
  const html = excelHtmlDocument(title, body);
  downloadTextFile(`${reportFileBaseName()}.xls`, html, "application/vnd.ms-excel;charset=utf-8");
  toast("Excel descargado");
}

async function fetchActivityFiles(activityId) {
  const params = new URLSearchParams({
    "filter[actividad_id][_eq]": activityId,
    fields: "id,actividad_id,nombre_original,nombre_archivo,ruta,tipo_mime,categoria,descripcion,orden,directus_file_id,created_at",
    sort: "categoria,orden,created_at",
    limit: "200",
  });
  const payload = await api(`/items/archivos_actividad?${params.toString()}`);
  return payload.data || [];
}

function imageItemsByCategory(files, category) {
  return files
    .filter((item) => (item.categoria || "cuerpo") === category)
    .filter((item) => String(item.tipo_mime || "").startsWith("image/") && getArchivoFileId(item));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function assetDataUrl(fileId) {
  if (!fileId) return "";
  if (assetDataUrlCache.has(fileId)) return assetDataUrlCache.get(fileId);

  const response = await fetch(assetUrl(fileId), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar la imagen ${fileId}`);
  }

  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  assetDataUrlCache.set(fileId, dataUrl);
  return dataUrl;
}

async function renderMemoImages(files, category, emptyText = "Sin imagen") {
  const images = imageItemsByCategory(files, category);
  if (!images.length) return `<div class="memo-empty-image">${escapeHtml(emptyText)}</div>`;

  const parts = await Promise.all(images.map(async (item) => {
    const dataUrl = await assetDataUrl(getArchivoFileId(item));
    return `
      <figure class="memo-figure">
        <img src="${dataUrl}" alt="${escapeHtml(item.nombre_original || "imagen")}">
        ${item.descripcion ? `<figcaption>${escapeHtml(item.descripcion)}</figcaption>` : ""}
      </figure>
    `;
  }));

  return parts.join("");
}

function dateLongEs(value) {
  if (!value) return "";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  if (!year || !month || !day) return dateShort(value);
  return `${day}-${monthName(Number(month)).toLowerCase()}-${year}`;
}

function memoTextParagraphs(text) {
  const value = plainText(text);
  if (!value) return "";
  return value.split("\n").filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function activityInfoHtml(activity) {
  const modalidad = activity.titulo || activity.tipo_actividad || "";
  const convoca = activity.lugar || "";
  const participantes = activity.entidades || "";
  const metaRows = [
    ["Fecha", dateLongEs(activity.fecha_actividad)],
    ["Modalidad", modalidad],
    ["Convoca", convoca],
    ["Participan", participantes],
  ].filter(([, value]) => value);

  return `
    <section class="memo-meta-lines">
      ${metaRows.map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</p>`).join("")}
    </section>
    <section class="memo-section memo-development">
      ${memoTextParagraphs(activity.descripcion || "")}
    </section>
    ${activity.observaciones ? `<section class="memo-section"><h3>Observaciones</h3>${memoTextParagraphs(activity.observaciones)}</section>` : ""}
  `;
}

async function openMemo(activityId) {
  const activity = actividadesActuales.find((act) => act.id === activityId);
  if (!activity) return;

  try {
    toast("Preparando ayudamemoria...");
    const files = await fetchActivityFiles(activityId);
    const headerImages = await renderMemoImages(files, "encabezado", "Sin imagen de encabezado");
    const bodyImages = await renderMemoImages(files, "cuerpo", "Sin imágenes de cuerpo");
    const objetivo = activity.titulo || activity.descripcion || "Objetivo de la actividad";

    memoActualNombre = `ayudamemoria-${fileSafe(activityLabel(activity))}`;
    memoActualHtml = `
      <article class="memo-document memo-formal-document">
        <h1>AYUDA MEMORIA</h1>
        <table class="memo-header-table formal-header-table">
          <colgroup>
            <col class="memo-header-image-col" style="width:30%">
            <col class="memo-objective-col" style="width:70%">
          </colgroup>
          <tbody>
            <tr>
              <td class="memo-header-image-cell">${headerImages}</td>
              <td class="memo-objective-cell"><strong>Objetivo identificado</strong><p>${escapeHtml(objetivo)}</p></td>
            </tr>
          </tbody>
        </table>
        ${activityInfoHtml(activity)}
        <section class="memo-section memo-body-images">
          <div class="memo-images-grid">${bodyImages}</div>
        </section>
      </article>
    `;

    elements.memoTitle.textContent = `Ayudamemoria: ${activityLabel(activity)}`;
    elements.memoSubtitle.textContent = `${reportLabel(informeSeleccionado || {})} · ${contratoSeleccionado?.numero_contrato || "Contrato"}`;
    elements.memoPreview.innerHTML = memoActualHtml;
    elements.memoDialog.showModal();
  } catch (error) {
    console.error(error);
    toast(`No se pudo generar la ayudamemoria: ${error.message}`, "error");
  }
}

function downloadMemoWord() {
  if (!memoActualHtml) {
    toast("Primero genera una ayudamemoria", "error");
    return;
  }
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ayudamemoria</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; font-size: 12pt; }
    h1 { text-align: center; font-size: 13pt; margin: 0 0 14px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
    img { max-width: 100%; height: auto; display: block; }
    .formal-header-table { margin-bottom: 18px; table-layout: fixed; width: 100%; }
    .formal-header-table .memo-header-image-col { width: 30%; }
    .formal-header-table .memo-objective-col { width: 70%; }
    .formal-header-table td { height: 120px; }
    .memo-header-image-cell { width: 30%; }
    .memo-objective-cell { width: 70%; }
    .memo-header-image-cell img { max-height: 110px; max-width: 100%; width: auto; }
    .memo-objective-cell strong { display: block; margin-bottom: 18px; }
    .memo-meta-lines { margin: 14px 0; }
    .memo-meta-lines p { margin: 2px 0; }
    .memo-section { margin-top: 16px; }
    .memo-section h3 { font-size: 12pt; margin-bottom: 8px; }
    .memo-body-images .memo-figure img { width: 100%; max-width: 640px; margin-top: 10px; }
    .memo-empty-image { color: #666; }
  </style>
</head>
<body>${memoActualHtml}</body>
</html>`;
  downloadTextFile(`${memoActualNombre}.doc`, html, "application/msword;charset=utf-8");
  toast("Word descargado");
}

function printMemoPdf() {
  if (!memoActualHtml) {
    toast("Primero genera una ayudamemoria", "error");
    return;
  }
  const win = window.open("", "_blank");
  if (!win) {
    toast("El navegador bloqueó la ventana de impresión", "error");
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(memoActualNombre)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 24px 38px; font-size: 12pt; }
    h1 { text-align: center; font-size: 13pt; margin: 0 0 14px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
    img { max-width: 100%; height: auto; }
    .formal-header-table { margin-bottom: 18px; table-layout: fixed; width: 100%; }
    .formal-header-table .memo-header-image-col { width: 30%; }
    .formal-header-table .memo-objective-col { width: 70%; }
    .formal-header-table td { height: 120px; }
    .memo-header-image-cell { width: 30%; }
    .memo-objective-cell { width: 70%; }
    .memo-header-image-cell img { max-height: 110px; max-width: 100%; width: auto; }
    .memo-objective-cell strong { display: block; margin-bottom: 18px; }
    .memo-meta-lines { margin: 14px 0; }
    .memo-meta-lines p { margin: 2px 0; }
    .memo-section { margin-top: 16px; }
    .memo-section h3 { font-size: 12pt; margin-bottom: 8px; }
    .memo-figure { margin: 0 0 12px 0; }
    .memo-body-images .memo-figure img { width: 100%; max-width: 640px; }
    .memo-empty-image { color: #666; }
  </style>
</head>
<body>${memoActualHtml}</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

function setFilesLoading(isLoading) {
  elements.filesLoading.classList.toggle("oculto", !isLoading);
}

function resetFileForm() {
  elements.fileForm.reset();
  elements.fileItemId.value = "";
  elements.archivoCategoria.value = "cuerpo";
  elements.archivoOrden.value = "1";
  archivoPegado = null;
  elements.pasteFileName.textContent = "Sin captura pegada";
  elements.filePreview.innerHTML = "";
  elements.filePreview.classList.add("oculto");
  elements.fileFormTitle.textContent = "Agregar imagen";
}

function showFilePreview(file) {
  elements.filePreview.innerHTML = "";
  if (!file) {
    elements.filePreview.classList.add("oculto");
    return;
  }
  const info = document.createElement("p");
  info.className = "small-text";
  info.innerHTML = `<strong>${escapeHtml(file.name || "captura.png")}</strong><br>${escapeHtml(file.type || "archivo")} · ${Math.round((file.size || 0) / 1024)} KB`;
  elements.filePreview.appendChild(info);

  if ((file.type || "").startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    img.alt = "Vista previa";
    elements.filePreview.appendChild(img);
  }

  elements.filePreview.classList.remove("oculto");
}

function assetUrl(fileId) {
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

function getArchivoFileId(item) {
  return typeof item.directus_file_id === "object" ? item.directus_file_id?.id : item.directus_file_id;
}

async function openFilesManager(activityId) {
  const activity = actividadesActuales.find((act) => act.id === activityId);
  if (!activity) return;

  actividadSeleccionadaParaArchivos = activity;
  archivosActividadActuales = [];
  resetFileForm();
  elements.filesTitle.textContent = `Imágenes: ${activityLabel(activity)}`;
  elements.filesSubtitle.textContent = "Clasifica imágenes como encabezado, cuerpo, anexo o soporte para el futuro ayudamemoria.";
  elements.filesDialog.showModal();
  await loadActivityFiles();
}

async function loadActivityFiles() {
  if (!actividadSeleccionadaParaArchivos?.id) return;
  setFilesLoading(true);
  try {
    const params = new URLSearchParams({
      "filter[actividad_id][_eq]": actividadSeleccionadaParaArchivos.id,
      fields: "id,actividad_id,nombre_original,nombre_archivo,ruta,tipo_mime,categoria,descripcion,orden,directus_file_id,created_at",
      sort: "categoria,orden,created_at",
      limit: "200",
    });
    const payload = await api(`/items/archivos_actividad?${params.toString()}`);
    archivosActividadActuales = payload.data || [];
    renderActivityFiles();
  } catch (error) {
    console.error(error);
    toast(`Error cargando archivos: ${error.message}`, "error");
  } finally {
    setFilesLoading(false);
  }
}

function renderActivityFiles() {
  elements.filesList.innerHTML = "";
  elements.filesCount.textContent = `${archivosActividadActuales.length} archivo${archivosActividadActuales.length === 1 ? "" : "s"}`;
  elements.filesEmpty.classList.toggle("oculto", archivosActividadActuales.length > 0);

  archivosActividadActuales.forEach((item) => {
    const fileId = getArchivoFileId(item);
    const isImage = String(item.tipo_mime || "").startsWith("image/");
    const article = document.createElement("article");
    article.className = "file-card";
    article.innerHTML = `
      <div class="file-thumb">
        ${fileId && isImage ? `<img data-file-thumb="${fileId}" alt="${escapeHtml(item.nombre_original || "imagen")}">` : `<span>${escapeHtml((item.tipo_mime || "archivo").split("/").pop() || "archivo")}</span>`}
      </div>
      <div class="file-info">
        <div class="file-meta">
          <span class="badge">${escapeHtml(item.categoria || "cuerpo")}</span>
          <span class="muted">Orden ${escapeHtml(item.orden ?? "1")}</span>
        </div>
        <strong>${escapeHtml(item.nombre_original || item.nombre_archivo || "Archivo")}</strong>
        ${item.descripcion ? `<p>${escapeHtml(item.descripcion)}</p>` : ""}
        <div class="card-actions action-toolbar">
          ${fileId ? iconButton({ actionAttr: `data-file-action="view" data-file-id="${escapeHtml(fileId)}"`, icon: "eye", label: "Ver archivo" }) : ""}
          ${iconButton({ className: "btn btn-danger btn-icon", actionAttr: 'data-file-action="delete"', id: item.id, icon: "trash", label: "Eliminar archivo" })}
        </div>
      </div>
    `;
    elements.filesList.appendChild(article);
  });
  hydrateFileThumbnails();
}

async function hydrateFileThumbnails() {
  const images = elements.filesList.querySelectorAll("img[data-file-thumb]");
  for (const img of images) {
    const fileId = img.dataset.fileThumb;
    try {
      img.src = await assetDataUrl(fileId);
    } catch (error) {
      console.warn("No se pudo cargar miniatura", fileId, error);
      img.replaceWith(Object.assign(document.createElement("span"), { textContent: "imagen" }));
    }
  }
}

async function openAssetFile(fileId) {
  try {
    const dataUrl = await assetDataUrl(fileId);
    const win = window.open("", "_blank");
    if (!win) {
      toast("El navegador bloqueó la ventana del archivo", "error");
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Archivo</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#111}img{max-width:96vw;max-height:96vh}</style></head><body><img src="${dataUrl}" alt="Archivo"></body></html>`);
    win.document.close();
  } catch (error) {
    console.error(error);
    toast(`No se pudo abrir el archivo: ${error.message}`, "error");
  }
}

async function uploadToDirectus(file) {
  const formData = new FormData();
  formData.append("file", file, file.name || "captura.png");
  const payload = await api("/files", { method: "POST", body: formData });
  return payload.data;
}

async function saveActivityFile(event) {
  event.preventDefault();
  if (!actividadSeleccionadaParaArchivos?.id) {
    toast("Primero selecciona una actividad", "error");
    return;
  }

  const selectedFile = elements.archivoFile.files?.[0] || archivoPegado;
  if (!selectedFile) {
    toast("Selecciona una imagen o pega una captura", "error");
    return;
  }

  try {
    const uploaded = await uploadToDirectus(selectedFile);
    const fileId = uploaded.id;
    const originalName = uploaded.filename_download || selectedFile.name || "captura.png";

    const body = {
      actividad_id: actividadSeleccionadaParaArchivos.id,
      directus_file_id: fileId,
      nombre_original: originalName,
      nombre_archivo: uploaded.filename_disk || originalName,
      ruta: `/assets/${fileId}`,
      tipo_mime: uploaded.type || selectedFile.type || null,
      categoria: elements.archivoCategoria.value || "cuerpo",
      descripcion: elements.archivoDescripcion.value.trim() || null,
      orden: Number(elements.archivoOrden.value || 1),
    };

    await api("/items/archivos_actividad", { method: "POST", body: JSON.stringify(body) });
    toast("Imagen guardada");
    resetFileForm();
    await loadActivityFiles();
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar la imagen: ${error.message}`, "error");
  }
}

async function deleteActivityFile(itemId) {
  const item = archivosActividadActuales.find((file) => file.id === itemId);
  const ok = confirm(`¿Eliminar el archivo ${item?.nombre_original || "seleccionado"}?`);
  if (!ok) return;

  try {
    await api(`/items/archivos_actividad/${itemId}`, { method: "DELETE" });
    const fileId = item ? getArchivoFileId(item) : null;
    if (fileId) {
      try { await api(`/files/${fileId}`, { method: "DELETE" }); } catch (error) { console.warn("No se pudo eliminar el archivo físico en Directus", error); }
    }
    toast("Archivo eliminado");
    await loadActivityFiles();
  } catch (error) {
    console.error(error);
    toast(`No se pudo eliminar el archivo: ${error.message}`, "error");
  }
}

function handlePaste(event) {
  const items = event.clipboardData?.items || [];
  for (const item of items) {
    if (item.type && item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      if (!blob) continue;
      const ext = item.type.split("/")[1] || "png";
      archivoPegado = new File([blob], `captura-${Date.now()}.${ext}`, { type: item.type });
      elements.archivoFile.value = "";
      elements.pasteFileName.textContent = archivoPegado.name;
      showFilePreview(archivoPegado);
      toast("Captura pegada. Ahora puedes guardarla.");
      event.preventDefault();
      return;
    }
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
  elements.activityForm.addEventListener("submit", saveActivity);
  elements.btnClearActivity.addEventListener("click", resetActivityForm);
  elements.btnReloadActivities.addEventListener("click", loadActivitiesNested);
  elements.btnExportReportCsv.addEventListener("click", exportReportCsv);
  elements.btnExportReportExcel.addEventListener("click", exportReportExcel);
  elements.fileForm.addEventListener("submit", saveActivityFile);
  elements.btnClearFile.addEventListener("click", resetFileForm);
  elements.btnReloadFiles.addEventListener("click", loadActivityFiles);
  elements.btnCloseFiles.addEventListener("click", () => elements.filesDialog.close());
  elements.btnCloseFilesFooter.addEventListener("click", () => elements.filesDialog.close());
  elements.btnCloseMemo.addEventListener("click", () => elements.memoDialog.close());
  elements.btnCloseMemoFooter.addEventListener("click", () => elements.memoDialog.close());
  elements.btnDownloadMemoWord.addEventListener("click", downloadMemoWord);
  elements.btnPrintMemoPdf.addEventListener("click", printMemoPdf);
  elements.pasteZone.addEventListener("paste", handlePaste);
  elements.pasteZone.addEventListener("click", () => elements.pasteZone.focus());
  elements.archivoFile.addEventListener("change", () => {
    archivoPegado = null;
    elements.pasteFileName.textContent = "Sin captura pegada";
    showFilePreview(elements.archivoFile.files?.[0] || null);
  });
  elements.btnCloseActivities.addEventListener("click", () => elements.activitiesDialog.close());
  elements.btnCloseActivitiesFooter.addEventListener("click", () => elements.activitiesDialog.close());
  elements.btnBackToReports.addEventListener("click", () => elements.activitiesDialog.close());
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
    if (button.dataset.reportAction === "open") openActivitiesManager(id);
    if (button.dataset.reportAction === "edit") editReport(id);
    if (button.dataset.reportAction === "delete") deleteReport(id);
  });

  elements.activitiesNestedList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-activity-action]");
    if (!button) return;
    if (button.dataset.activityAction === "new") selectObligationForActivity(button.dataset.obligationId);
    if (button.dataset.activityAction === "files") openFilesManager(button.dataset.id);
    if (button.dataset.activityAction === "memo") openMemo(button.dataset.id);
    if (button.dataset.activityAction === "edit") editActivity(button.dataset.id);
    if (button.dataset.activityAction === "delete") deleteActivity(button.dataset.id);
  });

  elements.filesList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-file-action]");
    if (!button) return;
    if (button.dataset.fileAction === "view") openAssetFile(button.dataset.fileId);
    if (button.dataset.fileAction === "delete") deleteActivityFile(button.dataset.id);
  });
}

attachEvents();

if (accessToken) showApp();
else showLogin();
