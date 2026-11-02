/* =====================================================================
   CALENDARIO KALYTA
   ---------------------------------------------------------------------
   Le date NON si scrivono qui: arrivano dal Foglio Google
   "Calendario sito Kalyta" (scheda "Date"), nel Drive di Kalyta.
   Basta aggiungere o modificare una riga nel foglio e il sito si
   aggiorna da solo.

   Il foglio deve essere condiviso come "Chiunque abbia il link:
   Visualizzatore", altrimenti il sito non riesce a leggerlo.
   ===================================================================== */

const FOGLIO_ID = "1A3DCUmEcTDuTHzE7fJcJXE7HCyW6LBi5Nr761ld12ps";
const FOGLIO_SCHEDA = "Date";
const MOSTRA_ALMENO_FINO_A = "2027-03-31"; // il calendario mostra i mesi almeno fino a questa data
const WHATSAPP = "393501795131";

(function () {
  const box = document.querySelector(".cal-months");
  const filtri = document.querySelector(".cal-filters");
  if (!box) return;

  const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const GIORNI = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wa = testo => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(testo)}`;

  // "21/11/2026", "21/11/26" oppure "2026-11-21"
  function leggiData(s) {
    s = String(s || "").trim();
    let m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
    if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, +m[2] - 1, +m[1]); }
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return null;
  }

  // CSV semplice con virgolette
  function leggiCSV(testo) {
    const righe = []; let riga = [], campo = "", q = false;
    for (let i = 0; i < testo.length; i++) {
      const c = testo[i];
      if (q) {
        if (c === '"' && testo[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') q = false;
        else campo += c;
      } else if (c === '"') q = true;
      else if (c === ",") { riga.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && testo[i + 1] === "\n") i++;
        riga.push(campo); righe.push(riga); riga = []; campo = "";
      } else campo += c;
    }
    if (campo || riga.length) { riga.push(campo); righe.push(riga); }
    return righe;
  }

  function daFoglio(csv) {
    const righe = leggiCSV(csv).filter(r => r.some(c => c.trim()));
    if (!righe.length) return [];
    const intest = righe[0].map(h => h.trim().toLowerCase());
    const col = nome => intest.indexOf(nome);
    const prendi = (r, nome) => (col(nome) >= 0 ? (r[col(nome)] || "").trim() : "");
    return righe.slice(1).map(r => ({
      d: leggiData(prendi(r, "data")),
      ora: prendi(r, "orario"),
      titolo: prendi(r, "titolo"),
      tipo: prendi(r, "tipo"),
      luogo: prendi(r, "luogo"),
      descrizione: prendi(r, "descrizione"),
      prezzo: prendi(r, "prezzo"),
      stato: prendi(r, "stato").toLowerCase(),
    })).filter(e => e.d && e.titolo && e.stato !== "bozza");
  }

  function card(e) {
    const quando = `${e.d.getDate()} ${MESI[e.d.getMonth()].toLowerCase()} ${e.d.getFullYear()}`;
    const completo = e.stato === "completo";
    const badge = completo ? '<em class="cal-tag cal-tag-full">Posti esauriti</em>'
      : e.stato === "ultimi posti" ? '<em class="cal-tag">Ultimi posti</em>' : "";
    const azione = completo
      ? `<a class="cal-book cal-book-full" href="${wa(`Ciao Kalyta, "${e.titolo}" del ${quando} è al completo: potete avvisarmi per la prossima data?`)}" target="_blank" rel="noopener">Avvisami →</a>`
      : `<a class="cal-book" href="${wa(`Ciao Kalyta, vorrei prenotare un posto per "${e.titolo}" del ${quando}.`)}" target="_blank" rel="noopener">Prenota →</a>`;
    return `<article class="cal-event${completo ? " is-full" : ""}">
      <div class="cal-date"><span>${GIORNI[e.d.getDay()]}</span><strong>${e.d.getDate()}</strong></div>
      <div class="cal-body">
        <p class="cal-meta">${esc(e.tipo || "Laboratorio")}${e.ora ? " · " + esc(e.ora) : ""} ${badge}</p>
        <h3>${esc(e.titolo)}</h3>
        ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ""}
        ${e.luogo || e.prezzo ? `<p class="cal-place">${esc(e.luogo)}${e.luogo && e.prezzo ? " · " : ""}${esc(e.prezzo)}</p>` : ""}
      </div>
      ${azione}
    </article>`;
  }

  function mostra(tutti) {
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    const eventi = tutti.filter(e => e.d >= oggi).sort((a, b) => a.d - b.d);
    let fine = leggiData(MOSTRA_ALMENO_FINO_A);
    if (eventi.length && eventi[eventi.length - 1].d > fine) fine = eventi[eventi.length - 1].d;

    const mesi = [];
    for (let d = new Date(oggi.getFullYear(), oggi.getMonth(), 1); d <= fine; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      mesi.push({ key: d.getFullYear() + "-" + d.getMonth(), nome: MESI[d.getMonth()], anno: d.getFullYear(),
        eventi: eventi.filter(e => e.d.getFullYear() === d.getFullYear() && e.d.getMonth() === d.getMonth()) });
    }

    box.innerHTML = mesi.map(m => `<div class="cal-month" data-mese="${m.key}">
        <h3 class="cal-month-title">${m.nome} <span>${m.anno}</span></h3>
        ${m.eventi.length ? m.eventi.map(card).join("")
          : `<p class="cal-empty">Date in arrivo. <a href="${wa(`Ciao Kalyta, vorrei sapere le prossime date di ${m.nome.toLowerCase()}.`)}" target="_blank" rel="noopener">Chiedici su WhatsApp →</a></p>`}
      </div>`).join("");

    if (filtri) {
      filtri.innerHTML = `<button type="button" aria-pressed="true" data-mese="tutti">Tutti</button>` +
        mesi.map(m => `<button type="button" aria-pressed="false" data-mese="${m.key}">${m.nome.slice(0, 3)}</button>`).join("");
    }
  }

  if (filtri) {
    filtri.addEventListener("click", ev => {
      const b = ev.target.closest("button"); if (!b) return;
      filtri.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
      box.querySelectorAll(".cal-month").forEach(el => { el.hidden = b.dataset.mese !== "tutti" && el.dataset.mese !== b.dataset.mese; });
    });
  }

  box.innerHTML = '<p class="cal-empty">Carico le date…</p>';
  const url = `https://docs.google.com/spreadsheets/d/${FOGLIO_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(FOGLIO_SCHEDA)}&t=${Date.now()}`;
  fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(t => { if (/^\s*</.test(t)) throw new Error("foglio non condiviso"); mostra(daFoglio(t)); })
    .catch(() => mostra([]));
})();
