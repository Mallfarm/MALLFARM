// Suppliers Management
function loadSuppliersPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-truck"></i> Gestione Fornitori</h2>
                        <p class="text-muted">Gestisci l'anagrafica dei tuoi fornitori</p>
                    </div>
                    <button class="btn btn-primary" onclick="openSupplierModal()">
                        <i class="fas fa-plus"></i> Nuovo Fornitore
                    </button>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="supplierSearch" placeholder="Cerca fornitori..." onkeyup="filterSuppliers()">
                </div>
            </div>
            <div class="col-md-6">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" onclick="exportSuppliers()">
                        <i class="fas fa-download"></i> Esporta
                    </button>
                    <button class="btn btn-outline-info" onclick="printSuppliers()">
                        <i class="fas fa-print"></i> Stampa
                    </button>
                </div>
            </div>
        </div>

        <!-- Suppliers Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefono</th>
                                <th>Indirizzo</th>
                                <th class="text-center">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="suppliersTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                
                <div id="noSuppliersMessage" class="text-center py-4" style="display: none;">
                    <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                    <h5>Nessun fornitore trovato</h5>
                    <p class="text-muted">Inizia aggiungendo il tuo primo fornitore</p>
                    <button class="btn btn-primary" onclick="openSupplierModal()">
                        <i class="fas fa-plus"></i> Aggiungi Fornitore
                    </button>
                </div>
            </div>
        </div>

        <!-- Supplier Modal -->
        <div class="modal fade" id="supplierModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-truck"></i> <span id="supplierModalTitle">Nuovo Fornitore</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="supplierForm">
                            <input type="hidden" id="supplierId" value="">
                            
                            <div class="mb-3">
                                <label for="supplierName" class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="supplierName" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="supplierEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="supplierEmail">
                            </div>
                            
                            <div class="mb-3">
                                <label for="supplierPhone" class="form-label">Telefono</label>
                                <input type="tel" class="form-control" id="supplierPhone">
                            </div>
                            
                            <div class="mb-3">
                                <label for="supplierAddress" class="form-label">Indirizzo</label>
                                <textarea class="form-control" id="supplierAddress" rows="2"></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label for="supplierNotes" class="form-label">Note</label>
                                <textarea class="form-control" id="supplierNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveSupplier()">
                            <i class="fas fa-save"></i> Salva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderSuppliersTable();
}

function renderSuppliersTable() {
    const tbody = document.getElementById('suppliersTableBody');
    const noDataMessage = document.getElementById('noSuppliersMessage');
    
    if (!tbody) return;
    
    const suppliers = app.data.suppliers;
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }
    
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div>
                        <strong>${supplier.name}</strong>
                        ${supplier.notes ? `<small class="text-muted d-block">${supplier.notes}</small>` : ''}
                    </div>
                </div>
            </td>
            <td>${supplier.email || '-'}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.address || '-'}</td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editSupplier('${supplier.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewSupplierInventory('${supplier.id}')" title="Movimenti">
                        <i class="fas fa-warehouse"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteSupplier('${supplier.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openSupplierModal(supplierId = null) {
    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
    const form = document.getElementById('supplierForm');
    const title = document.getElementById('supplierModalTitle');
    
    // Reset form
    form.reset();
    document.getElementById('supplierId').value = '';
    
    if (supplierId) {
        const supplier = app.data.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            title.textContent = 'Modifica Fornitore';
            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('supplierName').value = supplier.name;
            document.getElementById('supplierEmail').value = supplier.email || '';
            document.getElementById('supplierPhone').value = supplier.phone || '';
            document.getElementById('supplierAddress').value = supplier.address || '';
            document.getElementById('supplierNotes').value = supplier.notes || '';
        }
    } else {
        title.textContent = 'Nuovo Fornitore';
    }
    
    modal.show();
}

function saveSupplier() {
    const form = document.getElementById('supplierForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const supplierId = document.getElementById('supplierId').value;
    const supplierData = {
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value,
        notes: document.getElementById('supplierNotes').value
    };
    
    if (supplierId) {
        // Update existing supplier
        const supplierIndex = app.data.suppliers.findIndex(s => s.id === supplierId);
        if (supplierIndex !== -1) {
            app.data.suppliers[supplierIndex] = {
                ...app.data.suppliers[supplierIndex],
                ...supplierData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new supplier
        const newSupplier = {
            id: app.generateId(),
            ...supplierData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        app.data.suppliers.push(newSupplier);
    }
    
    app.saveData('suppliers', app.data.suppliers);
    renderSuppliersTable();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
    modal.hide();
    
    app.showToast(supplierId ? 'Fornitore aggiornato con successo' : 'Fornitore creato con successo', 'success');
}

function editSupplier(supplierId) {
    openSupplierModal(supplierId);
}

function deleteSupplier(supplierId) {
    const supplier = app.data.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    ConfirmationDialog.confirmDelete(supplier.name, 'il fornitore').then(confirmed => {
        if (confirmed) {
            app.data.suppliers = app.data.suppliers.filter(s => s.id !== supplierId);
            app.saveData('suppliers', app.data.suppliers);
            renderSuppliersTable();
            app.showToast('Fornitore eliminato con successo', 'success');
        }
    });
}

function viewSupplierInventory(supplierId) {
    const supplier = app.data.suppliers.find(s => s.id === supplierId);
    const supplierMovements = app.data.inventory.filter(i => i.supplierId === supplierId);
    
    if (supplierMovements.length === 0) {
        app.showToast(`Nessun movimento trovato per ${supplier.name}`, 'info');
        return;
    }
    
    app.showToast(`${supplier.name} ha ${supplierMovements.length} movimenti`, 'info');
    showPage('inventory');
}

function filterSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const tbody = document.getElementById('suppliersTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function exportSuppliers() {
    const data = app.data.suppliers.map(supplier => ({
        Nome: supplier.name,
        Email: supplier.email || '',
        Telefono: supplier.phone || '',
        Indirizzo: supplier.address || '',
        Note: supplier.notes || '',
        'Data Creazione': new Date(supplier.createdAt).toLocaleDateString('it-IT')
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'fornitori.csv');
    app.showToast('Fornitori esportati con successo', 'success');
}

function printSuppliers() {
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const printContent = `
        <html>
            <head>
                <title>Lista Fornitori - ERP MallFarm</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px;
                        color: #333;
                    }
                    .header { 
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #2d5a27;
                        padding-bottom: 15px;
                    }
                    .logo-section {
                        display: flex;
                        align-items: center;
                    }
                    .logo-section img {
                        height: 60px;
                        margin-right: 15px;
                    }
                    .company-info h1 { 
                        margin: 0; 
                        font-size: 24px; 
                        color: #2d5a27;
                        font-weight: bold;
                    }
                    .company-info p {
                        margin: 2px 0;
                        color: #666;
                        font-size: 12px;
                    }
                    .document-title {
                        text-align: right;
                        font-size: 20px;
                        font-weight: bold;
                        color: #333;
                    }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #2d5a27; color: white; font-weight: bold; }
                    .company-footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <img src="${logoSrc}" alt="Mall Farm Logo" ${isBase64 ? 'style="max-width: 150px; height: auto;"' : 'style="height: 60px;"'}>
                    </div>
                    <div class="document-title">
                        <div>LISTA FORNITORI</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            Totale: ${app.data.suppliers.length} fornitori
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefono</th>
                            <th>Indirizzo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${app.data.suppliers.map(supplier => `
                            <tr>
                                <td>${supplier.name}</td>
                                <td>${supplier.email || '-'}</td>
                                <td>${supplier.phone || '-'}</td>
                                <td>${supplier.address || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="company-footer">
                    <p>Report generato automaticamente il ${new Date().toLocaleString('it-IT')}</p>
                </div>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}