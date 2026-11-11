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
    const d = await r.json();
    if (!d.ok) throw new Error("rechazado");
    document.getElementById("form").style.display = "none";
    document.getElementById("ok").style.display = "block";
    document.getElementById("codigo").textContent = d.codigo;
    document.getElementById("volver").href = "https://t.me/" + BOT + "?start=" + encodeURIComponent(d.codigo);
  } catch (e) {
    err.textContent = "No se pudo registrar el pago. Intenta de nuevo.";
    btn.disabled = false;
    btn.textContent = "Pagar";
  }
};
