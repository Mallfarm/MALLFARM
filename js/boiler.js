// Boiler Management - Sistema Avanzato con Anagrafica
function loadBoilerPage(container) {
    // Initialize boiler data if not exists
    initializeBoilerData();
    
    container.innerHTML = createBoilerPageHTML();
    
    // Load data
    renderBoilersList();
    renderLoadsList();
    renderBoilerDashboard();
    updateBoilerStats();
}

function createBoilerPageHTML() {
    return `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-fire"></i> Gestione Caldaie</h2>
                        <p class="text-muted">Anagrafica caldaie, caricamenti e dashboard contabile</p>
                    </div>
                    <div>
                        <button class="btn btn-primary" onclick="openBoilerModal()">
                            <i class="fas fa-plus"></i> Nuova Caldaia
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card success">
                    <div class="card-body text-center">
                        <i class="fas fa-fire fa-2x mb-2"></i>
                        <h3 id="total-boilers">0</h3>
                        <p class="mb-0">Caldaie Attive</p>
                        <small class="opacity-75">Registrate</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card info">
                    <div class="card-body text-center">
                        <i class="fas fa-truck-loading fa-2x mb-2"></i>
                        <h3 id="total-loads">0</h3>
                        <p class="mb-0">Caricamenti</p>
                        <small class="opacity-75">Questo mese</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card warning">
                    <div class="card-body text-center">
                        <i class="fas fa-euro-sign fa-2x mb-2"></i>
                        <h3 id="total-revenue">€0</h3>
                        <p class="mb-0">Fatturato</p>
                        <small class="opacity-75">Questo mese</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card danger">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-2x mb-2"></i>
                        <h3 id="avg-per-load">€15</h3>
                        <p class="mb-0">Per Carico</p>
                        <small class="opacity-75">Prezzo fisso</small>
                    </div>
                </div>
            </div>
        </div>

        <ul class="nav nav-tabs mb-4" id="boilerTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="registry-tab" data-bs-toggle="tab" data-bs-target="#registry" type="button" role="tab">
                    <i class="fas fa-list"></i> Anagrafica Caldaie
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="loads-tab" data-bs-toggle="tab" data-bs-target="#loads" type="button" role="tab">
                    <i class="fas fa-truck"></i> Caricamenti
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                    <i class="fas fa-chart-bar"></i> Dashboard
                </button>
            </li>
        </ul>

        <div class="tab-content" id="boilerTabContent">
            <div class="tab-pane fade show active" id="registry" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-fire"></i> Registro Caldaie</h5>
                        <div>
                            <input type="text" class="form-control form-control-sm d-inline-block" style="width: 200px;" 
                                   placeholder="Cerca caldaia..." id="search-boilers" onkeyup="filterBoilers()">
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="boilers-list"></div>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="loads" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-truck"></i> Gestione Caricamenti</h5>
                        <div>
                            <button class="btn btn-warning btn-sm me-2" onclick="openImportDataModal()">
                                <i class="fas fa-file-import"></i> Importa Dati
                            </button>
                            <button class="btn btn-success btn-sm me-2" onclick="openBulkLoadModal()">
                                <i class="fas fa-layer-group"></i> Caricamenti Multipli
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="openLoadModal()">
                                <i class="fas fa-plus"></i> Nuovo Caricamento
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="loads-list"></div>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="dashboard" role="tabpanel">
                <div id="boiler-dashboard"></div>
            </div>
        </div>
    `;
}

function initializeBoilerData() {
    if (!app.data.boilers) {
        app.data.boilers = [];
    }
    if (!app.data.boilerLoads) {
        app.data.boilerLoads = [];
    }
    
    // Migration: ensure all existing loads have amount set to 15 and status defined
    app.data.boilerLoads.forEach(load => {
        if (load.amount === undefined || load.amount === null) {
            load.amount = 15;
        }
        if (!load.status) {
            load.status = 'completato';
        }
        if (!load.woodType) {
            load.woodType = 'pellet';
        }
        if (load.quantity === undefined || load.quantity === null) {
            load.quantity = 0;
        }
        if (!load.notes) {
            load.notes = '';
        }
    });
    
    // Save migrated data
    app.saveData();
}

function renderBoilersList() {
    const container = document.getElementById('boilers-list');
    if (!container) return;

    const boilers = app.data.boilers || [];
    
    if (boilers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-fire fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessuna caldaia registrata</h5>
                <p class="text-muted">Inizia registrando la prima caldaia nel sistema</p>
                <button class="btn btn-primary" onclick="openBoilerModal()">
                    <i class="fas fa-plus"></i> Registra Prima Caldaia
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead class="table-light"><tr>';
    html += '<th>Codice</th><th>Modello</th><th>Cliente</th><th>Ubicazione</th>';
    html += '<th>Stato</th><th>Ultima Manutenzione</th><th>Caricamenti</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    boilers.forEach(boiler => {
        const customer = app.data.customers.find(c => c.id === boiler.customerId);
        const customerName = customer ? customer.name : 'Cliente non trovato';
        const loads = app.data.boilerLoads.filter(l => l.boilerId === boiler.id);
        const totalLoads = loads.length;
        
        const statusClass = boiler.status === 'attiva' ? 'success' : 
                           boiler.status === 'manutenzione' ? 'warning' : 'danger';
        
        html += `<tr>
            <td><strong>${boiler.code}</strong></td>
            <td>${boiler.model}</td>
            <td><span class="badge bg-info">${customerName}</span></td>
            <td>${boiler.location}</td>
            <td><span class="badge bg-${statusClass}">${boiler.status.charAt(0).toUpperCase() + boiler.status.slice(1)}</span></td>
            <td>${new Date(boiler.lastMaintenance).toLocaleDateString('it-IT')}</td>
            <td><span class="badge bg-secondary">${totalLoads}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editBoiler('${boiler.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="addLoad('${boiler.id}')" title="Nuovo Caricamento">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteBoiler('${boiler.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function renderLoadsList() {
    const container = document.getElementById('loads-list');
    if (!container) return;

    const loads = app.data.boilerLoads || [];
    
    if (loads.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessun caricamento registrato</h5>
                <p class="text-muted">I caricamenti appariranno qui una volta inseriti</p>
            </div>
        `;
        return;
    }

    loads.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead class="table-light"><tr>';
    html += '<th>Data</th><th>Caldaia</th><th>Cliente</th><th>Tipo Legno</th>';
    html += '<th>Quantità</th><th>Importo</th><th>Stato</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    loads.forEach(load => {
        const boiler = app.data.boilers.find(b => b.id === load.boilerId);
        const customer = app.data.customers.find(c => c.id === (boiler ? boiler.customerId : null));
        const boilerCode = boiler ? boiler.code : 'N/A';
        const customerName = customer ? customer.name : 'N/A';
        
        // Handle undefined status with fallback
        const status = load.status || 'completato';
        const statusClass = status === 'completato' ? 'success' : 
                           status === 'in-corso' ? 'warning' : 'secondary';
        
        html += `<tr>
            <td>${new Date(load.date).toLocaleDateString('it-IT')}</td>
            <td><strong>${boilerCode}</strong></td>
            <td><span class="badge bg-info">${customerName}</span></td>
            <td>${load.woodType || 'N/A'}</td>
            <td>${load.quantity || 0} kg</td>
            <td><strong>€${(load.amount || 15).toFixed(2)}</strong></td>
            <td><span class="badge bg-${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editLoad('${load.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteLoad('${load.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function updateBoilerStats() {
    const boilers = app.data.boilers || [];
    const loads = app.data.boilerLoads || [];
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthLoads = loads.filter(load => {
        const loadDate = new Date(load.date);
        return loadDate.getMonth() === currentMonth && loadDate.getFullYear() === currentYear;
    });

    const totalBoilersElement = document.getElementById('total-boilers');
    const totalLoadsElement = document.getElementById('total-loads');
    const totalRevenueElement = document.getElementById('total-revenue');
    
    if (totalBoilersElement) totalBoilersElement.textContent = boilers.length;
    if (totalLoadsElement) totalLoadsElement.textContent = currentMonthLoads.length;
    
    if (totalRevenueElement) {
        const totalRevenue = currentMonthLoads.reduce((sum, load) => sum + (load.amount || 15), 0);
        totalRevenueElement.textContent = `€${totalRevenue.toFixed(2)}`;
    }
}

function openBoilerModal(boilerId = null) {
    const isEdit = boilerId !== null;
    const boiler = isEdit ? app.data.boilers.find(b => b.id === boilerId) : null;
    
    const customers = app.data.customers || [];
    let customerOptions = '<option value="">Seleziona Cliente</option>';
    customers.forEach(customer => {
        const selected = boiler && boiler.customerId === customer.id ? 'selected' : '';
        customerOptions += `<option value="${customer.id}" ${selected}>${customer.name}</option>`;
    });

    const modalHtml = `
        <div class="modal fade" id="boilerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-fire"></i> ${isEdit ? 'Modifica Caldaia' : 'Nuova Caldaia'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="boilerForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Codice Caldaia *</label>
                                    <input type="text" class="form-control" id="boilerCode" value="${boiler ? boiler.code : ''}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Modello *</label>
                                    <input type="text" class="form-control" id="boilerModel" value="${boiler ? boiler.model : ''}" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Cliente Associato *</label>
                                    <select class="form-select" id="boilerCustomer" required>
                                        ${customerOptions}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stato</label>
                                    <select class="form-select" id="boilerStatus">
                                        <option value="attiva" ${boiler && boiler.status === 'attiva' ? 'selected' : ''}>Attiva</option>
                                        <option value="manutenzione" ${boiler && boiler.status === 'manutenzione' ? 'selected' : ''}>In Manutenzione</option>
                                        <option value="dismessa" ${boiler && boiler.status === 'dismessa' ? 'selected' : ''}>Dismessa</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Ubicazione</label>
                                <input type="text" class="form-control" id="boilerLocation" value="${boiler ? boiler.location : ''}" placeholder="Indirizzo di installazione">
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Data Installazione</label>
                                    <input type="date" class="form-control" id="boilerInstallation" value="${boiler ? boiler.installationDate : ''}">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Ultima Manutenzione</label>
                                    <input type="date" class="form-control" id="boilerMaintenance" value="${boiler ? boiler.lastMaintenance : new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Note</label>
                                <textarea class="form-control" id="boilerNotes" rows="3" placeholder="Note aggiuntive...">${boiler ? boiler.notes : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveBoiler('${boilerId || ''}')">
                            <i class="fas fa-save"></i> ${isEdit ? 'Aggiorna' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('boilerModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('boilerModal'));
    modal.show();
}

function saveBoiler(boilerId) {
    const form = document.getElementById('boilerForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const boilerData = {
        id: boilerId || Date.now().toString(),
        code: document.getElementById('boilerCode').value,
        model: document.getElementById('boilerModel').value,
        customerId: document.getElementById('boilerCustomer').value,
        status: document.getElementById('boilerStatus').value,
        location: document.getElementById('boilerLocation').value,
        installationDate: document.getElementById('boilerInstallation').value,
        lastMaintenance: document.getElementById('boilerMaintenance').value,
        notes: document.getElementById('boilerNotes').value,
        createdAt: boilerId ? app.data.boilers.find(b => b.id === boilerId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (boilerId) {
        const index = app.data.boilers.findIndex(b => b.id === boilerId);
        app.data.boilers[index] = boilerData;
    } else {
        app.data.boilers.push(boilerData);
    }

    app.saveData();
    renderBoilersList();
    updateBoilerStats();

    const modal = bootstrap.Modal.getInstance(document.getElementById('boilerModal'));
    modal.hide();

    app.showToast(
        boilerId ? 'Caldaia aggiornata con successo!' : 'Caldaia registrata con successo!',
        'success'
    );
}

function openLoadModal(boilerId = null, loadId = null) {
    const isEdit = loadId !== null;
    const load = isEdit ? app.data.boilerLoads.find(l => l.id === loadId) : null;
    
    const boilers = app.data.boilers || [];
    let boilerOptions = '<option value="">Seleziona Caldaia</option>';
    
    // Se non è una modifica e non è stata specificata una caldaia, usa la prima disponibile come default
    const defaultBoilerId = !isEdit && !boilerId && boilers.length > 0 ? boilers[0].id : boilerId;
    
    boilers.forEach(boiler => {
        const customer = app.data.customers.find(c => c.id === boiler.customerId);
        const customerName = customer ? customer.name : 'N/A';
        const selected = (load && load.boilerId === boiler.id) || (!load && (boilerId === boiler.id || defaultBoilerId === boiler.id)) ? 'selected' : '';
        boilerOptions += `<option value="${boiler.id}" ${selected}>${boiler.code} - ${customerName}</option>`;
    });

    const modalHtml = `
        <div class="modal fade" id="loadModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-truck"></i> ${isEdit ? 'Modifica Caricamento' : 'Nuovo Caricamento'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loadForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Data Caricamento *</label>
                                    <input type="date" class="form-control" id="loadDate" value="${load ? load.date : new Date().toISOString().split('T')[0]}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Caldaia *</label>
                                    <select class="form-select" id="loadBoiler" required>
                                        ${boilerOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Tipo Legno</label>
                                    <select class="form-select" id="loadWoodType">
                                        <option value="pellet" ${load && load.woodType === 'pellet' ? 'selected' : ''}>Pellet</option>
                                        <option value="cippato" ${load && load.woodType === 'cippato' ? 'selected' : ''}>Cippato</option>
                                        <option value="legna" ${load && load.woodType === 'legna' ? 'selected' : (!load ? 'selected' : '')}>Legna</option>
                                        <option value="bricchetti" ${load && load.woodType === 'bricchetti' ? 'selected' : ''}>Bricchetti</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Quantità (kg)</label>
                                    <input type="number" class="form-control" id="loadQuantity" value="${load ? load.quantity : '60'}" min="1" step="1">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Importo Automatico</label>
                                    <div class="input-group">
                                        <span class="input-group-text">€</span>
                                        <input type="number" class="form-control" id="loadAmount" value="15" step="0.01" readonly>
                                        <span class="input-group-text">
                                            <i class="fas fa-info-circle" title="Importo fisso di €15 per caricamento"></i>
                                        </span>
                                    </div>
                                    <small class="text-muted">Importo fisso di €15 per ogni caricamento</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stato</label>
                                    <select class="form-select" id="loadStatus">
                                        <option value="programmato" ${load && load.status === 'programmato' ? 'selected' : (!load ? 'selected' : '')}>Programmato</option>
                                        <option value="in-corso" ${load && load.status === 'in-corso' ? 'selected' : ''}>In Corso</option>
                                        <option value="completato" ${load && load.status === 'completato' ? 'selected' : ''}>Completato</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Note</label>
                                <textarea class="form-control" id="loadNotes" rows="3" placeholder="Note sul caricamento...">${load ? load.notes : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveLoad(${loadId ? `'${loadId}'` : 'null'})">
                            <i class="fas fa-save"></i> ${isEdit ? 'Aggiorna' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('loadModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('loadModal'));
    modal.show();
}

function saveLoad(loadId = null) {
    const form = document.getElementById('loadForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Ensure boilerLoads array exists
    if (!app.data.boilerLoads) {
        app.data.boilerLoads = [];
    }

    // Validate required fields manually for better UX
    const dateValue = document.getElementById('loadDate').value;
    const boilerValue = document.getElementById('loadBoiler').value;
    
    if (!dateValue) {
        app.showToast('Data caricamento obbligatoria!', 'danger');
        return;
    }
    
    if (!boilerValue) {
        app.showToast('Seleziona una caldaia!', 'danger');
        return;
    }

    const loadData = {
        id: loadId || app.generateId(),
        date: dateValue,
        datetime: dateValue, // Add both for compatibility
        boilerId: boilerValue,
        woodType: document.getElementById('loadWoodType').value || 'pellet',
        quantity: parseInt(document.getElementById('loadQuantity').value) || 0,
        amount: 15,
        status: document.getElementById('loadStatus').value || 'completato',
        notes: document.getElementById('loadNotes').value || '',
        createdAt: loadId ? (app.data.boilerLoads.find(l => l.id === loadId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (loadId && loadId !== '') {
        const index = app.data.boilerLoads.findIndex(l => l.id === loadId);
        if (index !== -1) {
            app.data.boilerLoads[index] = loadData;
            console.log('Updated load at index:', index, loadData);
        } else {
            console.error('Load not found for update, ID:', loadId);
            app.showToast('Errore: Caricamento non trovato!', 'danger');
            return;
        }
    } else {
        app.data.boilerLoads.push(loadData);
        console.log('Added new load:', loadData);
    }

    console.log('Saving load data:', loadData);
    console.log('Total loads after save:', app.data.boilerLoads.length);

    app.saveData();
    renderLoadsList();
    updateBoilerStats();
    
    // Update accounting if on accounting page
    if (typeof renderAccountingDashboard === 'function') {
        renderAccountingDashboard();
        renderMonthlyAnalysis();
        renderLoadRevenueTable();
        renderOrderRevenueTable();
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('loadModal'));
    modal.hide();

    app.showToast(
        loadId ? 'Caricamento aggiornato con successo!' : 'Caricamento registrato con successo!',
        'success'
    );
}

function renderBoilerDashboard() {
    const container = document.getElementById('boiler-dashboard');
    if (!container) return;

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h5 class="mb-0"><i class="fas fa-chart-bar"></i> Dashboard Caldaie - Panoramica Completa</h5>
                            </div>
                            <div class="col-md-6">
                                <div class="row">
                                    <div class="col-md-5">
                                        <label class="form-label text-sm">Data Inizio</label>
                                        <input type="date" class="form-control form-control-sm" id="dashboardStartDate" onchange="updateBoilerDashboard()">
                                    </div>
                                    <div class="col-md-5">
                                        <label class="form-label text-sm">Data Fine</label>
                                        <input type="date" class="form-control form-control-sm" id="dashboardEndDate" onchange="updateBoilerDashboard()">
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label text-sm">&nbsp;</label>
                                        <button class="btn btn-sm btn-outline-secondary w-100" onclick="resetDashboardDates()" title="Reset">
                                            <i class="fas fa-refresh"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="dashboard-content">
                            <!-- Contenuto dinamico -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inizializza i valori di default (da inizio maggio a oggi)
    const today = new Date();
    const startOfMay = new Date(2025, 4, 1); // Maggio = mese 4 (0-based)
    
    document.getElementById('dashboardStartDate').value = startOfMay.toISOString().split('T')[0];
    document.getElementById('dashboardEndDate').value = today.toISOString().split('T')[0];
    
    updateBoilerDashboard();
}

function updateBoilerDashboard() {
    const startDate = document.getElementById('dashboardStartDate')?.value;
    const endDate = document.getElementById('dashboardEndDate')?.value;
    
    const boilers = app.data.boilers || [];
    const loads = app.data.boilerLoads || [];
    
    // Filtra i carichi per il range selezionato
    let filteredLoads = loads;
    if (startDate && endDate) {
        filteredLoads = loads.filter(load => {
            const loadDate = new Date(load.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return loadDate >= start && loadDate <= end;
        });
    }
    
    // Calcola le statistiche
    const stats = calculateDashboardStats(boilers, filteredLoads, loads);
    
    const container = document.getElementById('dashboard-content');
    if (!container) return;
    
    container.innerHTML = `
        <!-- Cards con statistiche principali -->
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-euro-sign fa-2x mb-2"></i>
                        <h3>€${stats.totalRevenue.toFixed(2)}</h3>
                        <p class="mb-0">Fatturato ${startDate && endDate ? 'Periodo' : 'Totale'}</p>
                        <small class="text-light">€${stats.totalRevenueAllTime.toFixed(2)} totale storico</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-truck fa-2x mb-2"></i>
                        <h3>${stats.totalLoads}</h3>
                        <p class="mb-0">Caricamenti ${startDate && endDate ? 'Periodo' : 'Totali'}</p>
                        <small class="text-light">${stats.totalLoadsAllTime} totali storici</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-calculator fa-2x mb-2"></i>
                        <h3>€${stats.averagePerLoad.toFixed(2)}</h3>
                        <p class="mb-0">Media per Caricamento</p>
                        <small class="text-light">€${stats.averagePerBoiler.toFixed(2)} media per caldaia</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-fire fa-2x mb-2"></i>
                        <h3>${stats.activeBoilers}</h3>
                        <p class="mb-0">Caldaie Attive</p>
                        <small class="text-light">${stats.totalBoilers} totali (${stats.inactiveBoilers} inattive)</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistiche dettagliate -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-chart-pie"></i> Distribuzione per Caldaia</h6>
                    </div>
                    <div class="card-body">
                        ${renderBoilerDistribution(boilers, filteredLoads)}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-calendar-alt"></i> Statistiche Temporali</h6>
                    </div>
                    <div class="card-body">
                        ${renderTimeStats(filteredLoads, startDate, endDate)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabella riepilogativa -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="fas fa-table"></i> Riepilogo Dettagliato Caldaie</h6>
                    </div>
                    <div class="card-body">
                        ${renderDetailedBoilerSummary(boilers, filteredLoads)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateDashboardStats(boilers, filteredLoads, allLoads) {
    const totalRevenue = filteredLoads.reduce((sum, load) => sum + (load.amount || 15), 0);
    const totalRevenueAllTime = allLoads.reduce((sum, load) => sum + (load.amount || 15), 0);
    const totalLoads = filteredLoads.length;
    const totalLoadsAllTime = allLoads.length;
    const activeBoilers = boilers.filter(b => b.status === 'attiva').length;
    const totalBoilers = boilers.length;
    const inactiveBoilers = totalBoilers - activeBoilers;
    const averagePerLoad = totalLoads > 0 ? totalRevenue / totalLoads : 0;
    const averagePerBoiler = activeBoilers > 0 ? totalRevenue / activeBoilers : 0;

    return {
        totalRevenue,
        totalRevenueAllTime,
        totalLoads,
        totalLoadsAllTime,
        activeBoilers,
        totalBoilers,
        inactiveBoilers,
        averagePerLoad,
        averagePerBoiler
    };
}

function renderBoilerDistribution(boilers, loads) {
    console.log('Rendering boiler distribution with', boilers.length, 'boilers and', loads.length, 'loads', boilers);
    if (boilers.length === 0) {
        return '<p class="text-muted text-center">Nessuna caldaia disponibile</p>';
    }

    const boilerStats = boilers.map(boiler => {
        const boilerLoads = loads.filter(load => load.boilerId === boiler.id);
        const revenue = boilerLoads.reduce((sum, load) => sum + (load.amount || 15), 0);
        return {
            name: boiler.code,
            loads: boilerLoads.length,
            revenue: revenue,
            status: boiler.status
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const maxRevenue = Math.max(...boilerStats.map(b => b.revenue));

    return `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead class="table-light">
                    <tr>
                        <th>Caldaia</th>
                        <th>Carichi</th>
                        <th>Fatturato</th>
                        <th>% Contributo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${boilerStats.map(boiler => {
                        const percentage = maxRevenue > 0 ? (boiler.revenue / maxRevenue * 100) : 0;
                        const statusClass = boiler.status === 'attiva' ? 'success' : 'secondary';
                        return `
                            <tr>
                                <td><strong>${boiler.name}</strong></td>
                                <td>${boiler.loads}</td>
                                <td>€${boiler.revenue.toFixed(2)}</td>
                                <td>
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar bg-success" style="width: ${percentage}%">${percentage.toFixed(1)}%</div>
                                    </div>
                                </td>
                                <td><span class="badge bg-${statusClass}">${boiler.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderTimeStats(loads, startDate, endDate) {
    if (loads.length === 0) {
        return '<p class="text-muted text-center">Nessun caricamento nel periodo selezionato</p>';
    }

    // Raggruppa per mese
    const monthlyStats = {};
    loads.forEach(load => {
        const date = new Date(load.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyStats[key]) {
            monthlyStats[key] = { loads: 0, revenue: 0 };
        }
        monthlyStats[key].loads++;
        monthlyStats[key].revenue += load.amount || 15;
    });

    const months = Object.keys(monthlyStats).sort();
    const avgLoadsPerMonth = months.length > 0 ? loads.length / months.length : 0;
    const totalRevenue = loads.reduce((sum, load) => sum + (load.amount || 15), 0);
    const avgRevenuePerMonth = months.length > 0 ? totalRevenue / months.length : 0;

    // Calcola giorni nel periodo
    const start = startDate ? new Date(startDate) : new Date(Math.min(...loads.map(l => new Date(l.date))));
    const end = endDate ? new Date(endDate) : new Date(Math.max(...loads.map(l => new Date(l.date))));
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return `
        <div class="row">
            <div class="col-12 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-calendar"></i> Periodo analizzato:</span>
                    <strong>${daysDiff} giorni</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-truck"></i> Media carichi/mese:</span>
                    <strong>${avgLoadsPerMonth.toFixed(1)}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-euro-sign"></i> Media fatturato/mese:</span>
                    <strong>€${avgRevenuePerMonth.toFixed(2)}</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-chart-line"></i> Carichi/giorno:</span>
                    <strong>${(loads.length / daysDiff).toFixed(2)}</strong>
                </div>
            </div>
            <div class="col-12">
                <h6 class="mb-2">Andamento Mensile</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Mese</th>
                                <th>Carichi</th>
                                <th>Fatturato</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${months.map(month => `
                                <tr>
                                    <td>${new Date(month + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</td>
                                    <td>${monthlyStats[month].loads}</td>
                                    <td>€${monthlyStats[month].revenue.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderDetailedBoilerSummary(boilers, loads) {
    if (boilers.length === 0) {
        return '<p class="text-muted text-center">Nessuna caldaia configurata</p>';
    }

    return `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Caldaia</th>
                        <th>Cliente</th>
                        <th>Ubicazione</th>
                        <th>Status</th>
                        <th>N. Carichi</th>
                        <th>Fatturato</th>
                        <th>Ultimo Carico</th>
                        <th>Giorni da Ultimo</th>
                    </tr>
                </thead>
                <tbody>
                    ${boilers.map(boiler => {
                        const customer = app.data.customers.find(c => c.id === boiler.customerId);
                        const boilerLoads = loads.filter(load => load.boilerId === boiler.id);
                        const revenue = boilerLoads.reduce((sum, load) => sum + (load.amount || 15), 0);
                        const lastLoad = boilerLoads.length > 0 ? 
                            new Date(Math.max(...boilerLoads.map(l => new Date(l.date)))) : null;
                        const daysSinceLastLoad = lastLoad ? 
                            Math.floor((new Date() - lastLoad) / (1000 * 60 * 60 * 24)) : null;
                        
                        const statusClass = boiler.status === 'attiva' ? 'success' : 'secondary';
                        const urgencyClass = daysSinceLastLoad > 7 ? 'danger' : daysSinceLastLoad > 3 ? 'warning' : 'success';
                        
                        return `
                            <tr>
                                <td><strong>${boiler.code}</strong></td>
                                <td>${customer ? customer.name : 'N/A'}</td>
                                <td>${boiler.location || 'N/A'}</td>
                                <td><span class="badge bg-${statusClass}">${boiler.status}</span></td>
                                <td>${boilerLoads.length}</td>
                                <td>€${revenue.toFixed(2)}</td>
                                <td>${lastLoad ? lastLoad.toLocaleDateString('it-IT') : 'Mai'}</td>
                                <td>${daysSinceLastLoad !== null ? `<span class="badge bg-${urgencyClass}">${daysSinceLastLoad} gg</span>` : '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function resetDashboardDates() {
    const today = new Date();
    const startOfMay = new Date(today.getFullYear(), 4, 1); // Maggio = mese 4 (0-based)
    
    document.getElementById('dashboardStartDate').value = startOfMay.toISOString().split('T')[0];
    document.getElementById('dashboardEndDate').value = today.toISOString().split('T')[0];
    
    updateBoilerDashboard();
}

function renderBoilerSummary(boilers, loads) {
    if (boilers.length === 0) {
        return '<p class="text-muted text-center">Nessuna caldaia registrata nel sistema</p>';
    }

    const boilerStats = boilers.map(boiler => {
        const boilerLoads = loads.filter(l => l.boilerId === boiler.id);
        const customer = app.data.customers.find(c => c.id === boiler.customerId);
        return {
            boiler,
            loadCount: boilerLoads.length,
            revenue: boilerLoads.reduce((sum, load) => sum + (load.amount || 15), 0),
            customerName: customer ? customer.name : 'N/A'
        };
    });

    boilerStats.sort((a, b) => b.loadCount - a.loadCount);

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead class="table-light"><tr>';
    html += '<th>Posizione</th><th>Codice Caldaia</th><th>Cliente</th><th>Caricamenti Totali</th><th>Fatturato Totale</th><th>Stato</th>';
    html += '</tr></thead><tbody>';

    boilerStats.forEach((item, index) => {
        const statusClass = item.boiler.status === 'attiva' ? 'success' : 
                           item.boiler.status === 'manutenzione' ? 'warning' : 'danger';
        
        html += `<tr>
            <td><span class="badge bg-primary">${index + 1}°</span></td>
            <td><strong>${item.boiler.code}</strong></td>
            <td>${item.customerName}</td>
            <td><span class="badge bg-info">${item.loadCount}</span></td>
            <td><strong>€${item.revenue.toFixed(2)}</strong></td>
            <td><span class="badge bg-${statusClass}">${item.boiler.status.charAt(0).toUpperCase() + item.boiler.status.slice(1)}</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    return html;
}

// Helper functions for actions
function editBoiler(boilerId) {
    openBoilerModal(boilerId);
}

function addLoad(boilerId) {
    openLoadModal(boilerId);
}

function deleteBoiler(boilerId) {
    const boiler = app.data.boilers.find(b => b.id === boilerId);
    if (!boiler) return;
    
    ConfirmationDialog.confirmDanger(
        'Elimina Caldaia',
        `Sei sicuro di voler eliminare la caldaia "${boiler.name}"? Verranno eliminati anche tutti i caricamenti associati. Questa azione non può essere annullata.`,
        'Elimina Tutto'
    ).then(confirmed => {
        if (confirmed) {
            app.data.boilers = app.data.boilers.filter(b => b.id !== boilerId);
            app.data.boilerLoads = app.data.boilerLoads.filter(l => l.boilerId !== boilerId);
            
            app.saveData();
            renderBoilersList();
            renderLoadsList();
            updateBoilerStats();
            
            app.showToast('Caldaia eliminata con successo!', 'success');
        }
    });
}

function editLoad(loadId) {
    openLoadModal(null, loadId);
}

function deleteLoad(loadId) {
    const load = app.data.boilerLoads.find(l => l.id === loadId);
    if (!load) return;
    
    const boiler = app.data.boilers.find(b => b.id === load.boilerId);
    const loadDescription = `Caricamento di ${load.quantity}kg in ${boiler?.name || 'caldaia'}`;
    
    ConfirmationDialog.confirmDelete(loadDescription, 'il caricamento').then(confirmed => {
        if (confirmed) {
            app.data.boilerLoads = app.data.boilerLoads.filter(l => l.id !== loadId);
            
            app.saveData();
            renderLoadsList();
            updateBoilerStats();
        
            // Update accounting if on accounting page
            if (typeof renderAccountingDashboard === 'function') {
                renderAccountingDashboard();
                renderMonthlyAnalysis();
                renderLoadRevenueTable();
                renderOrderRevenueTable();
            }
            
            app.showToast('Caricamento eliminato con successo!', 'success');
        }
    });
}

function filterBoilers() {
    const searchTerm = document.getElementById('search-boilers').value.toLowerCase();
    const rows = document.querySelectorAll('#boilers-list tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ==========================================
// CARICAMENTI MULTIPLI
// ==========================================

function openBulkLoadModal() {
    const boilers = app.data.boilers || [];
    let boilerOptions = '<option value="">Seleziona Caldaia</option>';
    boilers.forEach(boiler => {
        const customer = app.data.customers.find(c => c.id === boiler.customerId);
        const customerName = customer ? customer.name : 'N/A';
        boilerOptions += `<option value="${boiler.id}">${boiler.code} - ${customerName}</option>`;
    });

    const modalHtml = `
        <div class="modal fade" id="bulkLoadModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-layer-group"></i> Caricamenti Multipli - Modalità Semplificata
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Modello Unico -->
                        <div class="card bg-light border-primary">
                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0"><i class="fas fa-template"></i> Modello Caricamento Unico</h6>
                                <small>Definisci UN caricamento tipo, poi scegli quante copie creare</small>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Data Caricamento *</label>
                                        <input type="date" class="form-control" id="templateDate" value="${new Date().toISOString().split('T')[0]}" onchange="updatePreview()">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Caldaia *</label>
                                        <select class="form-select" id="templateBoiler" onchange="updatePreview()">
                                            ${boilerOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Tipo Legno</label>
                                        <select class="form-select" id="templateWoodType" onchange="updatePreview()">
                                            <option value="pellet" selected>Pellet</option>
                                            <option value="cippato">Cippato</option>
                                            <option value="legna">Legna</option>
                                            <option value="bricchetti">Bricchetti</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Quantità (kg)</label>
                                        <input type="number" class="form-control" id="templateQuantity" value="100" min="1" step="1" onchange="updatePreview()">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Stato</label>
                                        <select class="form-select" id="templateStatus" onchange="updatePreview()">
                                            <option value="programmato">Programmato</option>
                                            <option value="in-corso">In Corso</option>
                                            <option value="completato" selected>Completato</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Note (opzionale)</label>
                                    <input type="text" class="form-control" id="templateNotes" placeholder="Note comuni per tutti i caricamenti..." onchange="updatePreview()">
                                </div>
                            </div>
                        </div>

                        <!-- Quantità da Creare -->
                        <div class="card mt-3 border-success">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0"><i class="fas fa-copy"></i> Quantità da Creare</h6>
                            </div>
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <label class="form-label">Numero di caricamenti identici da creare:</label>
                                        <input type="number" class="form-control form-control-lg text-center" id="templateCount" value="5" min="1" max="50" onchange="updatePreview()" style="font-size: 1.2rem; font-weight: bold;">
                                    </div>
                                    <div class="col-md-6">
                                        <div class="alert alert-info mb-0">
                                            <i class="fas fa-info-circle"></i>
                                            <strong>Esempio:</strong> Se inserisci <strong>8</strong>, verranno creati 8 caricamenti identici con gli stessi dati che hai impostato nel modello.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Anteprima -->
                        <div class="card mt-3 border-warning">
                            <div class="card-header bg-warning text-dark">
                                <h6 class="mb-0"><i class="fas fa-eye"></i> Anteprima Caricamenti</h6>
                            </div>
                            <div class="card-body">
                                <div id="bulkPreview">
                                    <!-- Anteprima generata dinamicamente -->
                                </div>
                            </div>
                        </div>

                        <!-- Riepilogo Totali -->
                        <div class="card mt-3 bg-info text-white">
                            <div class="card-body">
                                <div class="row text-center">
                                    <div class="col-md-3">
                                        <h4 id="totalLoadsCount">0</h4>
                                        <small>Caricamenti Totali</small>
                                    </div>
                                    <div class="col-md-3">
                                        <h4 id="totalAmount">€0</h4>
                                        <small>Fatturato Totale</small>
                                    </div>
                                    <div class="col-md-3">
                                        <h4 id="totalQuantity">0 kg</h4>
                                        <small>Quantità Totale</small>
                                    </div>
                                    <div class="col-md-3">
                                        <h4>€15.00</h4>
                                        <small>Prezzo per Carico</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-success btn-lg" onclick="saveBulkLoadsSimple()">
                            <i class="fas fa-magic"></i> Crea Tutti i Caricamenti
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('bulkLoadModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('bulkLoadModal'));
    modal.show();

    // Generate initial preview
    updatePreview();
}

function updatePreview() {
    const date = document.getElementById('templateDate').value;
    const boilerId = document.getElementById('templateBoiler').value;
    const woodType = document.getElementById('templateWoodType').value;
    const quantity = parseInt(document.getElementById('templateQuantity').value) || 0;
    const status = document.getElementById('templateStatus').value;
    const notes = document.getElementById('templateNotes').value;
    const count = parseInt(document.getElementById('templateCount').value) || 1;
    
    // Find boiler info for display
    const boiler = app.data.boilers.find(b => b.id === boilerId);
    const customer = boiler ? app.data.customers.find(c => c.id === boiler.customerId) : null;
    const boilerDisplay = boiler ? `${boiler.code} - ${customer ? customer.name : 'N/A'}` : 'Nessuna caldaia selezionata';
    
    // Update preview
    const previewContainer = document.getElementById('bulkPreview');
    if (!date || !boilerId) {
        previewContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Compila i campi obbligatori:</strong> Data e Caldaia sono richiesti per vedere l'anteprima.
            </div>
        `;
    } else {
        previewContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-file-alt"></i> Modello Caricamento:</h6>
                    <ul class="list-unstyled">
                        <li><strong>Data:</strong> ${new Date(date).toLocaleDateString('it-IT')}</li>
                        <li><strong>Caldaia:</strong> ${boilerDisplay}</li>
                        <li><strong>Tipo Legno:</strong> ${woodType.charAt(0).toUpperCase() + woodType.slice(1)}</li>
                        <li><strong>Quantità:</strong> ${quantity} kg</li>
                        <li><strong>Stato:</strong> ${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</li>
                        ${notes ? `<li><strong>Note:</strong> ${notes}</li>` : ''}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-copy"></i> Verranno creati:</h6>
                    <div class="alert alert-success">
                        <h5 class="mb-1">${count} caricamenti identici</h5>
                        <small>Tutti con gli stessi dati del modello</small>
                    </div>
                    ${count > 1 ? `
                        <small class="text-muted">
                            <i class="fas fa-info-circle"></i>
                            Ogni caricamento avrà un ID univoco ma tutti gli altri dati saranno identici.
                        </small>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Update totals
    const totalAmount = count * 15;
    const totalQuantity = count * quantity;
    
    document.getElementById('totalLoadsCount').textContent = count;
    document.getElementById('totalAmount').textContent = `€${totalAmount.toFixed(2)}`;
    document.getElementById('totalQuantity').textContent = `${totalQuantity} kg`;
}

function saveBulkLoadsSimple() {
    const date = document.getElementById('templateDate').value;
    const boilerId = document.getElementById('templateBoiler').value;
    const woodType = document.getElementById('templateWoodType').value;
    const quantity = parseInt(document.getElementById('templateQuantity').value) || 0;
    const status = document.getElementById('templateStatus').value;
    const notes = document.getElementById('templateNotes').value;
    const count = parseInt(document.getElementById('templateCount').value) || 1;
    
    // Validation
    if (!date || !boilerId) {
        app.showToast('Data e Caldaia sono obbligatorie!', 'danger');
        return;
    }
    
    if (count < 1 || count > 50) {
        app.showToast('Il numero di caricamenti deve essere tra 1 e 50!', 'danger');
        return;
    }
    
    // Ensure boilerLoads array exists
    if (!app.data.boilerLoads) {
        app.data.boilerLoads = [];
    }
    
    const loads = [];
    const baseTimestamp = Date.now();
    
    // Create all identical loads
    for (let i = 0; i < count; i++) {
        const load = {
            id: `${baseTimestamp}_${i}`, // Unique ID for each load
            date: date,
            datetime: date,
            boilerId: boilerId,
            woodType: woodType,
            quantity: quantity,
            amount: 15,
            status: status,
            notes: notes ? `${notes} (Lotto ${i + 1}/${count})` : `Caricamento multiplo ${i + 1}/${count}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        loads.push(load);
        app.data.boilerLoads.push(load);
    }
    
    console.log('Saving bulk loads (simple):', loads);
    
    app.saveData();
    renderLoadsList();
    updateBoilerStats();
    
    // Update accounting if on accounting page
    if (typeof renderAccountingDashboard === 'function') {
        renderAccountingDashboard();
        renderMonthlyAnalysis();
        renderLoadRevenueTable();
        renderOrderRevenueTable();
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('bulkLoadModal'));
    modal.hide();
    
    app.showToast(
        `✅ ${count} caricamenti identici creati con successo! Totale fatturato: €${(count * 15).toFixed(2)}`,
        'success'
    );
}

// Funzioni per l'importazione dati
function openImportDataModal() {
    const modal = new bootstrap.Modal(document.getElementById('importDataModal') || createImportDataModal());
    modal.show();
}

function createImportDataModal() {
    const modalHTML = `
        <div class="modal fade" id="importDataModal" tabindex="-1" aria-labelledby="importDataModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title" id="importDataModalLabel">
                            <i class="fas fa-file-import"></i> Importa Dati Caricamenti
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Attenzione!</strong> Questa operazione cancellerà tutti i caricamenti esistenti e li sostituirà con i nuovi dati.
                        </div>
                        
                        <div class="mb-3">
                            <label for="import-boiler-select" class="form-label">Caldaia di riferimento</label>
                            <select class="form-select" id="import-boiler-select" required>
                                <option value="">Seleziona caldaia...</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="import-wood-type" class="form-label">Tipo di legna</label>
                            <input type="text" class="form-control" id="import-wood-type" value="Pellet" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="import-data" class="form-label">Dati da importare</label>
                            <textarea class="form-control" id="import-data" rows="12" 
                                      placeholder="Incolla qui i dati nel formato:
Data    nr di carichi
2025/05/05    0
2025/05/06    2
...">Data	nr di carichi 
	
2025/05/05	0
2025/05/06	2
2025/05/07	2
2025/05/08	2
2025/05/09	1
2025/05/10	0
2025/05/11	0
2025/05/12	0
2025/05/13	1
2025/05/14	1
2025/05/15	1
2025/05/16	1
2025/05/17	1
2025/05/18	1
2025/05/19	0
2025/05/20	1
2025/05/21	1
2025/05/22	1
2025/05/23	1
2025/05/24	1
2025/05/25	1
2025/05/26	0
2025/05/27	1
2025/05/28	1
2025/05/29	1
2025/05/30	1
2025/05/31	1
2025/06/01	1
2025/06/02	1
2025/06/03	0
2025/06/04	1
2025/06/05	1
2025/06/06	1
2025/06/07	1
2025/06/08	1
2025/06/09	1
2025/06/10	0
2025/06/11	1
2025/06/12	1
2025/06/13	1
2025/06/14	1
2025/06/15	1
2025/06/16	0
2025/06/17	1
2025/06/18	1
2025/06/19	1
2025/06/20	1
2025/06/21	1
2025/06/22	1
2025/06/23	0
2025/06/24	1
2025/06/25	1
2025/06/26	1
2025/06/27	1
2025/06/28	1
2025/06/29	1
2025/06/30	0
2025/07/01	1
2025/07/02	1
2025/07/03	1
2025/07/04	1
2025/07/05	1
2025/07/06	1
2025/07/07	0
2025/07/08	1
2025/07/09	1
2025/07/10	1
2025/07/11	1
2025/07/12	1
2025/07/13	1
2025/07/14	0
2025/07/15	1
2025/07/16	1
2025/07/17	1
2025/07/18	1
2025/07/19	1
2025/07/20	1
2025/07/21	0
2025/07/22	1
2025/07/23	1
2025/07/24	1
2025/07/25	1
2025/07/26	1
2025/07/27	1
2025/07/28	0
2025/07/29	1
2025/07/30	1
2025/07/31	1
2025/08/01	1
2025/08/02	1
2025/08/03	1
2025/08/04	0
2025/08/05	1
2025/08/06	1
2025/08/07	1
2025/08/08	1
2025/08/09	1
2025/08/10	1
2025/08/11	1
2025/08/12	0
2025/08/13	1
2025/08/14	1
2025/08/15	1
2025/08/16	1
2025/08/17	1
2025/08/18	1
2025/08/19	1
2025/08/20	1
2025/08/21	1
2025/08/22	1
2025/08/23	1
2025/08/24	1
2025/08/25	1
2025/08/26	1
2025/08/27	1
2025/08/28	1
2025/08/29	1
2025/08/30	1
2025/08/31	1
2025/09/01	0
2025/09/02	1
2025/09/03	1
2025/09/04	1
2025/09/05	1
2025/09/06	1
2025/09/07	1
2025/09/08	0
2025/09/09	1
2025/09/10	1
2025/09/11	1
2025/09/12	1
2025/09/13	1
2025/09/14	1
2025/09/15	0
2025/09/16	1
2025/09/17	1
2025/09/18	1
2025/09/19	1
2025/09/20	1
2025/09/21	1
2025/09/22	0
2025/09/23	1
2025/09/24	1
2025/09/25	1
2025/09/26	1
2025/09/27	1
2025/09/28	1
2025/09/29	0
2025/09/30	1
2025/10/01	1
2025/10/02	1
2025/10/03	1
2025/10/04	1
2025/10/05	1
2025/10/06	0
2025/10/07	1
2025/10/08	1
2025/10/09	1
2025/10/10	1
2025/10/11	1
2025/10/12	1
2025/10/13	0
2025/10/14	1
2025/10/15	1
2025/10/16	1
2025/10/17	1
2025/10/18	1
2025/10/19	0
2025/10/20	1</textarea>
                            <div class="form-text">
                                Formato supportato: Data (YYYY/MM/DD) seguita da TAB o spazi e numero di carichi
                            </div>
                        </div>
                        
                        <div id="import-preview" class="mt-3" style="display: none;">
                            <h6>Anteprima importazione:</h6>
                            <div id="import-preview-content" class="border p-2 bg-light" style="max-height: 200px; overflow-y: auto;"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-info" onclick="previewImportData()">
                            <i class="fas fa-eye"></i> Anteprima
                        </button>
                        <button type="button" class="btn btn-warning" onclick="executeImportData()">
                            <i class="fas fa-file-import"></i> Importa Dati
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Populate boilers select
    const select = document.getElementById('import-boiler-select');
    app.data.boilers.forEach(boiler => {
        const option = document.createElement('option');
        option.value = boiler.id;
        option.textContent = `${boiler.name} - ${boiler.location}`;
        select.appendChild(option);
    });
    
    return document.getElementById('importDataModal');
}

function previewImportData() {
    const data = document.getElementById('import-data').value.trim();
    const boilerId = document.getElementById('import-boiler-select').value;
    const woodType = document.getElementById('import-wood-type').value;
    
    if (!data || !boilerId || !woodType) {
        app.showToast('Compila tutti i campi per vedere l\'anteprima', 'warning');
        return;
    }
    
    const parsedData = parseImportData(data);
    
    if (parsedData.length === 0) {
        app.showToast('Nessun dato valido trovato', 'error');
        return;
    }
    
    const preview = document.getElementById('import-preview');
    const content = document.getElementById('import-preview-content');
    
    let html = `<strong>Caldaia:</strong> ${app.data.boilers.find(b => b.id === boilerId)?.name}<br>`;
    html += `<strong>Tipo legna:</strong> ${woodType}<br>`;
    html += `<strong>Totale carichi da creare:</strong> ${parsedData.reduce((sum, item) => sum + item.loads, 0)}<br><br>`;
    
    html += '<div class="row">';
    parsedData.forEach((item, index) => {
        if (item.loads > 0) {
            html += `<div class="col-md-6 mb-1">
                <small>${item.date}: ${item.loads} carico${item.loads > 1 ? 'i' : ''}</small>
            </div>`;
        }
    });
    html += '</div>';
    
    content.innerHTML = html;
    preview.style.display = 'block';
}

function parseImportData(data) {
    const lines = data.split('\n');
    const result = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line || line.includes('Data') || line.includes('nr di carichi')) continue;
        
        // Split by tab or multiple spaces
        const parts = line.split(/\t+|\s{2,}/).filter(part => part.trim());
        
        if (parts.length >= 2) {
            const dateStr = parts[0].trim();
            const loadsStr = parts[1].trim();
            
            // Validate date format (YYYY/MM/DD or YYYY-MM-DD)
            const dateMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (dateMatch) {
                const loads = parseInt(loadsStr);
                if (!isNaN(loads) && loads >= 0) {
                    result.push({
                        date: dateStr.replace(/-/g, '/'), // Normalize to / format
                        loads: loads
                    });
                }
            }
        }
    }
    
    return result;
}

function executeImportData() {
    const data = document.getElementById('import-data').value.trim();
    const boilerId = document.getElementById('import-boiler-select').value;
    const woodType = document.getElementById('import-wood-type').value;
    
    if (!data || !boilerId || !woodType) {
        app.showToast('Compila tutti i campi obbligatori', 'error');
        return;
    }
    
    const parsedData = parseImportData(data);
    
    if (parsedData.length === 0) {
        app.showToast('Nessun dato valido trovato', 'error');
        return;
    }
    
    // Confirm action
    const totalLoadsToImport = parsedData.reduce((sum, item) => sum + item.loads, 0);
    ConfirmationDialog.confirmDanger(
        'Importazione Dati',
        `Sei sicuro di voler cancellare tutti i caricamenti esistenti e importare ${parsedData.length} date con un totale di ${totalLoadsToImport} carichi? Questa azione non può essere annullata.`,
        'Importa Dati'
    ).then(confirmed => {
        if (!confirmed) return;
        
        // Clear existing loads
        app.data.boilerLoads = [];
        
        // Create new loads
        let totalLoads = 0;
        parsedData.forEach(item => {
            for (let i = 0; i < item.loads; i++) {
                const load = {
                    id: app.generateId(),
                    date: item.date,
                    datetime: item.date,
                    boilerId: boilerId,
                    woodType: woodType,
                    quantity: 1,
                    amount: 15,
                    status: 'completato',
                    notes: `Importazione automatica - ${item.date}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                app.data.boilerLoads.push(load);
                totalLoads++;
            }
        });
    
    app.saveData();
    renderLoadsList();
    updateBoilerStats();
    
    // Update accounting if available
        if (typeof renderAccountingDashboard === 'function') {
            renderAccountingDashboard();
            renderMonthlyAnalysis();
            renderLoadRevenueTable();
            renderOrderRevenueTable();
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('importDataModal'));
        modal.hide();
        
        app.showToast(
            `✅ Importazione completata! ${totalLoads} caricamenti importati da ${parsedData.length} date. Totale fatturato: €${(totalLoads * 15).toFixed(2)}`,
            'success'
        );
    });
}
