# Kalyta · memoria del progetto

Sito di Kalyta APS (associazione di promozione sociale, Isola di Capo Rizzuto, KR): **kalyta.it**.
Chi chiede le modifiche è Miriam Elia, vicepresidente. Scrive in italiano, spesso dal telefono e con
refusi: interpreta il senso. Rispondi sempre in italiano semplice, senza gergo tecnico.

## Regole di lavoro

- **Anteprima prima di pubblicare.** Prima di aprire una PR manda le schermate (computer e telefono)
  di quello che cambia e aspetta l'ok. Niente va online finché Miriam non unisce la PR.
- Lavora sul ramo indicato dalla sessione; una PR per lavoro, descrizione in italiano.
- Dopo il merge controlla che il workflow "Pubblica su IONOS" sia verde e avvisa che è online.
  Da qui kalyta.it non è raggiungibile: chiedi a Miriam di controllare dal suo telefono.
- **Home leggera**: non aggiungere sezioni alla home. Le cose nuove vanno su una pagina loro,
  con al massimo un link in "Come partecipare" o nel footer.
- Prova le modifiche in locale (`python3 -m http.server 8765` + Playwright, già installato)
  e salva le schermate nella scratchpad, **mai** nella cartella del repository.

## Tono e contenuti

- Siamo un'associazione, **non un'attività commerciale**: "contributo", non "prezzo";
  niente toni da vendita.
- Niente testi "da AI": niente numerazioni tipo 01/02, niente frasi da slide ("creare valore",
  "connessioni autentiche"), niente retorica del Sud. Si parte da una scena concreta.
- STANZA è in via degli Apostoli 16, nel centro storico di Isola di Capo Rizzuto.
- Foto: solo belle, ben ritagliate, con proporzioni fisse. **Niente foto con il cane di Miriam.**
- Non pubblicare dati personali della presidente o di altre persone.

## Come funziona il sito

- HTML/CSS/JS statico. Pagine: `index.html`, `calendario/`, `private/` (Kalyta Private),
  `card/` (Kalyta Card, solo in PDF), `fuori-stanza/` (laboratori portati fuori), `privacy/`, `condizioni/`.
- **Pubblicazione**: `.github/workflows/pubblica-ionos.yml` carica via SFTP su IONOS a ogni push su
  `main`, con i secrets `IONOS_SFTP_HOST`, `IONOS_SFTP_USER`, `IONOS_SFTP_PASSWORD`, `IONOS_SFTP_DIR`.
  La password non va mai scritta in chat. **Ogni nuova pagina va aggiunta** alle righe `cp -r` e `sed`
  del workflow e a `sitemap.xml`. Solo i file elencati nel workflow vanno online.
- `?v=dev` nei link a CSS/JS viene sostituito dal workflow per evitare la cache.
- Le immagini del sito sono in `assets/`, loghi e favicon in `assets-private/`.

## Calendario e iscrizioni

- **Foglio del calendario (pubblico)**: ID `1A3DCUmEcTDuTHzE7fJcJXE7HCyW6LBi5Nr761ld12ps`, scheda `Date`.
  Colonne: Data, Orario, Titolo, Tipo, Luogo, Descrizione, Contributo, Stato, Durata, Cosa include,
  Link modulo, Accesso, Posti, Iscritti (automatico). `calendario.js` lo legge come CSV.
  - Stato: Aperto, Ultimi posti, Completo, Bozza (Bozza non si vede).
  - Contributo: "0" = Gratuito; vuoto con Accesso "Soci Kalyta" = "Gratuito per i soci".
  - Con "Posti" compilato il sito mette da solo "Ultimi posti" e "Posti esauriti".
  - Il foglio è in italiano: nelle formule si usa `;` come separatore.
- **Foglio "Iscrizioni Kalyta" (PRIVATO, dati personali: non renderlo mai pubblico)**:
  ID `12ll64yZoTivYItmvFnnmkRdm5jNpQeijKWYDQJ8WDvE`, schede Iscrizioni, Riepilogo, Per data.
  - Le iscrizioni dal sito arrivano tramite Apps Script (URL in `REGISTRO_ISCRIZIONI` in `calendario.js`),
    inviate con `fetch` e `credentials: "omit"`. Con i cookie Google, Apps Script risponde 401.
  - Le formule automatiche (Totale, Codice, Controllo doppioni, Codice/Persone per il sito) stanno
    **nella riga dei titoli**, così cancellare righe non le rompe.
- **Iscrizione dal sito**: prima WhatsApp (+39 350 179 5131), poi registrazione automatica nel foglio.
  Email obbligatoria, casella delle condizioni obbligatoria, nomi degli accompagnatori obbligatori
  se le persone sono più di una.
- Condizioni: disdetta fino a 24 ore prima con restituzione; dopo, nessuna restituzione;
  se annulla Kalyta, restituzione completa.
- Portale soci (tesseramento): https://portalesoci.it/iscrizioni-associazione-smart/kalyta-aps/

## Drive

- Materiali Fuori STANZA (schede laboratori, accordo standard tra associazioni): cartella
  "Kalyta Fuori STANZA" in DOCUMENTI COSTITUTIVI + MODULISTICA.
- Foto: cartella "FOTO STANZA _laboratori/EVENTI" e cartelle per evento.

## In sospeso (aggiornare quando cambia)

- Foglio calendario, cella P1 della scheda `Date`: Miriam deve cliccare "Consenti accesso" per
  collegare il conteggio degli iscritti; poi compilare la colonna Posti. Dopo si può cancellare P1.
- Gin Lab (26/11): Contributo "Accesso Libero" ma Accesso "Soci Kalyta": da chiarire.
- Foto di Petronà e di "Mani in pasta" da aggiungere a `fuori-stanza/` quando arrivano.
- Convenzione parapendio (10% di sconto ai soci): in pausa, mancano nome, condizioni e durata.
- Idee future: Kalyta come realtà calabrese con STANZA come prima sede, rete di spazi amici,
  ramo commerciale separato dall'APS (da definire con il commercialista).
