/* =====================================================================
   CALENDARIO KALYTA
   ---------------------------------------------------------------------
   Per aggiungere, modificare o togliere una data basta cambiare la lista
   EVENTI qui sotto. Ogni evento è tra { } e separato da una virgola.

   data        "AAAA-MM-GG"  (es. "2026-11-21")
   ora         testo libero, es. "17:00 – 19:30"
   titolo      nome del laboratorio o dell'incontro
   tipo        "Laboratorio", "Incontro", "Evento"...
   luogo       es. "STANZA · Isola di Capo Rizzuto"
   descrizione una o due frasi
   prezzo      facoltativo, es. "25 €"
   daConfermare true = mostra "Data da confermare" (togli quando è sicura)

   Le date già passate spariscono da sole. Il calendario mostra i mesi da
   quello in corso fino a FINE_CALENDARIO.
   ===================================================================== */

const FINE_CALENDARIO = "2027-03-31";
const WHATSAPP = "393501795131";

const EVENTI = [
  // Inserisci qui le date vere. Esempio (togli le due barre // per attivarlo):
  // { data: "2026-11-21", ora: "17:00 – 19:30", titolo: "Pittura creativa", tipo: "Laboratorio", luogo: "STANZA · Isola di Capo Rizzuto", descrizione: "Colori, tele e un tavolo condiviso. Non serve saper dipingere.", prezzo: "25 €" },
];

/* --------- da qui in giù non serve modificare nulla --------- */
(function () {
  const box = document.querySelector(".cal-months");
  const filtri = document.querySelector(".cal-filters");
  if (!box) return;

  const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
  const GIORNI = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const oggi = new Date(); oggi.setHours(0, 0, 0, 0);
  const fine = parse(FINE_CALENDARIO);

  const eventi = EVENTI.map(e => ({ ...e, d: parse(e.data) }))
    .filter(e => e.d >= oggi && e.d <= fine)
    .sort((a, b) => a.d - b.d);

  const mesi = [];
  for (let d = new Date(oggi.getFullYear(), oggi.getMonth(), 1); d <= fine; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    mesi.push({ key: d.getFullYear() + "-" + d.getMonth(), nome: MESI[d.getMonth()], anno: d.getFullYear(),
      eventi: eventi.filter(e => e.d.getFullYear() === d.getFullYear() && e.d.getMonth() === d.getMonth()) });
  }

  const card = e => {
    const msg = `Ciao Kalyta, vorrei prenotare un posto per "${e.titolo}" del ${e.d.getDate()} ${MESI[e.d.getMonth()].toLowerCase()} ${e.d.getFullYear()}.`;
    return `<article class="cal-event">
      <div class="cal-date"><span>${GIORNI[e.d.getDay()]}</span><strong>${e.d.getDate()}</strong></div>
      <div class="cal-body">
        <p class="cal-meta">${esc(e.tipo)}${e.ora ? " · " + esc(e.ora) : ""}${e.daConfermare ? ' <em>Data da confermare</em>' : ""}</p>
        <h3>${esc(e.titolo)}</h3>
        ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ""}
        <p class="cal-place">${esc(e.luogo)}${e.prezzo ? " · " + esc(e.prezzo) : ""}</p>
      </div>
      <a class="cal-book" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Prenota →</a>
    </article>`;
  };

  box.innerHTML = mesi.map(m => `<div class="cal-month" data-mese="${m.key}">
      <h3 class="cal-month-title">${m.nome} <span>${m.anno}</span></h3>
      ${m.eventi.length ? m.eventi.map(card).join("") : `<p class="cal-empty">Date in arrivo. <a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Ciao Kalyta, vorrei sapere le prossime date di " + m.nome.toLowerCase() + ".")}" target="_blank" rel="noopener">Chiedici su WhatsApp →</a></p>`}
    </div>`).join("");

  if (filtri) {
    filtri.innerHTML = `<button type="button" aria-pressed="true" data-mese="tutti">Tutti</button>` +
      mesi.map(m => `<button type="button" aria-pressed="false" data-mese="${m.key}">${m.nome.slice(0, 3)}</button>`).join("");
    filtri.addEventListener("click", ev => {
      const b = ev.target.closest("button"); if (!b) return;
      filtri.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
      box.querySelectorAll(".cal-month").forEach(el => { el.hidden = b.dataset.mese !== "tutti" && el.dataset.mese !== b.dataset.mese; });
    });
  }
})();
