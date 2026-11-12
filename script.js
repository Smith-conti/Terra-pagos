const WEBHOOK = "https://smith-mt.app.n8n.cloud/webhook/pago-terra";
const TOKEN = "mpt-7f3a9c21e84b";
const BOT = "TerraAssistant24_bot";

const q = new URLSearchParams(location.search);
if (q.get("tour")) document.getElementById("tour").value = q.get("tour");
if (q.get("monto")) document.getElementById("monto").value = q.get("monto");

document.getElementById("pagar").onclick = async () => {
  const g = id => document.getElementById(id).value.trim();
  const err = document.getElementById("error");
  err.textContent = "";
  if (!g("nombre") || !g("apellidos") || !g("fecha")) {
    err.textContent = "Completa nombre, apellidos y fecha de viaje.";
    return;
  }
  const btn = document.getElementById("pagar");
  btn.disabled = true;
  btn.textContent = "Procesando...";
  try {
    const r = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: TOKEN,
        nombre: g("nombre"),
        apellidos: g("apellidos"),
        fecha_viaje: g("fecha"),
        tour: g("tour"),
        monto: g("monto")
      })
    });
    if (!r.ok) throw new Error("http");
    const d = await r.json().catch(() => null);
    if (!d || !d.ok) throw new Error("rechazado");
    const codigo = (typeof d.codigo === "string" || typeof d.codigo === "number")
      ? String(d.codigo).trim()
      : "";
    if (!codigo) {
      const e = new Error("sin-codigo");
      e.sinCodigo = true;
      throw e;
    }
    document.getElementById("form").style.display = "none";
    document.getElementById("ok").style.display = "block";
    document.getElementById("codigo").textContent = codigo;
    document.getElementById("volver").href = "https://t.me/" + BOT + "?start=" + encodeURIComponent(codigo);
    resetCopiar();
    document.getElementById("copiar").focus();
  } catch (e) {
    err.textContent = e && e.sinCodigo
      ? "El servidor no devolvió un código de pago. Intenta de nuevo."
      : "No se pudo registrar el pago. Intenta de nuevo.";
    btn.disabled = false;
    btn.textContent = "Pagar";
  }
};

const copiarBtn = document.getElementById("copiar");
const copiarEstado = document.getElementById("copiar-estado");
let copiarTimer;

function resetCopiar() {
  clearTimeout(copiarTimer);
  copiarBtn.textContent = "Copiar código";
  copiarEstado.textContent = "";
}

async function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  const ta = document.createElement("textarea");
  ta.value = texto;
  ta.readOnly = true;
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  if (!ok) throw new Error("copy");
}

copiarBtn.onclick = async () => {
  const codigo = document.getElementById("codigo").textContent;
  if (!codigo) return;
  try {
    await copiarTexto(codigo);
    copiarBtn.textContent = "¡Código copiado!";
    copiarEstado.textContent = "Código copiado al portapapeles.";
  } catch (e) {
    copiarBtn.textContent = "No se pudo copiar";
    copiarEstado.textContent = "No se pudo copiar. Selecciona el código y cópialo manualmente.";
    const r = document.createRange();
    r.selectNodeContents(document.getElementById("codigo"));
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  clearTimeout(copiarTimer);
  copiarTimer = setTimeout(resetCopiar, 2500);
};
