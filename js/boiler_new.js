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
                        <button class="btn btn-success me-2" onclick="openBoilerDashboard()">
                            <i class="fas fa-chart-pie"></i> Dashboard Contabile
                        </button>
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
                        <button class="btn btn-primary btn-sm" onclick="openLoadModal()">
                            <i class="fas fa-plus"></i> Nuovo Caricamento
                        </button>
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
        
        const statusClass = load.status === 'completato' ? 'success' : 
                           load.status === 'in-corso' ? 'warning' : 'secondary';
        
        html += `<tr>
            <td>${new Date(load.date).toLocaleDateString('it-IT')}</td>
            <td><strong>${boilerCode}</strong></td>
            <td><span class="badge bg-info">${customerName}</span></td>
            <td>${load.woodType}</td>
            <td>${load.quantity} kg</td>
            <td><strong>€${load.amount.toFixed(2)}</strong></td>
            <td><span class="badge bg-${statusClass}">${load.status.charAt(0).toUpperCase() + load.status.slice(1).replace('-', ' ')}</span></td>
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
        const totalRevenue = currentMonthLoads.reduce((sum, load) => sum + load.amount, 0);
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

    app.showNotification(
        boilerId ? 'Caldaia aggiornata con successo!' : 'Caldaia registrata con successo!',
        'success'
    );
}

function openLoadModal(boilerId = null, loadId = null) {
    const isEdit = loadId !== null;
    const load = isEdit ? app.data.boilerLoads.find(l => l.id === loadId) : null;
    
    const boilers = app.data.boilers || [];
    let boilerOptions = '<option value="">Seleziona Caldaia</option>';
    boilers.forEach(boiler => {
        const customer = app.data.customers.find(c => c.id === boiler.customerId);
        const customerName = customer ? customer.name : 'N/A';
        const selected = (load && load.boilerId === boiler.id) || (!load && boilerId === boiler.id) ? 'selected' : '';
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
                                        <option value="legna" ${load && load.woodType === 'legna' ? 'selected' : ''}>Legna</option>
                                        <option value="bricchetti" ${load && load.woodType === 'bricchetti' ? 'selected' : ''}>Bricchetti</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Quantità (kg)</label>
                                    <input type="number" class="form-control" id="loadQuantity" value="${load ? load.quantity : ''}" min="1" step="1">
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
                                        <option value="programmato" ${load && load.status === 'programmato' ? 'selected' : ''}>Programmato</option>
                                        <option value="in-corso" ${load && load.status === 'in-corso' ? 'selected' : ''}>In Corso</option>
                                        <option value="completato" ${load && load.status === 'completato' ? 'selected' : 'selected'}>Completato</option>
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
                        <button type="button" class="btn btn-primary" onclick="saveLoad('${loadId || ''}')">
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

function saveLoad(loadId) {
    const form = document.getElementById('loadForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const loadData = {
        id: loadId || Date.now().toString(),
        date: document.getElementById('loadDate').value,
        boilerId: document.getElementById('loadBoiler').value,
        woodType: document.getElementById('loadWoodType').value,
        quantity: parseInt(document.getElementById('loadQuantity').value) || 0,
        amount: 15,
        status: document.getElementById('loadStatus').value,
        notes: document.getElementById('loadNotes').value,
        createdAt: loadId ? app.data.boilerLoads.find(l => l.id === loadId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (loadId) {
        const index = app.data.boilerLoads.findIndex(l => l.id === loadId);
        app.data.boilerLoads[index] = loadData;
    } else {
        app.data.boilerLoads.push(loadData);
    }

    app.saveData();
    renderLoadsList();
    updateBoilerStats();

    const modal = bootstrap.Modal.getInstance(document.getElementById('loadModal'));
    modal.hide();

    app.showNotification(
        loadId ? 'Caricamento aggiornato con successo!' : 'Caricamento registrato con successo!',
        'success'
    );
}

function renderBoilerDashboard() {
    const container = document.getElementById('boiler-dashboard');
    if (!container) return;

    const boilers = app.data.boilers || [];
    const loads = app.data.boilerLoads || [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthLoads = loads.filter(load => {
        const loadDate = new Date(load.date);
        return loadDate.getMonth() === currentMonth && loadDate.getFullYear() === currentYear;
    });

    const totalRevenue = currentMonthLoads.reduce((sum, load) => sum + load.amount, 0);
    const averagePerBoiler = boilers.length > 0 ? totalRevenue / boilers.length : 0;

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-2x mb-2"></i>
                        <h3>€${totalRevenue.toFixed(2)}</h3>
                        <p class="mb-0">Fatturato Mensile</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-truck fa-2x mb-2"></i>
                        <h3>${currentMonthLoads.length}</h3>
                        <p class="mb-0">Caricamenti Mese</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-calculator fa-2x mb-2"></i>
                        <h3>€${averagePerBoiler.toFixed(2)}</h3>
                        <p class="mb-0">Media per Caldaia</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-fire fa-2x mb-2"></i>
                        <h3>${boilers.filter(b => b.status === 'attiva').length}</h3>
                        <p class="mb-0">Caldaie Attive</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-bar"></i> Riepilogo Generale Caldaie</h5>
                    </div>
                    <div class="card-body">
                        ${renderBoilerSummary(boilers, loads)}
                    </div>
                </div>
            </div>
        </div>
    `;
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
            revenue: boilerLoads.reduce((sum, load) => sum + load.amount, 0),
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
    if (confirm('Sei sicuro di voler eliminare questa caldaia? Verranno eliminati anche tutti i caricamenti associati.')) {
        app.data.boilers = app.data.boilers.filter(b => b.id !== boilerId);
        app.data.boilerLoads = app.data.boilerLoads.filter(l => l.boilerId !== boilerId);
        
        app.saveData();
        renderBoilersList();
        renderLoadsList();
        updateBoilerStats();
        
        app.showNotification('Caldaia eliminata con successo!', 'success');
    }
}

function editLoad(loadId) {
    openLoadModal(null, loadId);
}

function deleteLoad(loadId) {
    if (confirm('Sei sicuro di voler eliminare questo caricamento?')) {
        app.data.boilerLoads = app.data.boilerLoads.filter(l => l.id !== loadId);
        
        app.saveData();
        renderLoadsList();
        updateBoilerStats();
        
        app.showNotification('Caricamento eliminato con successo!', 'success');
    }
}

function filterBoilers() {
    const searchTerm = document.getElementById('search-boilers').value.toLowerCase();
    const rows = document.querySelectorAll('#boilers-list tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function openBoilerDashboard() {
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.click();
    }
}
