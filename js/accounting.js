// Accounting Page - Gestione Contabilità
function loadAccountingPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2><i class="fas fa-calculator"></i> Contabilità</h2>
                        <p class="text-muted mb-0">Gestione completa fatturato, costi e ricavi</p>
                    </div>
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <!-- Filtri -->
                        <div class="card shadow-sm" style="border-left: 4px solid var(--primary-color);">
                            <div class="card-body p-2">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="text-muted small me-2">
                                        <i class="fas fa-filter"></i> <strong>Filtra per:</strong>
                                    </div>
                                    <select class="form-select form-select-sm shadow-sm" id="filterMonth" onchange="applyAccountingFilters()" 
                                            style="width: 140px; border-color: #dee2e6;">
                                        <option value="">📅 Tutti i mesi</option>
                                        <option value="01">Gennaio</option>
                                        <option value="02">Febbraio</option>
                                        <option value="03">Marzo</option>
                                        <option value="04">Aprile</option>
                                        <option value="05">Maggio</option>
                                        <option value="06">Giugno</option>
                                        <option value="07">Luglio</option>
                                        <option value="08">Agosto</option>
                                        <option value="09">Settembre</option>
                                        <option value="10">Ottobre</option>
                                        <option value="11">Novembre</option>
                                        <option value="12">Dicembre</option>
                                    </select>
                                    <select class="form-select form-select-sm shadow-sm" id="filterYear" onchange="applyAccountingFilters()" 
                                            style="width: 110px; border-color: #dee2e6;">
                                        <option value="">📆 Tutti</option>
                                    </select>
                                    <button class="btn btn-sm btn-outline-secondary shadow-sm" onclick="clearAccountingFilters()" 
                                            title="Rimuovi filtri" style="border-radius: 6px;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pulsanti Azioni -->
                        <div class="btn-group shadow-sm" role="group">
                            <button class="btn btn-danger btn-sm" onclick="openCostModal()" style="border-radius: 6px 0 0 6px;">
                                <i class="fas fa-minus-circle"></i> Registra Costo
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="exportAccountingReport()" style="border-radius: 0 6px 6px 0;">
                                <i class="fas fa-file-export"></i> Esporta Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Summary Cards Row -->
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card success">
                    <div class="card-body text-center">
                        <i class="fas fa-arrow-up fa-2x mb-2"></i>
                        <h3 id="total-income">€0</h3>
                        <p class="mb-0">Ricavi Totali</p>
                        <small class="opacity-75">Caricamenti + Ordini</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card danger">
                    <div class="card-body text-center">
                        <i class="fas fa-arrow-down fa-2x mb-2"></i>
                        <h3 id="total-expenses">€0</h3>
                        <p class="mb-0">Costi Totali</p>
                                                <small class="opacity-75">Tutte le spese</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i class="fas fa-balance-scale fa-2x mb-2"></i>
                        <h3 id="net-profit">€0</h3>
                        <p class="mb-0">Profitto Netto</p>
                        <small class="opacity-75">Ricavi - Costi</small>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card stat-card info">
                    <div class="card-body text-center">
                        <i class="fas fa-percentage fa-2x mb-2"></i>
                        <h3 id="profit-margin">0%</h3>
                        <p class="mb-0">Margine</p>
                        <small class="opacity-75">Profitto/Ricavi</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Monthly Analysis -->
        <div class="row mb-4">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5><i class="fas fa-chart-line"></i> Analisi Mensile</h5>
                            <div>
                                <select class="form-select form-select-sm" id="monthFilter" onchange="filterByMonth()">
                                    <option value="">Tutti i mesi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="monthlyAnalysis"></div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-pie"></i> Ripartizione Costi</h5>
                    </div>
                    <div class="card-body">
                        <div id="costBreakdown"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Tables -->
        <div class="row mb-4">
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-fire text-success"></i> Ricavi da Caricamenti Caldaie</h5>
                    </div>
                    <div class="card-body">
                        <div id="loadRevenueTable"></div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-shopping-cart text-info"></i> Ricavi da Ordini Consegnati</h5>
                    </div>
                    <div class="card-body">
                        <div id="orderRevenueTable"></div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-minus-circle text-danger"></i> Costi Sostenuti</h5>
                    </div>
                    <div class="card-body">
                        <div id="expensesTable"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Wait for DOM to be updated before rendering components
    setTimeout(() => {
        populateYearFilter(); // Populate year filter first
        renderAccountingDashboard();
        renderMonthlyAnalysis();
        renderCostBreakdown();
        renderLoadRevenueTable();
        renderOrderRevenueTable();
        renderExpensesTable();
        populateMonthFilter();
        
        // Apply default filter (current year)
        applyAccountingFilters();
    }, 10);
}

// Render Accounting Dashboard
function renderAccountingDashboard() {
    const loads = getAllLoads();
    const orders = getAllOrders();
    const costs = getCosts();
    
    // Calculate income from boiler loads (€15 each)
    const loadIncome = loads.reduce((sum, load) => sum + (load.amount || 15), 0);
    
    // Calculate income from regular orders
    const orderIncome = orders.reduce((sum, order) => {
        if (order.status === 'completato' || order.status === 'delivered') {
            return sum + (order.total || 0);
        }
        return sum;
    }, 0);
    
    const totalIncome = loadIncome + orderIncome;
    const totalExpenses = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
    
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netProfitEl = document.getElementById('net-profit');
    const profitMarginEl = document.getElementById('profit-margin');
    
    if (totalIncomeEl) totalIncomeEl.textContent = `€${totalIncome.toFixed(2)}`;
    if (totalExpensesEl) totalExpensesEl.textContent = `€${totalExpenses.toFixed(2)}`;
    if (netProfitEl) netProfitEl.textContent = `€${netProfit.toFixed(2)}`;
    if (profitMarginEl) profitMarginEl.textContent = `${profitMargin.toFixed(1)}%`;
    
    // Update profit card color
    if (netProfitEl) {
        const profitCard = netProfitEl.closest('.card');
        if (profitCard) {
            profitCard.className = netProfit >= 0 ? 'card stat-card success' : 'card stat-card danger';
        }
    }
}

// Render Monthly Analysis
function renderMonthlyAnalysis() {
    const loads = getAllLoads();
    const orders = getAllOrders();
    const costs = getCosts();
    const monthlyData = {};
    
    // Group loads by month
    loads.forEach(load => {
        const date = new Date(load.date || load.datetime);
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { loadRevenue: 0, orderRevenue: 0, expenses: 0, loads: 0, orders: 0 };
        }
        monthlyData[monthKey].loadRevenue += load.amount || 15;
        monthlyData[monthKey].loads += 1;
    });
    
    // Group orders by month
    orders.forEach(order => {
        if ((order.status === 'completato' || order.status === 'delivered') && order.date) {
            const date = new Date(order.date);
            const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { loadRevenue: 0, orderRevenue: 0, expenses: 0, loads: 0, orders: 0 };
            }
            monthlyData[monthKey].orderRevenue += order.total || 0;
            monthlyData[monthKey].orders += 1;
        }
    });
    
    // Group costs by month
    costs.forEach(cost => {
        const monthKey = cost.date.substring(0, 7);
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { loadRevenue: 0, orderRevenue: 0, expenses: 0, loads: 0, orders: 0 };
        }
        monthlyData[monthKey].expenses += cost.amount;
    });
    
    const container = document.getElementById('monthlyAnalysis');
    if (!container) return;
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    
    if (sortedMonths.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessun dato disponibile</h5>
                <p class="text-muted">Inizia registrando caricamenti e costi</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Mese</th>
                        <th>Caricamenti</th>
                        <th>Ordini</th>
                        <th class="text-light">Ricavi Caricamenti</th>
                        <th class="text-light">Ricavi Ordini</th>
                        <th>Costi</th>
                        <th>Profitto</th>
                        <th>Margine</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    sortedMonths.forEach(monthKey => {
        const data = monthlyData[monthKey];
        const totalRevenue = data.loadRevenue + data.orderRevenue;
        const profit = totalRevenue - data.expenses;
        const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;
        const date = new Date(monthKey + '-01');
        
        html += `
            <tr>
                <td><strong>${date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}</strong></td>
                <td>${data.loads}</td>
                <td>${data.orders}</td>
                <td class="text-success"><strong>€${data.loadRevenue.toFixed(2)}</strong></td>
                <td class="text-info"><strong>€${data.orderRevenue.toFixed(2)}</strong></td>
                <td class="text-danger">€${data.expenses.toFixed(2)}</td>
                <td class="${profit >= 0 ? 'text-success' : 'text-danger'}"><strong>€${profit.toFixed(2)}</strong></td>
                <td class="${margin >= 0 ? 'text-success' : 'text-danger'}">${margin.toFixed(1)}%</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Render Cost Breakdown
function renderCostBreakdown() {
    const costs = getCosts();
    const costsByCategory = {};
    
    costs.forEach(cost => {
        if (!costsByCategory[cost.category]) {
            costsByCategory[cost.category] = 0;
        }
        costsByCategory[cost.category] += cost.amount;
    });
    
    const container = document.getElementById('costBreakdown');
    if (!container) return;
    
    const totalCosts = Object.values(costsByCategory).reduce((sum, amount) => sum + amount, 0);
    
    if (totalCosts === 0) {
        container.innerHTML = `
            <div class="text-center">
                <i class="fas fa-chart-pie text-muted mb-2"></i>
                <p class="text-muted mb-0">Nessun costo registrato</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    Object.entries(costsByCategory).forEach(([category, amount]) => {
        const percentage = (amount / totalCosts) * 100;
        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${category}</span>
                <div class="text-end">
                    <div><strong>€${amount.toFixed(2)}</strong></div>
                    <small class="text-muted">${percentage.toFixed(1)}%</small>
                </div>
            </div>
            <div class="progress mb-3" style="height: 6px;">
                <div class="progress-bar bg-danger" style="width: ${percentage}%"></div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render Load Revenue Table (Caricamenti Caldaie)
function renderLoadRevenueTable() {
    const loads = getAllLoads().sort((a, b) => new Date(b.date || b.datetime) - new Date(a.date || a.datetime));
    const container = document.getElementById('loadRevenueTable');
    if (!container) return;
    
    if (loads.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-inbox text-muted"></i>
                <p class="text-muted mb-0">Nessun ricavo registrato</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Caldaia</th>
                        <th>Quantità</th>
                        <th>Importo</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    loads.slice(0, 20).forEach(load => {
        const boiler = getBoiler(load.boilerId);
        const loadDate = load.date || load.datetime || new Date().toISOString();
        html += `
            <tr>
                <td>${new Date(loadDate).toLocaleDateString('it-IT')}</td>
                <td>${boiler ? boiler.code : 'N/A'}</td>
                <td>${load.quantity}q</td>
                <td class="text-success"><strong>€${(load.amount || 15).toFixed(2)}</strong></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    if (loads.length > 20) {
        html += `<small class="text-muted">Visualizzati i primi 20 ricavi su ${loads.length} totali</small>`;
    }
    
    container.innerHTML = html;
}

// Render Order Revenue Table (Ordini Consegnati)
function renderOrderRevenueTable() {
    const orders = getAllOrders().filter(order => 
        order.status === 'delivered' || order.status === 'completato'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('orderRevenueTable');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-inbox text-muted"></i>
                <p class="text-muted mb-0">Nessun ordine consegnato</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Totale</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    orders.slice(0, 20).forEach(order => {
        const customer = app.data.customers.find(c => c.id === order.customerId);
        const customerName = customer ? customer.name : 'N/A';
        
        html += `
            <tr>
                <td>${new Date(order.date).toLocaleDateString('it-IT')}</td>
                <td>${customerName}</td>
                <td class="text-info"><strong>€${(order.total || 0).toFixed(2)}</strong></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    if (orders.length > 20) {
        html += `<small class="text-muted">Visualizzati i primi 20 ordini su ${orders.length} totali</small>`;
    }
    
    container.innerHTML = html;
}

// Render Expenses Table
function renderExpensesTable(showAll = false) {
    const costs = getCosts().sort((a, b) => new Date(b.date) - new Date(a.date));
    const container = document.getElementById('expensesTable');
    if (!container) return;
    
    if (costs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-inbox text-muted"></i>
                <p class="text-muted mb-0">Nessun costo registrato</p>
                <button class="btn btn-sm btn-primary mt-2" onclick="openCostModal()">
                    <i class="fas fa-plus"></i> Aggiungi Primo Costo
                </button>
            </div>
        `;
        return;
    }
    
    const displayLimit = showAll ? costs.length : 20;
    const costsToShow = costs.slice(0, displayLimit);
    
    let html = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Categoria</th>
                        <th>Descrizione</th>
                        <th>Importo</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    costsToShow.forEach(cost => {
        html += `
            <tr>
                <td>${new Date(cost.date).toLocaleDateString()}</td>
                <td><span class="badge bg-secondary">${cost.category}</span></td>
                <td>${cost.description || '-'}</td>
                <td class="text-danger"><strong>€${cost.amount.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCost('${cost.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    if (costs.length > 20 && !showAll) {
        html += `
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Visualizzati i primi 20 costi su ${costs.length} totali</small>
                <button class="btn btn-sm btn-outline-primary" onclick="renderExpensesTable(true)">
                    <i class="fas fa-list"></i> Mostra tutti (${costs.length})
                </button>
            </div>
        `;
    } else if (showAll && costs.length > 20) {
        html += `
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Visualizzati tutti i ${costs.length} costi</small>
                <button class="btn btn-sm btn-outline-secondary" onclick="renderExpensesTable(false)">
                    <i class="fas fa-compress"></i> Mostra meno
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Populate Month Filter
function populateMonthFilter() {
    const loads = getAllLoads();
    const costs = getCosts();
    const months = new Set();
    
    loads.forEach(load => {
        const date = new Date(load.datetime);
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        months.add(monthKey);
    });
    
    costs.forEach(cost => {
        const monthKey = cost.date.substring(0, 7);
        months.add(monthKey);
    });
    
    const select = document.getElementById('monthFilter');
    if (!select) return;
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    sortedMonths.forEach(monthKey => {
        const date = new Date(monthKey + '-01');
        const option = document.createElement('option');
        option.value = monthKey;
        option.textContent = date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long' });
        select.appendChild(option);
    });
}

// Open Cost Modal
function openCostModal() {
    const modalHtml = `
        <div class="modal fade" id="costModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-minus-circle"></i> Registra Nuovo Costo
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="costForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Data *</label>
                                        <input type="date" class="form-control" id="costDate" 
                                               value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Importo (€) *</label>
                                        <input type="number" class="form-control" id="costAmount" 
                                               min="0" step="0.01" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Categoria *</label>
                                <select class="form-select" id="costCategory" required>
                                    <option value="">-- Seleziona categoria --</option>
                                    <option value="Carburante">Carburante</option>
                                    <option value="Manutenzione">Manutenzione</option>
                                    <option value="Personale">Personale</option>
                                    <option value="Assicurazione">Assicurazione</option>
                                    <option value="Materiali">Materiali</option>
                                    <option value="Trasporti">Trasporti</option>
                                    <option value="Altro">Altro</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Descrizione</label>
                                <input type="text" class="form-control" id="costDescription" 
                                       placeholder="Descrizione dettagliata del costo...">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Note</label>
                                <textarea class="form-control" id="costNotes" rows="2" 
                                          placeholder="Note aggiuntive..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-danger" onclick="saveCost()">
                            <i class="fas fa-save"></i> Registra Costo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('costModal'));
    modal.show();
    
    document.getElementById('costModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Save Cost
function saveCost() {
    const form = document.getElementById('costForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const costData = {
        id: 'cost_' + Date.now(),
        date: document.getElementById('costDate').value,
        amount: parseFloat(document.getElementById('costAmount').value),
        category: document.getElementById('costCategory').value,
        description: document.getElementById('costDescription').value,
        notes: document.getElementById('costNotes').value,
        createdAt: new Date().toISOString()
    };
    
    // Use app data if available, otherwise localStorage
    if (typeof app !== 'undefined' && app.data) {
        app.data.boilerCosts.push(costData);
        app.saveData();
    } else {
        const costs = getCosts();
        costs.push(costData);
        localStorage.setItem('boilerCosts', JSON.stringify(costs));
    }
    
    bootstrap.Modal.getInstance(document.getElementById('costModal')).hide();
    
    // Refresh all displays
    renderAccountingDashboard();
    renderMonthlyAnalysis();
    renderCostBreakdown();
    renderExpensesTable();
    
    showToast(`Costo di €${costData.amount.toFixed(2)} registrato con successo`, 'success');
}

// Delete Cost
function deleteCost(costId) {
    const cost = app.data?.boilerCosts?.find(c => c.id === costId);
    if (!cost) return;
    
    const costDescription = `${cost.description} - €${cost.amount.toFixed(2)}`;
    ConfirmationDialog.confirmDelete(costDescription, 'il costo').then(confirmed => {
        if (!confirmed) return;
        
        // Use app data if available, otherwise localStorage
        if (typeof app !== 'undefined' && app.data) {
            app.data.boilerCosts = app.data.boilerCosts.filter(c => c.id !== costId);
            app.saveData();
        } else {
            const costs = getCosts().filter(c => c.id !== costId);
            localStorage.setItem('boilerCosts', JSON.stringify(costs));
        }
        
        // Refresh all displays
        renderAccountingDashboard();
        renderMonthlyAnalysis();
        renderCostBreakdown();
        renderExpensesTable();
        
        showToast('Costo eliminato con successo', 'success');
    });
}

// Filter by Month
function filterByMonth() {
    const selectedMonth = document.getElementById('monthFilter').value;
    // Implementation for filtering would go here
    // For now, just refresh the displays
    renderMonthlyAnalysis();
}

// Export Accounting Report
function exportAccountingReport() {
    const loads = getAllLoads();
    const orders = getAllOrders().filter(order => 
        order.status === 'delivered' || order.status === 'completato'
    );
    const costs = getCosts();
    
    const loadRevenue = loads.reduce((sum, load) => sum + (load.amount || 15), 0);
    const orderRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalRevenue = loadRevenue + orderRevenue;
    const totalExpenses = costs.reduce((sum, cost) => sum + cost.amount, 0);
    
    const reportData = {
        generatedAt: new Date().toISOString(),
        loadRevenue: loadRevenue,
        orderRevenue: orderRevenue,
        totalRevenue: totalRevenue,
        totalExpenses: totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        loads: loads.length,
        orders: orders.length,
        costs: costs.length
    };
    
    const csvData = [
        ['REPORT CONTABILITÀ ERP MALLFARM'],
        ['Generato il:', new Date().toLocaleDateString('it-IT')],
        [''],
        ['RIEPILOGO'],
        ['Ricavi da Caricamenti', `€${reportData.loadRevenue.toFixed(2)}`],
        ['Ricavi da Ordini', `€${reportData.orderRevenue.toFixed(2)}`],
        ['Ricavi Totali', `€${reportData.totalRevenue.toFixed(2)}`],
        ['Costi Totali', `€${reportData.totalExpenses.toFixed(2)}`],
        ['Profitto Netto', `€${reportData.netProfit.toFixed(2)}`],
        ['Numero Caricamenti', reportData.loads],
        ['Numero Ordini Consegnati', reportData.orders],
        ['Numero Costi', reportData.costs],
        [''],
        ['DETTAGLIO RICAVI - CARICAMENTI'],
        ['Data', 'Caldaia', 'Quantità', 'Importo'],
        ...loads.map(load => {
            const boiler = getBoiler(load.boilerId);
            return [
                new Date(load.date || load.datetime).toLocaleDateString(),
                boiler ? boiler.code : 'N/A',
                `${load.quantity}q`,
                `€${(load.amount || 15).toFixed(2)}`
            ];
        }),
        [''],
        ['DETTAGLIO RICAVI - ORDINI CONSEGNATI'],
        ['Data', 'Cliente', 'Totale'],
        ...orders.map(order => {
            const customer = app.data.customers.find(c => c.id === order.customerId);
            return [
                new Date(order.date).toLocaleDateString(),
                customer ? customer.name : 'N/A',
                `€${(order.total || 0).toFixed(2)}`
            ];
        }),
        [''],
        ['DETTAGLIO COSTI'],
        ['Data', 'Categoria', 'Descrizione', 'Importo'],
        ...costs.map(cost => [
            new Date(cost.date).toLocaleDateString(),
            cost.category,
            cost.description || '',
            `€${cost.amount.toFixed(2)}`
        ])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contabilita-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Report contabilità esportato con successo', 'success');
}

// Helper Functions
function getCosts() {
    let costs;
    if (typeof app !== 'undefined' && app.data && app.data.boilerCosts) {
        costs = app.data.boilerCosts;
    } else {
        costs = JSON.parse(localStorage.getItem('boilerCosts') || '[]');
    }
    return filterByDateRange(costs, 'date');
}

function getAllLoads() {
    let loads;
    if (typeof app !== 'undefined' && app.data && app.data.boilerLoads) {
        loads = app.data.boilerLoads;
    } else {
        loads = JSON.parse(localStorage.getItem('boilerLoads') || '[]');
    }
    return filterByDateRange(loads, 'date');
}

function getAllOrders() {
    let orders;
    if (typeof app !== 'undefined' && app.data && app.data.orders) {
        orders = app.data.orders;
    } else {
        orders = JSON.parse(localStorage.getItem('orders') || '[]');
    }
    return filterByDateRange(orders, 'date');
}

function getBoiler(id) {
    if (typeof app !== 'undefined' && app.data && app.data.boilers) {
        return app.data.boilers.find(b => b.id === id);
    }
    const boilers = JSON.parse(localStorage.getItem('boilers') || '[]');
    return boilers.find(b => b.id === id);
}

function showToast(message, type = 'info') {
    // Use app's showToast if available
    if (typeof app !== 'undefined' && typeof app.showToast === 'function') {
        app.showToast(message, type);
    } else if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

// Populate Year Filter
function populateYearFilter() {
    const loads = getAllLoads();
    const costs = getCosts();
    const orders = getAllOrders();
    const years = new Set();
    
    loads.forEach(load => {
        const date = new Date(load.date || load.datetime);
        years.add(date.getFullYear());
    });
    
    costs.forEach(cost => {
        const date = new Date(cost.date);
        years.add(date.getFullYear());
    });
    
    orders.forEach(order => {
        if (order.date) {
            const date = new Date(order.date);
            years.add(date.getFullYear());
        }
    });
    
    const select = document.getElementById('filterYear');
    if (!select) return;
    
    // Clear existing options except first
    select.innerHTML = '<option value="">Tutti gli anni</option>';
    
    const sortedYears = Array.from(years).sort().reverse();
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    });
    
    // Set current year as default
    const currentYear = new Date().getFullYear();
    if (years.has(currentYear)) {
        select.value = currentYear;
    }
}

// Apply Accounting Filters
function applyAccountingFilters() {
    const selectedMonth = document.getElementById('filterMonth')?.value;
    const selectedYear = document.getElementById('filterYear')?.value;
    
    // Store filter state
    window.accountingFilters = {
        month: selectedMonth,
        year: selectedYear
    };
    
    // Refresh all displays with filters
    renderAccountingDashboard();
    renderMonthlyAnalysis();
    renderCostBreakdown();
    renderLoadRevenueTable();
    renderOrderRevenueTable();
    renderExpensesTable();
    
    // Show feedback
    if (selectedMonth || selectedYear) {
        const monthName = selectedMonth ? 
            document.querySelector(`#filterMonth option[value="${selectedMonth}"]`).textContent : 
            '';
        const filterText = [monthName, selectedYear].filter(Boolean).join(' ');
        showToast(`Filtro applicato: ${filterText}`, 'info');
    }
}

// Clear Accounting Filters
function clearAccountingFilters() {
    const monthSelect = document.getElementById('filterMonth');
    const yearSelect = document.getElementById('filterYear');
    
    if (monthSelect) monthSelect.value = '';
    if (yearSelect) yearSelect.value = '';
    
    window.accountingFilters = null;
    
    applyAccountingFilters();
    showToast('Filtri rimossi', 'info');
}

// Helper to filter data by date
function filterByDateRange(items, dateField = 'date') {
    if (!window.accountingFilters) return items;
    
    const { month, year } = window.accountingFilters;
    if (!month && !year) return items;
    
    return items.filter(item => {
        const date = new Date(item[dateField] || item.datetime);
        const itemMonth = String(date.getMonth() + 1).padStart(2, '0');
        const itemYear = date.getFullYear().toString();
        
        const monthMatch = !month || itemMonth === month;
        const yearMatch = !year || itemYear === year;
        
        return monthMatch && yearMatch;
    });
}