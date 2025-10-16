# ERP MallFarm - Versione Locale

Sistema completo per la gestione della legna con architettura semplificata e storage locale.

## 🌟 Caratteristiche Principali

- **Architettura Semplice**: Un singolo file HTML con JavaScript vanilla
- **Storage Locale**: Tutti i dati salvati nel localStorage del browser
- **UI Moderna**: Design responsive con Bootstrap 5 e Font Awesome
- **PWA Ready**: Funziona offline e può essere installata come app
- **Mobile Friendly**: Ottimizzata per dispositivi mobili

## 📋 Funzionalità

### 🏠 Dashboard
- Panoramica statistiche in tempo reale
- Azioni rapide per operazioni comuni
- Monitoraggio stock prodotti con alert automatici
- Grafici e indicatori visivi

### 👥 Gestione Anagrafica
- **Clienti**: Anagrafica completa con dati di contatto
- **Fornitori**: Gestione fornitori con storico operazioni
- **Prodotti**: Catalogo prodotti con stock e prezzi

### 📦 Gestione Ordini
- Creazione ordini multi-articolo
- Gestione stati ordine (In attesa → Consegnato)
- Stampa e esportazione ordini
- Collegamento automatico con clienti

### 🏭 Gestione Magazzino
- Movimenti di carico/scarico
- Tracciamento stock in tempo reale
- Alert per stock sotto soglia
- Storico completo movimenti

### 🔥 Gestione Caldaie
- Monitoraggio temperature in tempo reale
- Controllo accensione/spegnimento caldaie
- Registro carichi combustibile
- Simulazione sensori IoT

## 🚀 Installazione e Uso

### Requisiti
- Browser web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript abilitato

### Avvio Rapido
1. Apri il file `index.html` nel browser
2. L'applicazione si avvia automaticamente con dati demo
3. Inizia a utilizzare le funzionalità

### Primo Utilizzo
L'app viene inizializzata con dati demo:
- 2 Clienti di esempio
- 2 Fornitori di esempio  
- 3 Prodotti di esempio
- Simulazione temperature caldaie

## 📱 Funzionalità Mobile

- **Design Responsive**: Si adatta a qualsiasi schermo
- **Touch Friendly**: Bottoni e controlli ottimizzati per touch
- **Offline**: Funziona senza connessione internet
- **Installabile**: Può essere aggiunta alla home screen

## 💾 Gestione Dati

### Storage Automatico
Tutti i dati vengono salvati automaticamente nel localStorage:
- `erp_mallfarm_customers` - Clienti
- `erp_mallfarm_suppliers` - Fornitori
- `erp_mallfarm_products` - Prodotti
- `erp_mallfarm_orders` - Ordini
- `erp_mallfarm_inventory` - Movimenti magazzino
- `erp_mallfarm_boilerLoads` - Carichi caldaie
- `erp_mallfarm_boilerStatus` - Stato caldaie

### Backup e Ripristino
- **Esporta Dati**: Scarica backup completo in formato JSON
- **Importa Dati**: Ripristina dati da file di backup
- **Reset Dati**: Cancella tutti i dati e reinizializza

### Esportazione
Ogni sezione permette di esportare i dati in formato CSV per Excel.

## 🛠️ Struttura File

```
ERP_MallFarm/
├── index.html          # File principale dell'applicazione
└── js/                  # Moduli JavaScript
    ├── customers.js     # Gestione clienti
    ├── suppliers.js     # Gestione fornitori
    ├── products.js      # Gestione prodotti
    ├── orders.js        # Gestione ordini
    ├── inventory.js     # Gestione magazzino
    └── boiler.js        # Gestione caldaie
```

## 🎨 Personalizzazione

### Colori Tema
Modifica le variabili CSS in `index.html`:
```css
:root {
    --primary-color: #2d5a27;    /* Verde principale */
    --secondary-color: #4a7c59;  /* Verde secondario */
    --accent-color: #8bc34a;     /* Verde accento */
}
```

### Configurazione Iniziale
Modifica la funzione `initializeDefaultData()` per personalizzare i dati demo.

## 📊 Funzionalità Avanzate

### Stock Management
- **Alert Automatici**: Notifiche per stock sotto soglia
- **Calcolo Automatico**: Stock aggiornato automaticamente con movimenti
- **Categorizzazione**: Prodotti organizzati per categoria

### Sistema Caldaie
- **Simulazione IoT**: Temperature simulate in tempo reale
- **Controllo Remoto**: Accensione/spegnimento caldaie
- **Monitoraggio**: Pressione e temperatura esterna

### Reporting
- **Stampa**: Funzioni di stampa integrate per ogni sezione
- **Esportazione**: Export CSV per analisi esterne
- **Storico**: Tracciamento completo di tutte le operazioni

## 🔒 Sicurezza e Privacy

- **Dati Locali**: Tutti i dati rimangono nel browser dell'utente
- **No Server**: Nessun dato inviato a server esterni
- **Privacy**: Controllo completo sui propri dati

## 🆘 Supporto

### Problemi Comuni

**App non si carica:**
- Verifica che JavaScript sia abilitato
- Prova in modalità incognito
- Svuota cache del browser

**Dati persi:**
- I dati sono salvati nel localStorage del browser
- Non cancellare i dati del sito
- Fai backup regolari tramite "Esporta Dati"

**Performance lente:**
- Troppi dati in localStorage
- Usa "Reset Dati" per ricominciare
- Considera l'export/import per gestire grandi quantità di dati

### Reset Completo
Per un reset completo:
1. Apri Developer Tools (F12)
2. Vai su Application > Local Storage
3. Cancella tutti i dati con prefisso `erp_mallfarm_`
4. Ricarica la pagina

## 🚀 Prossimi Sviluppi

- [ ] Grafici e analytics avanzate
- [ ] Notifiche push per alert stock
- [ ] Sincronizzazione cloud opzionale
- [ ] API per integrazione esterna
- [ ] Gestione multi-utente
- [ ] Fatturazione elettronica

## 📄 Licenza

Progetto open source per uso interno aziendale.

---

**ERP MallFarm** - Sistema di gestione legna semplice ed efficace