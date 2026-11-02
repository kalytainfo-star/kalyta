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
const WHATSAPP = "393501795131";
// Registra ogni iscrizione inviata dal sito nel foglio privato "Iscrizioni Kalyta" (Apps Script).
// Lascia vuoto per disattivare.
const REGISTRO_ISCRIZIONI = "https://script.google.com/macros/s/AKfycbwknJAUdUPyDccH_dDPcWli2azkx19SphklS9JbY6cmnWtVGXOGyQpFWNEOnsuqAQbs/exec";

// Date di riserva: il sito le usa solo se non riesce a leggere il Foglio Google.
const RISERVA = [
  ["05/11/2026", "21:00", "Candele", "Laboratorio", "Con Marea Creativa realizzeremo una candela artigianale, seguendo passo dopo passo il processo di creazione."],
  ["07/11/2026", "18:30", "Restanza", "Incontro", "Un aperitivo e un tavolo aperto per parlare con chi è rimasto, di chi è tornato e di chi ha scelto di arrivare, qui. Parleremo di ciò che ci piace del nostro territorio, di quello che manca e di cosa potremmo fare insieme."],
  ["12/11/2026", "20:30", "Cucito creativo", "Laboratorio", "Con Ilaria realizzeremo una tote bag, lavorando direttamente con le macchine da cucire.", "https://docs.google.com/forms/d/1epAdhOHV6hgz3NDvSNzQV7r0HLy9MPDDQ5l02hsd-gQ/viewform"],
  ["19/11/2026", "21:00", "Gioielli", "Laboratorio", "Con Vincenza ci dedicheremo alla creazione di un gioiello fatto a mano."],
  ["26/11/2026", "21:00", "Gin Lab", "Laboratorio", "Insieme all'Opificio Artigianale degli Spiriti seguiremo dal vivo la nascita del gin di Kalyta. Conosceremo le botaniche, scopriremo il processo di distillazione e parteciperemo alla scelta degli ingredienti."],
  ["28/11/2026", "21:00", "Pittura creativa", "Evento", "Un evento speciale con Alice. Composizione collettiva."],
];

(function () {
  const box = document.querySelector(".cal-months");
  const filtri = document.querySelector(".cal-filters");
  const compatto = document.querySelector(".cal-compact");
  if (!box && !compatto && !document.getElementById("prossimo")) return;

  const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const GIORNI = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
  const GIORNI_LUNGHI = ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
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

  // "30" -> "30 €", "0" -> "Gratuito", vuoto per i soci -> "Gratuito per i soci"
  function contributo(v, accesso) {
    v = String(v || "").trim();
    const soci = /soci/i.test(accesso || "");
    if (/^0+([.,]0+)?$/.test(v) || (!v && soci)) return soci ? "Gratuito per i soci" : "Gratuito";
    if (/^\d+([.,]\d+)?$/.test(v)) return v + " €";
    return v;
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
      prezzo: contributo(prendi(r, "contributo") || prendi(r, "prezzo"), prendi(r, "accesso")),
      soci: /soci/i.test(prendi(r, "accesso")),
      stato: prendi(r, "stato").toLowerCase(),
      durata: prendi(r, "durata"),
      include: prendi(r, "cosa include"),
      modulo: /^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//.test(prendi(r, "link modulo")) ? prendi(r, "link modulo") : "",
    })).filter(e => e.d && e.titolo && e.stato !== "bozza");
  }

  const quandoTesto = e => `${GIORNI_LUNGHI[e.d.getDay()]} ${e.d.getDate()} ${MESI[e.d.getMonth()].toLowerCase()}${e.ora ? ", ore " + e.ora : ""}`;

  function ics(e) {
    const p = n => String(n).padStart(2, "0");
    const m = (e.ora || "").match(/(\d{1,2})[:.](\d{2})/);
    const y = e.d.getFullYear(), mo = p(e.d.getMonth() + 1), g = p(e.d.getDate());
    let inizio, fine;
    if (m) { const h = +m[1]; inizio = `DTSTART:${y}${mo}${g}T${p(h)}${m[2]}00`; fine = `DTEND:${y}${mo}${g}T${p(Math.min(h + 2, 23))}${m[2]}00`; }
    else { inizio = `DTSTART;VALUE=DATE:${y}${mo}${g}`; fine = ""; }
    const pulisci = s => String(s || "").replace(/[\\,;]/g, x => "\\" + x).replace(/\n/g, " ");
    const testo = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kalyta//Calendario//IT","BEGIN:VEVENT",
      `UID:${y}${mo}${g}-${encodeURIComponent(e.titolo)}@kalyta.it`, inizio, fine,
      `SUMMARY:${pulisci("Kalyta · " + e.titolo)}`, `DESCRIPTION:${pulisci(e.descrizione)}`,
      e.luogo ? `LOCATION:${pulisci(e.luogo)}` : "", "END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(testo);
  }

  function card(e, i) {
    const quando = `${e.d.getDate()} ${MESI[e.d.getMonth()].toLowerCase()} ${e.d.getFullYear()}`;
    const completo = e.stato === "completo";
    const badge = completo ? '<em class="cal-tag cal-tag-full">Posti esauriti</em>'
      : e.stato === "ultimi posti" ? '<em class="cal-tag">Ultimi posti</em>' : "";
    const azione = completo
      ? `<a class="cal-book cal-book-full" href="${wa(`Ciao Kalyta, "${e.titolo}" del ${quando} è al completo: potete avvisarmi per la prossima data?`)}" target="_blank" rel="noopener">Avvisami →</a>`
      : `<a class="cal-book" data-evento="${i}" href="${wa(`Ciao Kalyta, vorrei partecipare a "${e.titolo}" del ${quando}.`)}" target="_blank" rel="noopener">Scopri e iscriviti →</a>`;
    return `<article class="cal-event ${classeTipo(e.tipo)}${completo ? " is-full" : ""}">
      ${dataTile(e)}
      <div class="cal-body">
        <p class="cal-meta">${esc(e.tipo || "Laboratorio")}${e.ora ? " · " + esc(e.ora) : ""} ${badge}${e.soci ? '<em class="cal-tag cal-tag-soci">Soci Kalyta</em>' : ""}</p>
        <h3>${esc(e.titolo)}</h3>
        ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ""}
        ${e.luogo || e.durata ? `<p class="cal-place">${esc([e.luogo, e.durata].filter(Boolean).join(" · "))}</p>` : ""}
        ${e.prezzo ? `<p class="cal-price"><span class="cal-pill">${esc(e.prezzo)}</span>${e.include ? ` <span>${esc(e.include)}</span>` : ""}</p>` : ""}
        <a class="cal-ics" href="${ics(e)}" download="kalyta-${e.d.getFullYear()}${String(e.d.getMonth() + 1).padStart(2, "0")}${String(e.d.getDate()).padStart(2, "0")}.ics">+ Aggiungi al mio calendario</a>
      </div>
      <div class="cal-actions">${azione}</div>
    </article>`;
  }

  // Finestra di prenotazione: nome e numero di persone, poi WhatsApp. Nessun dato resta sul sito.
  let attuali = [];
  const dlg = document.createElement("dialog");
  dlg.className = "book-dialog";
  dlg.innerHTML = `<div class="book-form">
      <button type="button" class="book-close" aria-label="Chiudi">×</button>
      <p class="section-label book-kind"></p>
      <h3 class="book-title"></h3>
      <p class="book-when"></p>
      <div class="book-details"></div>
      <form class="book-wa">
        <p class="book-step">Per iscriverti</p>
        <label>Nome<input name="nome" required autocomplete="name" placeholder="Il tuo nome"></label>
        <label>Quante persone?<input name="persone" type="number" min="1" max="20" value="1" required inputmode="numeric"></label>
        <label>Note <span>(facoltative)</span><input name="note" placeholder="Es. prima volta, porto un'amica…"></label>
        <input name="sito_web" tabindex="-1" autocomplete="off" aria-hidden="true" class="book-hp">
        <button type="submit" class="book-send">Invia su WhatsApp →</button>
        <p class="book-info">Si apre WhatsApp con il messaggio già scritto: lo invii tu. Ti confermiamo la partecipazione in chat.</p>
        ${REGISTRO_ISCRIZIONI ? '<p class="book-info book-privacy">Nome, numero di persone e note vengono registrati da Kalyta APS solo per organizzare l\'appuntamento. <a href="/privacy/">Privacy</a></p>' : ""}
      </form>
      <div class="book-form-link">
        <a class="book-send" target="_blank" rel="noopener">Compila il modulo di iscrizione →</a>
        <a class="book-ask" target="_blank" rel="noopener">Hai una domanda? Scrivici su WhatsApp</a>
      </div>
    </div>`;
  if (typeof dlg.showModal === "function") document.body.appendChild(dlg);
  let scelto = null;
  dlg.querySelector(".book-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", ev => { if (ev.target === dlg) dlg.close(); });
  // Invio silenzioso al foglio: non blocca mai WhatsApp, anche se fallisce.
  function registra(dati) {
    if (!REGISTRO_ISCRIZIONI) return;
    try {
      const corpo = new URLSearchParams(dati);
      // Senza cookie: con l'accesso a Google attivo nel browser, Apps Script rifiuterebbe la richiesta.
      fetch(REGISTRO_ISCRIZIONI, { method: "POST", mode: "no-cors", credentials: "omit", body: corpo, keepalive: true }).catch(() => {});
    } catch (_) {}
  }

  dlg.querySelector(".book-wa").addEventListener("submit", ev => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    if (!scelto) return;
    const righe = [`Ciao Kalyta, vorrei iscrivermi a "${scelto.titolo}" (${quandoTesto(scelto)}).`, "",
      `Nome: ${f.get("nome")}`, `Persone: ${f.get("persone")}`];
    if (String(f.get("note") || "").trim()) righe.push(`Note: ${f.get("note")}`);
    registra({
      data: `${scelto.d.getFullYear()}-${String(scelto.d.getMonth() + 1).padStart(2, "0")}-${String(scelto.d.getDate()).padStart(2, "0")}`,
      laboratorio: scelto.titolo, nome: f.get("nome"), persone: f.get("persone"), note: f.get("note") || "", sito_web: f.get("sito_web") || ""
    });
    const url = wa(righe.join("\n"));
    const w = window.open(url, "_blank"); if (w) w.opener = null; else location.href = url;
    dlg.close();
  });
  document.addEventListener("click", ev => {
    const a = ev.target.closest("a[data-evento]");
    if (!a || !dlg.isConnected) return;
    const e = attuali[+a.dataset.evento]; if (!e) return;
    ev.preventDefault();
    scelto = e;
    dlg.querySelector(".book-kind").textContent = (e.tipo || "Laboratorio").toUpperCase();
    dlg.querySelector(".book-title").textContent = e.titolo;
    dlg.querySelector(".book-when").textContent = quandoTesto(e).replace(/^./, s => s.toUpperCase());
    const righe = [
      e.descrizione && `<p class="book-desc">${esc(e.descrizione)}</p>`,
      `<dl>`,
      e.prezzo && `<div><dt>Contributo</dt><dd><strong>${esc(e.prezzo)}</strong></dd></div>`,
      e.include && `<div><dt>Include</dt><dd>${esc(e.include)}</dd></div>`,
      e.durata && `<div><dt>Durata</dt><dd>${esc(e.durata)}</dd></div>`,
      e.luogo && `<div><dt>Dove</dt><dd>${esc(e.luogo)}</dd></div>`,
      e.soci && `<div><dt>Per chi</dt><dd>Riservato ai soci Kalyta. Non sei ancora socio? <a href="${wa("Ciao Kalyta, come posso diventare socio?")}" target="_blank" rel="noopener">Chiedici come associarti</a></dd></div>`,
      e.stato === "ultimi posti" && `<div><dt>Posti</dt><dd>Ultimi posti disponibili</dd></div>`,
      `</dl>`];
    dlg.querySelector(".book-details").innerHTML = righe.filter(Boolean).join("");
    const conModulo = !!e.modulo;
    dlg.querySelector(".book-wa").hidden = conModulo;
    dlg.querySelector(".book-form-link").hidden = !conModulo;
    if (conModulo) {
      dlg.querySelector(".book-form-link .book-send").href = e.modulo;
      dlg.querySelector(".book-ask").href = wa(`Ciao Kalyta, ho una domanda su "${e.titolo}" del ${quandoTesto(e)}.`);
    }
    dlg.showModal();
    dlg.querySelector(".book-form").scrollTop = 0;
    (conModulo ? dlg.querySelector(".book-form-link .book-send") : dlg.querySelector("input[name=nome]")).focus({ preventScroll: true });
  });


  function prossimo(eventi) {
    const box = document.getElementById("prossimo");
    if (!box) return;
    const i = eventi.findIndex(e => e.stato !== "completo");
    if (i < 0) { box.hidden = true; return; }
    const e = eventi[i];
    box.innerHTML = `<p class="section-label">PROSSIMO APPUNTAMENTO</p>
      <p class="next-what"><strong>${esc(e.titolo)}</strong> <span>${esc(quandoTesto(e))}</span></p>
      <div class="next-links"><a class="cal-book" data-evento="${i}" href="${wa(`Ciao Kalyta, vorrei partecipare a "${e.titolo}".`)}" target="_blank" rel="noopener">Iscriviti →</a><a href="${document.querySelector(".cal-months") ? "#calendario" : "calendario/"}" class="next-all">Tutte le date</a></div>`;
    box.hidden = false;
  }

  const classeTipo = t => ({ incontro: "t-incontro", evento: "t-evento" }[String(t || "").toLowerCase()] || "t-lab");
  const MESI_BREVI = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
  const dataTile = e => `<div class="cal-date"><span class="cal-date-m">${MESI_BREVI[e.d.getMonth()]}</span><strong>${e.d.getDate()}</strong><span>${GIORNI[e.d.getDay()]}</span></div>`;

  function riga(e, i) {
    const completo = e.stato === "completo";
    const info = [e.ora && "ore " + e.ora, e.durata].filter(Boolean).map(esc).join(" · ");
    const tag = completo ? '<em class="cal-tag cal-tag-full">Posti esauriti</em>' : e.stato === "ultimi posti" ? '<em class="cal-tag">Ultimi posti</em>' : "";
    return `<article class="cal-card ${classeTipo(e.tipo)}${completo ? " is-full" : ""}">
      ${dataTile(e)}
      <div class="cal-card-body">
        <p class="cal-kind">${esc(e.tipo || "Laboratorio")} ${tag}${e.soci ? '<em class="cal-tag cal-tag-soci">Soci Kalyta</em>' : ""}</p>
        <h3>${esc(e.titolo)}</h3>
        ${info ? `<p class="cal-card-info">${info}</p>` : ""}
      </div>
      <div class="cal-card-foot">
        ${e.prezzo ? `<span class="cal-pill">${esc(e.prezzo)}</span>` : "<span></span>"}
        ${completo ? "" : `<a class="cal-book" data-evento="${i}" href="${wa(`Ciao Kalyta, vorrei partecipare a "${e.titolo}".`)}" target="_blank" rel="noopener">Scopri e iscriviti →</a>`}
      </div>
    </article>`;
  }

  function mostra(tutti) {
    const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
    const eventi = tutti.filter(e => e.d >= oggi).sort((a, b) => a.d - b.d);
    attuali = eventi;
    prossimo(eventi);

    // Home: solo le prossime date, in formato compatto
    if (compatto) {
      const N = +compatto.dataset.quante || 4;
      compatto.innerHTML = eventi.length
        ? eventi.slice(0, N).map((e, i) => riga(e, i)).join("")
        : `<p class="cal-empty">Nuove date in arrivo. <a href="${wa("Ciao Kalyta, vorrei sapere le prossime date.")}" target="_blank" rel="noopener">Chiedici su WhatsApp →</a></p>`;
    }

    // Pagina Calendario: tutti i mesi che hanno date
    if (!box) return;
    const mesi = [];
    eventi.forEach(e => {
      const key = e.d.getFullYear() + "-" + e.d.getMonth();
      let m = mesi.find(x => x.key === key);
      if (!m) mesi.push(m = { key, nome: MESI[e.d.getMonth()], anno: e.d.getFullYear(), eventi: [] });
      m.eventi.push(e);
    });

    box.innerHTML = mesi.map(m => `<div class="cal-month" data-mese="${m.key}">
        <h3 class="cal-month-title">${m.nome} <span>${m.anno}</span></h3>
        ${m.eventi.map(e => card(e, eventi.indexOf(e))).join("")}
      </div>`).join("") +
      `<p class="cal-more">Altre date in arrivo. Seguici su <a href="https://www.instagram.com/kalyta.official_/">Instagram</a> o <a href="${wa("Ciao Kalyta, vorrei sapere quando ci sono nuove date.")}" target="_blank" rel="noopener">scrivici su WhatsApp</a> per saperlo prima.</p>`;

    if (filtri) {
      filtri.hidden = mesi.length < 2;
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

  [box, compatto].forEach(el => { if (el) el.innerHTML = '<p class="cal-empty">Carico le date…</p>'; });
  const url = `https://docs.google.com/spreadsheets/d/${FOGLIO_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(FOGLIO_SCHEDA)}&t=${Date.now()}`;
  fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(t => { if (/^\s*</.test(t)) throw new Error("foglio non condiviso"); mostra(daFoglio(t)); })
    .catch(() => mostra(RISERVA.map(r => ({ d: leggiData(r[0]), ora: r[1], titolo: r[2], tipo: r[3], descrizione: r[4], luogo: "", prezzo: "", stato: "aperto", soci: false, modulo: r[5] || "" }))));
})();
