// Customers Management
function loadCustomersPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-users"></i> Gestione Clienti</h2>
                        <p class="text-muted">Gestisci l'anagrafica dei tuoi clienti</p>
                    </div>
                    <button class="btn btn-primary" onclick="openCustomerModal()">
                        <i class="fas fa-plus"></i> Nuovo Cliente
                    </button>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="customerSearch" placeholder="Cerca clienti..." onkeyup="filterCustomers()">
                </div>
            </div>
            <div class="col-md-6">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" onclick="exportCustomers()">
                        <i class="fas fa-download"></i> Esporta
                    </button>
                    <button class="btn btn-outline-info" onclick="printCustomers()">
                        <i class="fas fa-print"></i> Stampa
                    </button>
                </div>
            </div>
        </div>

        <!-- Customers Table -->
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
                        <tbody id="customersTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                
                <div id="noCustomersMessage" class="text-center py-4" style="display: none;">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5>Nessun cliente trovato</h5>
                    <p class="text-muted">Inizia aggiungendo il tuo primo cliente</p>
                    <button class="btn btn-primary" onclick="openCustomerModal()">
                        <i class="fas fa-plus"></i> Aggiungi Cliente
                    </button>
                </div>
            </div>
        </div>

        <!-- Customer Modal -->
        <div class="modal fade" id="customerModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user"></i> <span id="customerModalTitle">Nuovo Cliente</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="customerForm">
                            <input type="hidden" id="customerId" value="">
                            
                            <div class="mb-3">
                                <label for="customerName" class="form-label">Nome *</label>
                                <input type="text" class="form-control" id="customerName" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="customerEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="customerEmail">
                            </div>
                            
                            <div class="mb-3">
                                <label for="customerPhone" class="form-label">Telefono</label>
                                <input type="tel" class="form-control" id="customerPhone">
                            </div>
                            
                            <div class="mb-3">
                                <label for="customerAddress" class="form-label">Indirizzo</label>
                                <textarea class="form-control" id="customerAddress" rows="2" placeholder="Via, numero civico..."></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="customerZipCode" class="form-label">CAP</label>
                                        <input type="text" class="form-control" id="customerZipCode" placeholder="00000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="customerCity" class="form-label">Città</label>
                                        <input type="text" class="form-control" id="customerCity" placeholder="Nome città">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="customerNotes" class="form-label">Note</label>
                                <textarea class="form-control" id="customerNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveCustomer()">
                            <i class="fas fa-save"></i> Salva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    initializeCustomerFields();
    renderCustomersTable();
}

// Inizializza i campi zipCode e city per i clienti esistenti
function initializeCustomerFields() {
    let updated = false;
    app.data.customers.forEach(customer => {
        if (!customer.hasOwnProperty('zipCode')) {
            customer.zipCode = '';
            updated = true;
        }
        if (!customer.hasOwnProperty('city')) {
            customer.city = '';
            updated = true;
        }
    });
    
    if (updated) {
        app.saveData();
    }
}

function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    const noDataMessage = document.getElementById('noCustomersMessage');
    
    if (!tbody) return;
    
    const customers = app.data.customers;
    
    if (customers.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }
    
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <strong>${customer.name}</strong>
                        ${customer.notes ? `<small class="text-muted d-block">${customer.notes}</small>` : ''}
                    </div>
                </div>
            </td>
            <td>${customer.email || '-'}</td>
            <td>${customer.phone || '-'}</td>
            <td>
                ${customer.address ? customer.address : '-'}
                ${customer.zipCode || customer.city ? `<br><small class="text-muted">${customer.zipCode || ''} ${customer.city || ''}</small>` : ''}
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editCustomer('${customer.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewCustomerOrders('${customer.id}')" title="Ordini">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCustomer('${customer.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openCustomerModal(customerId = null) {
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    const form = document.getElementById('customerForm');
    const title = document.getElementById('customerModalTitle');
    
    // Reset form
    form.reset();
    document.getElementById('customerId').value = '';
    
    if (customerId) {
        const customer = app.data.customers.find(c => c.id === customerId);
        if (customer) {
            title.textContent = 'Modifica Cliente';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerZipCode').value = customer.zipCode || '';
            document.getElementById('customerCity').value = customer.city || '';
            document.getElementById('customerNotes').value = customer.notes || '';
        }
    } else {
        title.textContent = 'Nuovo Cliente';
    }
    
    modal.show();
}

function saveCustomer() {
    const form = document.getElementById('customerForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const customerId = document.getElementById('customerId').value;
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        zipCode: document.getElementById('customerZipCode').value,
        city: document.getElementById('customerCity').value,
        notes: document.getElementById('customerNotes').value
    };
    
    if (customerId) {
        // Update existing customer
        const customerIndex = app.data.customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            app.data.customers[customerIndex] = {
                ...app.data.customers[customerIndex],
                ...customerData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new customer
        const newCustomer = {
            id: app.generateId(),
            ...customerData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        app.data.customers.push(newCustomer);
    }
    
    app.saveData('customers', app.data.customers);
    app.updateDashboard();
    renderCustomersTable();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
    modal.hide();
    
    app.showToast(customerId ? 'Cliente aggiornato con successo' : 'Cliente creato con successo', 'success');
}

function editCustomer(customerId) {
    openCustomerModal(customerId);
}

function deleteCustomer(customerId) {
    const customer = app.data.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    ConfirmationDialog.confirmDelete(customer.name, 'il cliente').then(confirmed => {
        if (confirmed) {
            app.data.customers = app.data.customers.filter(c => c.id !== customerId);
            app.saveData('customers', app.data.customers);
            app.updateDashboard();
            renderCustomersTable();
            app.showToast('Cliente eliminato con successo', 'success');
        }
    });
}

function viewCustomerOrders(customerId) {
    const customer = app.data.customers.find(c => c.id === customerId);
    const customerOrders = app.data.orders.filter(o => o.customerId === customerId);
    
    if (customerOrders.length === 0) {
        app.showToast(`Nessun ordine trovato per ${customer.name}`, 'info');
        return;
    }
    
    app.showToast(`${customer.name} ha ${customerOrders.length} ordini`, 'info');
    showPage('orders');
}

function filterCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const tbody = document.getElementById('customersTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function exportCustomers() {
    const data = app.data.customers.map(customer => ({
        Nome: customer.name,
        Email: customer.email || '',
        Telefono: customer.phone || '',
        Indirizzo: customer.address || '',
        Note: customer.notes || '',
        'Data Creazione': new Date(customer.createdAt).toLocaleDateString('it-IT')
    }));
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'clienti.csv');
    app.showToast('Clienti esportati con successo', 'success');
}

function printCustomers() {
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const printContent = `
        <html>
            <head>
                <title>Lista Clienti - ERP MallFarm</title>
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
                        <div>LISTA CLIENTI</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            Totale: ${app.data.customers.length} clienti
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
                        ${app.data.customers.map(customer => `
                            <tr>
                                <td>${customer.name}</td>
                                <td>${customer.email || '-'}</td>
                                <td>${customer.phone || '-'}</td>
                                <td>${customer.address || '-'}${customer.zipCode || customer.city ? '<br><small>' + (customer.zipCode || '') + ' ' + (customer.city || '') + '</small>' : ''}</td>
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

// Helper functions for CSV export
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}