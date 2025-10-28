// Inventory Management

// Helper function to get unit name
function getUnitName(unit) {
    if (!unit) return 'N/A';
    
    // Se abbiamo l'ID dell'unità, cerchiamo nei dati dell'app
    if (app.data.unitsOfMeasure) {
        const unitData = app.data.unitsOfMeasure.find(u => u.id === unit);
        if (unitData) return unitData.symbol;
    }
    
    // Fallback per unità legacy (per compatibilità)
    const unitNames = {
        'kg': 'kg',
        'q': 'q',
        't': 't',
        'm³': 'm³',
        'pz': 'pz',
        'sacco': 'sacchi'
    };
    
    return unitNames[unit] || unit;
}

function loadInventoryPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-warehouse"></i> Gestione Magazzino</h2>
                        <p class="text-muted">Traccia i movimenti di inventario e lo stock</p>
                    </div>
                    <button class="btn btn-primary" onclick="openInventoryModal()">
                        <i class="fas fa-plus"></i> Nuovo Movimento
                    </button>
                </div>
            </div>
        </div>

        <!-- Quick Stock Overview -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-bar"></i> Stock Prodotti</h5>
                    </div>
                    <div class="card-body">
                        <div class="row" id="stockOverviewCards">
                            <!-- Stock cards will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="inventorySearch" placeholder="Cerca movimenti..." onkeyup="filterInventory()">
                </div>
            </div>
            <div class="col-md-2">
                <select class="form-select" id="typeFilter" onchange="filterInventory()">
                    <option value="">Tutti i tipi</option>
                    <option value="carico">Carico</option>
                    <option value="scarico">Scarico</option>
                    <option value="reso">Reso</option>
                    <option value="perdita">Perdita</option>
                </select>
            </div>
            <div class="col-md-2">
                <select class="form-select" id="productFilter" onchange="filterInventory()">
                    <option value="">Tutti i prodotti</option>
                </select>
            </div>
            <div class="col-md-2">
                <input type="date" class="form-control" id="dateFromFilter" onchange="filterInventory()">
            </div>
            <div class="col-md-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" onclick="exportInventory()">
                        <i class="fas fa-download"></i> Esporta
                    </button>
                    <button class="btn btn-outline-info" onclick="printInventory()">
                        <i class="fas fa-print"></i> Stampa
                    </button>
                </div>
            </div>
        </div>

        <!-- Inventory Movements Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Prodotto</th>
                                <th>Tipo</th>
                                <th>Quantità</th>
                                <th>Fornitore</th>
                                <th>Note</th>
                                <th class="text-center">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                
                <div id="noInventoryMessage" class="text-center py-4" style="display: none;">
                    <i class="fas fa-warehouse fa-3x text-muted mb-3"></i>
                    <h5>Nessun movimento trovato</h5>
                    <p class="text-muted">Inizia registrando il tuo primo movimento</p>
                    <button class="btn btn-primary" onclick="openInventoryModal()">
                        <i class="fas fa-plus"></i> Nuovo Movimento
                    </button>
                </div>
            </div>
        </div>

        <!-- Inventory Movement Modal -->
        <div class="modal fade" id="inventoryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-boxes"></i> <span id="inventoryModalTitle">Nuovo Movimento</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="inventoryForm">
                            <input type="hidden" id="movementId" value="">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="movementDate" class="form-label">Data *</label>
                                        <input type="date" class="form-control" id="movementDate" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="movementType" class="form-label">Tipo Movimento *</label>
                                        <select class="form-select" id="movementType" required onchange="toggleSupplierField()">
                                            <option value="">Seleziona tipo</option>
                                            <option value="carico">Carico</option>
                                            <option value="scarico">Scarico</option>
                                            <option value="reso">Reso</option>
                                            <option value="perdita">Perdita</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="movementProduct" class="form-label">Prodotto *</label>
                                        <select class="form-select" id="movementProduct" required onchange="updateCurrentStock()">
                                            <option value="">Seleziona prodotto</option>
                                        </select>
                                        <small class="text-muted">Stock attuale: <span id="currentStock">-</span></small>
                                    </div>
                                </div>
                                <div class="col-md-6" id="supplierField">
                                    <div class="mb-3">
                                        <label for="movementSupplier" class="form-label">Fornitore</label>
                                        <select class="form-select" id="movementSupplier">
                                            <option value="">Seleziona fornitore</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="movementQuantity" class="form-label">Quantità *</label>
                                        <input type="number" class="form-control" id="movementQuantity" min="1" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="movementUnitPrice" class="form-label">Prezzo Unitario (€)</label>
                                        <input type="number" class="form-control" id="movementUnitPrice" step="0.01" min="0">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="movementTotal" class="form-label">Totale (€)</label>
                                        <input type="number" class="form-control" id="movementTotal" step="0.01" readonly>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="movementNotes" class="form-label">Note</label>
                                <textarea class="form-control" id="movementNotes" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveMovement()">
                            <i class="fas fa-save"></i> Salva Movimento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderStockOverview();
    renderInventoryTable();
    loadProductsForSelect();
    loadSuppliersForSelect();
}

function renderStockOverview() {
    const container = document.getElementById('stockOverviewCards');
    if (!container) return;
    
    if (app.data.products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center">Nessun prodotto in magazzino</p></div>';
        return;
    }
    
    container.innerHTML = app.data.products.map(product => {
        const stockLevel = product.stock <= product.minStock ? 'critical' : 
                          product.stock <= product.minStock * 2 ? 'low' : 'normal';
        
        const cardClass = stockLevel === 'critical' ? 'border-danger' : 
                         stockLevel === 'low' ? 'border-warning' : 'border-success';
        
        const badgeClass = stockLevel === 'critical' ? 'bg-danger' : 
                          stockLevel === 'low' ? 'bg-warning' : 'bg-success';
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
                <div class="card h-100 ${cardClass}">
                    <div class="card-body text-center">
                        <h6 class="card-title">${product.name}</h6>
                        <h3 class="mb-2">
                            <span class="badge ${badgeClass}">${product.stock}</span>
                        </h3>
                        <small class="text-muted">
                            Min: ${product.minStock} | ${getUnitName(product.unit)}
                        </small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="quickStock('${product.id}', 'carico')">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="quickStock('${product.id}', 'scarico')">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    const noDataMessage = document.getElementById('noInventoryMessage');
    
    if (!tbody) return;
    
    const movements = app.data.inventory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (movements.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }
    
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    tbody.innerHTML = movements.map(movement => {
        const product = app.data.products.find(p => p.id === movement.productId);
        const supplier = movement.supplierId ? app.data.suppliers.find(s => s.id === movement.supplierId) : null;
        const typeInfo = getMovementTypeInfo(movement.type);
        
        return `
            <tr>
                <td>${new Date(movement.date).toLocaleDateString('it-IT')}</td>
                <td>${product ? product.name : 'Prodotto sconosciuto'}</td>
                <td>
                    <span class="badge bg-${typeInfo.color}">
                        <i class="${typeInfo.icon}"></i> ${typeInfo.text}
                    </span>
                </td>
                <td>
                    <strong class="text-${movement.type === 'scarico' || movement.type === 'perdita' ? 'danger' : 'success'}">
                        ${movement.type === 'scarico' || movement.type === 'perdita' ? '-' : '+'}${movement.quantity}
                    </strong>
                    ${product ? ` ${getUnitName(product.unit)}` : ''}
                </td>
                <td>${supplier ? supplier.name : '-'}</td>
                <td>${movement.notes || '-'}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editMovement('${movement.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteMovement('${movement.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getMovementTypeInfo(type) {
    const typeMap = {
        'carico': { text: 'Carico', color: 'success', icon: 'fas fa-arrow-up' },
        'scarico': { text: 'Scarico', color: 'danger', icon: 'fas fa-arrow-down' },
        'reso': { text: 'Reso', color: 'warning', icon: 'fas fa-undo' },
        'perdita': { text: 'Perdita', color: 'dark', icon: 'fas fa-times' }
    };
    return typeMap[type] || { text: 'Sconosciuto', color: 'secondary', icon: 'fas fa-question' };
}

function loadProductsForSelect() {
    const select = document.getElementById('movementProduct');
    const filter = document.getElementById('productFilter');
    
    if (select) {
        select.innerHTML = '<option value="">Seleziona prodotto</option>';
        app.data.products.forEach(product => {
            select.innerHTML += `<option value="${product.id}">${product.name}</option>`;
        });
    }
    
    if (filter) {
        filter.innerHTML = '<option value="">Tutti i prodotti</option>';
        app.data.products.forEach(product => {
            filter.innerHTML += `<option value="${product.id}">${product.name}</option>`;
        });
    }
}

function loadSuppliersForSelect() {
    const select = document.getElementById('movementSupplier');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleziona fornitore</option>';
    app.data.suppliers.forEach(supplier => {
        select.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });
}

function openInventoryModal(movementId = null) {
    const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    const form = document.getElementById('inventoryForm');
    const title = document.getElementById('inventoryModalTitle');
    
    // Reset form
    form.reset();
    document.getElementById('movementId').value = '';
    document.getElementById('movementDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('currentStock').textContent = '-';
    
    loadProductsForSelect();
    loadSuppliersForSelect();
    toggleSupplierField();
    
    if (movementId) {
        const movement = app.data.inventory.find(m => m.id === movementId);
        if (movement) {
            title.textContent = 'Modifica Movimento';
            document.getElementById('movementId').value = movement.id;
            document.getElementById('movementDate').value = movement.date;
            document.getElementById('movementType').value = movement.type;
            document.getElementById('movementProduct').value = movement.productId;
            document.getElementById('movementSupplier').value = movement.supplierId || '';
            document.getElementById('movementQuantity').value = movement.quantity;
            document.getElementById('movementUnitPrice').value = movement.unitPrice || '';
            document.getElementById('movementTotal').value = movement.totalPrice || '';
            document.getElementById('movementNotes').value = movement.notes || '';
            
            updateCurrentStock();
            toggleSupplierField();
        }
    } else {
        title.textContent = 'Nuovo Movimento';
    }
    
    modal.show();
}

function toggleSupplierField() {
    const type = document.getElementById('movementType').value;
    const supplierField = document.getElementById('supplierField');
    
    if (type === 'carico') {
        supplierField.style.display = 'block';
    } else {
        supplierField.style.display = 'none';
        document.getElementById('movementSupplier').value = '';
    }
}

function updateCurrentStock() {
    const productId = document.getElementById('movementProduct').value;
    const stockSpan = document.getElementById('currentStock');
    
    if (productId) {
        const product = app.data.products.find(p => p.id === productId);
        if (product) {
            stockSpan.textContent = `${product.stock} ${getUnitName(product.unit)}`;
        }
    } else {
        stockSpan.textContent = '-';
    }
}

function quickStock(productId, type) {
    openInventoryModal();
    
    // Pre-fill the form for quick stock operation
    setTimeout(() => {
        document.getElementById('movementType').value = type;
        document.getElementById('movementProduct').value = productId;
        document.getElementById('movementQuantity').value = '1';
        
        updateCurrentStock();
        toggleSupplierField();
    }, 100);
}

function saveMovement() {
    const form = document.getElementById('inventoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const movementId = document.getElementById('movementId').value;
    const productId = document.getElementById('movementProduct').value;
    const type = document.getElementById('movementType').value;
    const quantity = parseInt(document.getElementById('movementQuantity').value);
    
    // Check if we have enough stock for scarico/perdita
    if ((type === 'scarico' || type === 'perdita') && !movementId) {
        const product = app.data.products.find(p => p.id === productId);
        if (product && product.stock < quantity) {
            app.showToast(`Stock insufficiente. Disponibile: ${product.stock}`, 'danger');
            return;
        }
    }
    
    const unitPrice = parseFloat(document.getElementById('movementUnitPrice').value) || 0;
    const totalPrice = quantity * unitPrice;
    
    const movementData = {
        date: document.getElementById('movementDate').value,
        type: type,
        productId: productId,
        supplierId: document.getElementById('movementSupplier').value || null,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        notes: document.getElementById('movementNotes').value
    };
    
    if (movementId) {
        // Update existing movement
        const movementIndex = app.data.inventory.findIndex(m => m.id === movementId);
        if (movementIndex !== -1) {
            // Revert old movement effect on stock
            const oldMovement = app.data.inventory[movementIndex];
            updateProductStock(oldMovement.productId, oldMovement.type, -oldMovement.quantity);
            
            // Apply new movement
            app.data.inventory[movementIndex] = {
                ...app.data.inventory[movementIndex],
                ...movementData,
                updatedAt: new Date().toISOString()
            };
            
            updateProductStock(productId, type, quantity);
        }
    } else {
        // Create new movement
        const newMovement = {
            id: app.generateId(),
            ...movementData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        app.data.inventory.push(newMovement);
        
        // Update product stock
        updateProductStock(productId, type, quantity);
    }
    
    app.saveData('inventory', app.data.inventory);
    app.saveData('products', app.data.products);
    app.updateDashboard();
    renderStockOverview();
    renderInventoryTable();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('inventoryModal'));
    modal.hide();
    
    app.showToast(movementId ? 'Movimento aggiornato con successo' : 'Movimento registrato con successo', 'success');
}

function updateProductStock(productId, type, quantity) {
    const productIndex = app.data.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        if (type === 'carico' || type === 'reso') {
            app.data.products[productIndex].stock += quantity;
        } else if (type === 'scarico' || type === 'perdita') {
            app.data.products[productIndex].stock -= quantity;
            // Ensure stock doesn't go negative
            if (app.data.products[productIndex].stock < 0) {
                app.data.products[productIndex].stock = 0;
            }
        }
        app.data.products[productIndex].updatedAt = new Date().toISOString();
    }
}

function editMovement(movementId) {
    openInventoryModal(movementId);
}

function deleteMovement(movementId) {
    const movement = app.data.inventory.find(m => m.id === movementId);
    if (!movement) return;
    
    const product = app.data.products.find(p => p.id === movement.productId);
    const movementDescription = `${movement.type === 'in' ? 'Carico' : 'Scarico'} di ${product?.name || 'prodotto'}`;
    
    ConfirmationDialog.confirmDelete(movementDescription, 'il movimento').then(confirmed => {
        if (confirmed) {
            // Revert movement effect on stock
            updateProductStock(movement.productId, movement.type, -movement.quantity);
            
            app.data.inventory = app.data.inventory.filter(m => m.id !== movementId);
            app.saveData('inventory', app.data.inventory);
            app.saveData('products', app.data.products);
            app.updateDashboard();
            renderStockOverview();
            renderInventoryTable();
            app.showToast('Movimento eliminato con successo', 'success');
        }
    });
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const productFilter = document.getElementById('productFilter').value;
    const dateFromFilter = document.getElementById('dateFromFilter').value;
    
    const tbody = document.getElementById('inventoryTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        let show = true;
        
        // Text search
        if (searchTerm && !text.includes(searchTerm)) {
            show = false;
        }
        
        // Type filter
        if (typeFilter) {
            const typeInfo = getMovementTypeInfo(typeFilter);
            if (!text.includes(typeInfo.text.toLowerCase())) {
                show = false;
            }
        }
        
        // Product filter - basic implementation
        if (productFilter) {
            const product = app.data.products.find(p => p.id === productFilter);
            if (product && !text.includes(product.name.toLowerCase())) {
                show = false;
            }
        }
        
        // Date filter - basic implementation
        if (dateFromFilter) {
            const filterDate = new Date(dateFromFilter).toLocaleDateString('it-IT');
            if (!text.includes(filterDate)) {
                show = false;
            }
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function exportInventory() {
    const data = app.data.inventory.map(movement => {
        const product = app.data.products.find(p => p.id === movement.productId);
        const supplier = movement.supplierId ? app.data.suppliers.find(s => s.id === movement.supplierId) : null;
        const typeInfo = getMovementTypeInfo(movement.type);
        
        return {
            Data: new Date(movement.date).toLocaleDateString('it-IT'),
            Prodotto: product ? product.name : 'Sconosciuto',
            Tipo: typeInfo.text,
            Quantità: movement.quantity,
            'Prezzo Unit. (€)': movement.unitPrice ? movement.unitPrice.toFixed(2) : '',
            'Totale (€)': movement.totalPrice ? movement.totalPrice.toFixed(2) : '',
            Fornitore: supplier ? supplier.name : '',
            Note: movement.notes || '',
            'Data Creazione': new Date(movement.createdAt).toLocaleDateString('it-IT')
        };
    });
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'movimenti-magazzino.csv');
    app.showToast('Movimenti esportati con successo', 'success');
}

function printInventory() {
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const printContent = `
        <html>
            <head>
                <title>Movimenti Magazzino - ERP MallFarm</title>
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
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #2d5a27; color: white; font-weight: bold; }
                    .carico { color: #28a745; }
                    .scarico { color: #dc3545; }
                    .reso { color: #ffc107; }
                    .perdita { color: #6c757d; }
                    .company-footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <img src="${logoSrc}" alt="Mall Farm Logo" ${isBase64 ? 'style="max-width: 150px; height: auto;"' : 'style="height: 60px;"'}>
                    </div>
                    <div class="document-title">
                        <div>MOVIMENTI MAGAZZINO</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            Totale: ${app.data.inventory.length} movimenti
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Prodotto</th>
                            <th>Tipo</th>
                            <th>Quantità</th>
                            <th>Fornitore</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${app.data.inventory.map(movement => {
                            const product = app.data.products.find(p => p.id === movement.productId);
                            const supplier = movement.supplierId ? app.data.suppliers.find(s => s.id === movement.supplierId) : null;
                            const typeInfo = getMovementTypeInfo(movement.type);
                            
                            return `
                                <tr>
                                    <td>${new Date(movement.date).toLocaleDateString('it-IT')}</td>
                                    <td>${product ? product.name : 'Sconosciuto'}</td>
                                    <td class="${movement.type}">${typeInfo.text}</td>
                                    <td>${movement.quantity} ${product ? getUnitName(product.unit) : ''}</td>
                                    <td>${supplier ? supplier.name : '-'}</td>
                                    <td>${movement.notes || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
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

// Auto-calculate total when quantity or unit price changes
document.addEventListener('DOMContentLoaded', function() {
    const quantityInput = document.getElementById('movementQuantity');
    const priceInput = document.getElementById('movementUnitPrice');
    const totalInput = document.getElementById('movementTotal');
    
    function calculateTotal() {
        if (quantityInput && priceInput && totalInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            totalInput.value = (quantity * price).toFixed(2);
        }
    }
    
    if (quantityInput) quantityInput.addEventListener('input', calculateTotal);
    if (priceInput) priceInput.addEventListener('input', calculateTotal);
});