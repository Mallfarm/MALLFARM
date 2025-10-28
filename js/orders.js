// Orders Management
function loadOrdersPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-file-invoice"></i> Gestione Ordini</h2>
                        <p class="text-muted">Gestisci gli ordini dei tuoi clienti</p>
                    </div>
                    <button class="btn btn-primary" onclick="openOrderModal()">
                        <i class="fas fa-plus"></i> Nuovo Ordine
                    </button>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4" id="ordersStatsCards">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i class="fas fa-file-invoice fa-2x mb-2"></i>
                        <h3 id="orders-total">0</h3>
                        <p class="mb-0">Ordini Ricevuti</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card success">
                    <div class="card-body text-center">
                        <i class="fas fa-check-circle fa-2x mb-2"></i>
                        <h3 id="orders-completed">0</h3>
                        <p class="mb-0">Ordini Completati</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card warning">
                    <div class="card-body text-center">
                        <i class="fas fa-times-circle fa-2x mb-2"></i>
                        <h3 id="orders-cancelled">0</h3>
                        <p class="mb-0">Ordini Annullati</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card info">
                    <div class="card-body text-center">
                        <i class="fas fa-euro-sign fa-2x mb-2"></i>
                        <h3 id="orders-revenue">€0</h3>
                        <p class="mb-0">Fatturato Totale</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="orderSearch" placeholder="Cerca ordini..." onkeyup="filterOrders()">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="statusFilter" onchange="filterOrders()">
                    <option value="">Tutti gli stati</option>
                    <option value="pending">In attesa</option>
                    <option value="confirmed">Confermato</option>
                    <option value="processing">In lavorazione</option>
                    <option value="shipped">Spedito</option>
                    <option value="delivered">Consegnato</option>
                    <option value="cancelled">Annullato</option>
                </select>
            </div>
            <div class="col-md-2">
                <input type="date" class="form-control" id="dateFilter" onchange="filterOrders()">
            </div>
            <div class="col-md-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" onclick="exportOrders()">
                        <i class="fas fa-download"></i> Esporta
                    </button>
                    <button class="btn btn-outline-info" onclick="printOrders()">
                        <i class="fas fa-print"></i> Stampa
                    </button>
                </div>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>N. Ordine</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Totale</th>
                                <th>Stato</th>
                                <th class="text-center">Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                
                <div id="noOrdersMessage" class="text-center py-4" style="display: none;">
                    <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                    <h5>Nessun ordine trovato</h5>
                    <p class="text-muted">Inizia creando il tuo primo ordine</p>
                    <button class="btn btn-primary" onclick="openOrderModal()">
                        <i class="fas fa-plus"></i> Crea Ordine
                    </button>
                </div>
            </div>
        </div>

        <!-- Order Modal -->
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-invoice"></i> <span id="orderModalTitle">Nuovo Ordine</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <input type="hidden" id="orderId" value="">
                            
                            <!-- Order Header -->
                            <div class="row mb-4">
                                <div class="col-md-4">
                                    <label for="orderCustomer" class="form-label">Cliente *</label>
                                    <select class="form-select" id="orderCustomer" required>
                                        <option value="">Seleziona cliente</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label for="orderDate" class="form-label">Data Ordine *</label>
                                    <input type="date" class="form-control" id="orderDate" required>
                                </div>
                                <div class="col-md-3">
                                    <label for="orderStatus" class="form-label">Stato</label>
                                    <select class="form-select" id="orderStatus">
                                        <option value="pending">In attesa</option>
                                        <option value="confirmed">Confermato</option>
                                        <option value="processing">In lavorazione</option>
                                        <option value="shipped">Spedito</option>
                                        <option value="delivered">Consegnato</option>
                                        <option value="cancelled">Annullato</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label for="orderNumber" class="form-label">N. Ordine</label>
                                    <input type="text" class="form-control" id="orderNumber" readonly>
                                </div>
                            </div>

                            <!-- Order Items -->
                            <div class="mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6><i class="fas fa-list"></i> Articoli Ordine</h6>
                                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="addOrderItem()">
                                        <i class="fas fa-plus"></i> Aggiungi Articolo
                                    </button>
                                </div>
                                
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Prodotto</th>
                                                <th>Quantità</th>
                                                <th>Prezzo Unit.</th>
                                                <th>Totale</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="orderItemsTable">
                                            <!-- Order items will be added here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Order Total -->
                            <div class="row mb-3">
                                <div class="col-md-8">
                                    <label for="orderNotes" class="form-label">Note</label>
                                    <textarea class="form-control" id="orderNotes" rows="3"></textarea>
                                </div>
                                <div class="col-md-4">
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <h6>Totale Ordine</h6>
                                            <h4 class="text-primary mb-0">€ <span id="orderTotal">0.00</span></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveOrder()">
                            <i class="fas fa-save"></i> Salva Ordine
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-eye"></i> Dettagli Ordine
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="orderDetailsContent">
                        <!-- Order details will be loaded here -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                        <button type="button" class="btn btn-primary" onclick="printOrderDetails()">
                            <i class="fas fa-print"></i> Stampa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    updateOrdersStatistics();
    renderOrdersTable();
    loadCustomersForSelect();
}

function updateOrdersStatistics() {
    const orders = app.data.orders || [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calcola statistiche generali
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => 
        order.status === 'delivered' || order.status === 'shipped'
    ).length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    // Ordini di questo mese
    const ordersThisMonth = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    // Calcola fatturato totale (escludendo ordini annullati)
    const totalRevenue = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Valore medio ordine
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    const averageOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
    
    // Percentuali
    const completedPercentage = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
    const cancelledPercentage = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;
    
    // Aggiorna i valori nell'interfaccia
    document.getElementById('orders-total').textContent = totalOrders;
    document.getElementById('orders-completed').textContent = completedOrders;
    document.getElementById('orders-cancelled').textContent = cancelledOrders;
    document.getElementById('orders-revenue').textContent = `€${totalRevenue.toFixed(2).replace('.', ',')}`;
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const noDataMessage = document.getElementById('noOrdersMessage');
    
    if (!tbody) return;
    
    const orders = app.data.orders;
    
    if (orders.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }
    
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    tbody.innerHTML = orders.map(order => {
        const customer = app.data.customers.find(c => c.id === order.customerId);
        const statusInfo = getOrderStatusInfo(order.status);
        
        return `
            <tr>
                <td>
                    <strong>${order.orderNumber}</strong>
                </td>
                <td>${customer ? customer.name : 'Cliente sconosciuto'}</td>
                <td>${new Date(order.date).toLocaleDateString('it-IT')}</td>
                <td><strong>€ ${order.total.toFixed(2)}</strong></td>
                <td>
                    <span class="badge bg-${statusInfo.color}">${statusInfo.text}</span>
                </td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info" onclick="viewOrderDetails('${order.id}')" title="Dettagli">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editOrder('${order.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="generateDeliveryNote('${order.id}')" title="Documento di Trasporto">
                            <i class="fas fa-truck"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="printOrder('${order.id}')" title="Stampa">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteOrder('${order.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getOrderStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'In attesa', color: 'warning' },
        'confirmed': { text: 'Confermato', color: 'info' },
        'processing': { text: 'In lavorazione', color: 'primary' },
        'shipped': { text: 'Spedito', color: 'secondary' },
        'delivered': { text: 'Consegnato', color: 'success' },
        'cancelled': { text: 'Annullato', color: 'danger' }
    };
    return statusMap[status] || { text: 'Sconosciuto', color: 'dark' };
}

function loadCustomersForSelect() {
    const select = document.getElementById('orderCustomer');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleziona cliente</option>';
    app.data.customers.forEach(customer => {
        select.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });
}

function openOrderModal(orderId = null) {
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    const form = document.getElementById('orderForm');
    const title = document.getElementById('orderModalTitle');
    
    // Reset form
    form.reset();
    document.getElementById('orderId').value = '';
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderItemsTable').innerHTML = '';
    updateOrderTotal();
    
    loadCustomersForSelect();
    
    if (orderId) {
        const order = app.data.orders.find(o => o.id === orderId);
        if (order) {
            title.textContent = 'Modifica Ordine';
            document.getElementById('orderId').value = order.id;
            document.getElementById('orderCustomer').value = order.customerId;
            document.getElementById('orderDate').value = order.date;
            document.getElementById('orderStatus').value = order.status;
            document.getElementById('orderNumber').value = order.orderNumber;
            document.getElementById('orderNotes').value = order.notes || '';
            
            // Load order items
            order.items.forEach(item => {
                addOrderItem(item);
            });
            updateOrderTotal();
        }
    } else {
        title.textContent = 'Nuovo Ordine';
        document.getElementById('orderNumber').value = generateOrderNumber();
        addOrderItem(); // Add first empty item
    }
    
    modal.show();
}

function generateOrderNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${year}${month}${day}${random}`;
}

function addOrderItem(item = null) {
    const tbody = document.getElementById('orderItemsTable');
    const itemIndex = tbody.children.length;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-select form-select-sm" id="item_product_${itemIndex}" onchange="updateItemPrice(${itemIndex})">
                <option value="">Seleziona prodotto</option>
                ${app.data.products.map(product => 
                    `<option value="${product.id}" data-price="${product.price}" ${item && item.productId === product.id ? 'selected' : ''}>
                        ${product.name} - €${product.price.toFixed(2)}
                    </option>`
                ).join('')}
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" id="item_quantity_${itemIndex}" 
                   value="${item ? item.quantity : 1}" min="1" onchange="updateItemTotal(${itemIndex})">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" id="item_price_${itemIndex}" 
                   value="${item ? item.unitPrice : 0}" step="0.01" min="0" onchange="updateItemTotal(${itemIndex})">
        </td>
        <td>
            <strong>€ <span id="item_total_${itemIndex}">0.00</span></strong>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOrderItem(${itemIndex})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    if (item) {
        updateItemTotal(itemIndex);
    }
}

function updateItemPrice(itemIndex) {
    const productSelect = document.getElementById(`item_product_${itemIndex}`);
    const priceInput = document.getElementById(`item_price_${itemIndex}`);
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
        priceInput.value = selectedOption.dataset.price;
        updateItemTotal(itemIndex);
    }
}

function updateItemTotal(itemIndex) {
    const quantity = parseFloat(document.getElementById(`item_quantity_${itemIndex}`).value) || 0;
    const price = parseFloat(document.getElementById(`item_price_${itemIndex}`).value) || 0;
    const total = quantity * price;
    
    document.getElementById(`item_total_${itemIndex}`).textContent = total.toFixed(2);
    updateOrderTotal();
}

function removeOrderItem(itemIndex) {
    const tbody = document.getElementById('orderItemsTable');
    const row = tbody.children[itemIndex];
    if (row) {
        row.remove();
        updateOrderTotal();
    }
}

function updateOrderTotal() {
    const tbody = document.getElementById('orderItemsTable');
    let total = 0;
    
    for (let i = 0; i < tbody.children.length; i++) {
        const itemTotalElement = document.getElementById(`item_total_${i}`);
        if (itemTotalElement) {
            total += parseFloat(itemTotalElement.textContent) || 0;
        }
    }
    
    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

function saveOrder() {
    const form = document.getElementById('orderForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const orderId = document.getElementById('orderId').value;
    const tbody = document.getElementById('orderItemsTable');
    
    // Collect order items
    const items = [];
    for (let i = 0; i < tbody.children.length; i++) {
        const productId = document.getElementById(`item_product_${i}`).value;
        const quantity = parseFloat(document.getElementById(`item_quantity_${i}`).value);
        const unitPrice = parseFloat(document.getElementById(`item_price_${i}`).value);
        
        if (productId && quantity > 0 && unitPrice >= 0) {
            items.push({
                productId,
                quantity,
                unitPrice,
                total: quantity * unitPrice
            });
        }
    }
    
    if (items.length === 0) {
        app.showToast('Aggiungi almeno un articolo all\'ordine', 'warning');
        return;
    }
    
    const total = items.reduce((sum, item) => sum + item.total, 0);
    
    const orderData = {
        orderNumber: document.getElementById('orderNumber').value,
        customerId: document.getElementById('orderCustomer').value,
        date: document.getElementById('orderDate').value,
        status: document.getElementById('orderStatus').value,
        notes: document.getElementById('orderNotes').value,
        items,
        total
    };
    
    if (orderId) {
        // Update existing order
        const orderIndex = app.data.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            app.data.orders[orderIndex] = {
                ...app.data.orders[orderIndex],
                ...orderData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new order
        const newOrder = {
            id: app.generateId(),
            ...orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        app.data.orders.push(newOrder);
    }
    
    app.saveData('orders', app.data.orders);
    app.updateDashboard();
    updateOrdersStatistics();
    renderOrdersTable();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    modal.hide();
    
    app.showToast(orderId ? 'Ordine aggiornato con successo' : 'Ordine creato con successo', 'success');
}

function editOrder(orderId) {
    openOrderModal(orderId);
}

function deleteOrder(orderId) {
    const order = app.data.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const orderNumber = order.orderNumber || `#${orderId}`;
    ConfirmationDialog.confirmDelete(orderNumber, 'l\'ordine').then(confirmed => {
        if (confirmed) {
            app.data.orders = app.data.orders.filter(o => o.id !== orderId);
            app.saveData('orders', app.data.orders);
            app.updateDashboard();
            updateOrdersStatistics();
            renderOrdersTable();
            app.showToast('Ordine eliminato con successo', 'success');
        }
    });
}

function viewOrderDetails(orderId) {
    const order = app.data.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const customer = app.data.customers.find(c => c.id === order.customerId);
    const statusInfo = getOrderStatusInfo(order.status);
    
    const detailsContent = `
        <div class="row">
            <div class="col-md-6">
                <h6>Informazioni Ordine</h6>
                <table class="table table-sm">
                    <tr><td><strong>Numero:</strong></td><td>${order.orderNumber}</td></tr>
                    <tr><td><strong>Data:</strong></td><td>${new Date(order.date).toLocaleDateString('it-IT')}</td></tr>
                    <tr><td><strong>Stato:</strong></td><td><span class="badge bg-${statusInfo.color}">${statusInfo.text}</span></td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Cliente</h6>
                <table class="table table-sm">
                    <tr><td><strong>Nome:</strong></td><td>${customer ? customer.name : 'Sconosciuto'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${customer ? customer.email || '-' : '-'}</td></tr>
                    <tr><td><strong>Telefono:</strong></td><td>${customer ? customer.phone || '-' : '-'}</td></tr>
                </table>
            </div>
        </div>
        
        <h6>Articoli</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Prodotto</th>
                        <th>Quantità</th>
                        <th>Prezzo Unitario</th>
                        <th>Totale</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => {
                        const product = app.data.products.find(p => p.id === item.productId);
                        return `
                            <tr>
                                <td>${product ? product.name : 'Prodotto sconosciuto'}</td>
                                <td>${item.quantity}</td>
                                <td>€ ${item.unitPrice.toFixed(2)}</td>
                                <td><strong>€ ${item.total.toFixed(2)}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="table-secondary">
                        <td colspan="3"><strong>Totale Ordine</strong></td>
                        <td><strong>€ ${order.total.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        ${order.notes ? `
            <h6>Note</h6>
            <p class="text-muted">${order.notes}</p>
        ` : ''}
    `;
    
    document.getElementById('orderDetailsContent').innerHTML = detailsContent;
    
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function printOrder(orderId) {
    const order = app.data.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const customer = app.data.customers.find(c => c.id === order.customerId);
    const statusInfo = getOrderStatusInfo(order.status);
    
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const printContent = `
        <html>
            <head>
                <title>Ordine ${order.orderNumber} - ERP MallFarm</title>
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
                    .order-info { margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .customer-info { margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #2d5a27; color: white; font-weight: bold; }
                    .total-row { background-color: #e9ecef; font-weight: bold; }
                    .company-footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <img src="${logoSrc}" alt="Mall Farm Logo" ${isBase64 ? 'style="max-width: 150px; height: auto;"' : 'style="height: 60px;"'}>
                    </div>
                    <div class="document-title">
                        <div>ORDINE N. ${order.orderNumber}</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            ${statusInfo.text}
                        </div>
                    </div>
                </div>
                
                <div class="order-info">
                    <strong>Data Ordine:</strong> ${new Date(order.date).toLocaleDateString('it-IT')}<br>
                    <strong>Stato:</strong> ${statusInfo.text}
                </div>
                
                <div class="customer-info">
                    <h3>Cliente</h3>
                    <strong>${customer ? customer.name : 'Cliente sconosciuto'}</strong><br>
                    ${customer && customer.address ? customer.address + '<br>' : ''}
                    ${customer && customer.phone ? 'Tel: ' + customer.phone + '<br>' : ''}
                    ${customer && customer.email ? 'Email: ' + customer.email : ''}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Prodotto</th>
                            <th>Quantità</th>
                            <th>Prezzo Unit.</th>
                            <th>Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => {
                            const product = app.data.products.find(p => p.id === item.productId);
                            return `
                                <tr>
                                    <td>${product ? product.name : 'Prodotto sconosciuto'}</td>
                                    <td>${item.quantity}</td>
                                    <td>€ ${item.unitPrice.toFixed(2)}</td>
                                    <td>€ ${item.total.toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                        <tr class="total-row">
                            <td colspan="3">Totale Ordine</td>
                            <td>€ ${order.total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                ${order.notes ? `<div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 20px;"><strong>Note:</strong><br>${order.notes}</div>` : ''}
                
                <div class="company-footer">
                    <p>Documento generato automaticamente il ${new Date().toLocaleString('it-IT')}</p>
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

function printOrderDetails() {
    // This would print the currently viewed order details
    // Implementation would be similar to printOrder
    app.showToast('Funzione di stampa dettagli in fase di sviluppo', 'info');
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    const tbody = document.getElementById('ordersTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        let show = true;
        
        // Text search
        if (searchTerm && !text.includes(searchTerm)) {
            show = false;
        }
        
        // Status filter
        if (statusFilter) {
            const statusInfo = getOrderStatusInfo(statusFilter);
            if (!text.includes(statusInfo.text.toLowerCase())) {
                show = false;
            }
        }
        
        // Date filter - this would need more sophisticated implementation
        // For now, just a basic check
        if (dateFilter && !text.includes(new Date(dateFilter).toLocaleDateString('it-IT'))) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function exportOrders() {
    const data = app.data.orders.map(order => {
        const customer = app.data.customers.find(c => c.id === order.customerId);
        const statusInfo = getOrderStatusInfo(order.status);
        
        return {
            'N. Ordine': order.orderNumber,
            Cliente: customer ? customer.name : 'Sconosciuto',
            Data: new Date(order.date).toLocaleDateString('it-IT'),
            'Totale (€)': order.total.toFixed(2),
            Stato: statusInfo.text,
            Note: order.notes || '',
            'Data Creazione': new Date(order.createdAt).toLocaleDateString('it-IT')
        };
    });
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'ordini.csv');
    app.showToast('Ordini esportati con successo', 'success');
}

function printOrders() {
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const printContent = `
        <html>
            <head>
                <title>Lista Ordini - ERP MallFarm</title>
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
                        <div>LISTA ORDINI</div>
                        <div style="font-size: 14px; color: #666; margin-top: 5px;">
                            Totale: ${app.data.orders.length} ordini
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>N. Ordine</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Totale</th>
                            <th>Stato</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${app.data.orders.map(order => {
                            const customer = app.data.customers.find(c => c.id === order.customerId);
                            const statusInfo = getOrderStatusInfo(order.status);
                            
                            return `
                                <tr>
                                    <td>${order.orderNumber}</td>
                                    <td>${customer ? customer.name : 'Sconosciuto'}</td>
                                    <td>${new Date(order.date).toLocaleDateString('it-IT')}</td>
                                    <td>€ ${order.total.toFixed(2)}</td>
                                    <td>${statusInfo.text}</td>
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