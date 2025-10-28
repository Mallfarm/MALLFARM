// Accounting Page - Gestione ContabilitÃ  Avanzata (Refactored)

// Global variable for date filter
window.accountingDateFilter = null;

// Migrate old boiler costs to new expenses format with improved category mapping
function migrateOldCosts() {
    console.log('ðŸ”„ Checking for old cost data to migrate...');
    
    // Check if we already have expenses to avoid duplicates
    if (app.data.expenses && app.data.expenses.length > 0) {
        const migrated = app.data.expenses.filter(e => e.migratedFrom === 'boilerCosts');
        if (migrated.length > 0) {
            console.log('âœ… Migration already completed, skipping');
            return;
        }
    }
    
    // Try to get old boiler costs from multiple sources
    let oldCosts = null;
    try {
        // First check localStorage
        const boilerCostsData = localStorage.getItem('boilerCosts');
        if (boilerCostsData) {
            oldCosts = JSON.parse(boilerCostsData);
            console.log('ðŸ“¦ Found old costs in localStorage');
        }
        // Then check app.data
        else if (app.data.boilerCosts) {
            oldCosts = app.data.boilerCosts;
            console.log('ðŸ“¦ Found old costs in app.data');
        }
    } catch (e) {
        console.error('âŒ Error parsing old costs:', e);
        return;
    }
    
    if (!oldCosts || !Array.isArray(oldCosts) || oldCosts.length === 0) {
        console.log('â„¹ï¸ No old costs found to migrate');
        return;
    }
    
    console.log(`ðŸ”„ Migrating ${oldCosts.length} old cost records...`);
    
    // Initialize expenses array if not exists
    if (!app.data.expenses) {
        app.data.expenses = [];
    }
    
    // Enhanced category mapping with more variations
    const categoryMapping = {
        // Combustibile variations
        'combustibile': 'combustible',
        'legna': 'combustible',
        'pellet': 'combustible',
        'cippato': 'combustible',
        'carbone': 'combustible',
        'biomassa': 'combustible',
        
        // Manutenzione variations
        'manutenzione': 'maintenance',
        'riparazioni': 'maintenance',
        'riparazione': 'maintenance',
        'assistenza': 'maintenance',
        'ricambi': 'maintenance',
        'pezzi di ricambio': 'maintenance',
        
        // Trasporto variations
        'trasporto': 'transport',
        'spedizione': 'transport',
        'consegna': 'transport',
        'logistica': 'transport',
        'carburante': 'transport',
        
        // Utilities variations
        'elettricitÃ ': 'utilities',
        'elettrica': 'utilities',
        'energia elettrica': 'utilities',
        'utenze': 'utilities',
        'gas': 'utilities',
        'acqua': 'utilities',
        'telefono': 'utilities',
        'internet': 'utilities',
        
        // Pulizia variations
        'pulizia': 'cleaning',
        'pulizie': 'cleaning',
        'detergenti': 'cleaning',
        'igiene': 'cleaning',
        
        // Equipment variations
        'attrezzature': 'equipment',
        'attrezzi': 'equipment',
        'strumenti': 'equipment',
        'macchinari': 'equipment',
        'equipment': 'equipment',
        
        // Personnel variations
        'personale': 'personnel',
        'stipendi': 'personnel',
        'salari': 'personnel',
        'lavoro': 'personnel',
        'manodopera': 'personnel',
        
        // Insurance variations
        'assicurazione': 'insurance',
        'assicurazioni': 'insurance',
        'polizza': 'insurance',
        
        // Office variations
        'ufficio': 'office',
        'cancelleria': 'office',
        'amministrazione': 'office',
        'contabilitÃ ': 'office',
        
        // Other/default variations
        'varie': 'other',
        'altro': 'other',
        'altri costi': 'other',
        'diversi': 'other',
        'vari': 'other'
    };
    
    let migrated = 0;
    let errors = 0;
    
    // Migrate each old cost
    oldCosts.forEach((oldCost, index) => {
        try {
            // Determine category ID with smart matching
            let categoryId = 'other'; // default
            
            // Check category field
            if (oldCost.category) {
                const categoryLower = oldCost.category.toLowerCase().trim();
                categoryId = categoryMapping[categoryLower] || 'other';
            }
            // Check type field
            else if (oldCost.type) {
                const typeLower = oldCost.type.toLowerCase().trim();
                categoryId = categoryMapping[typeLower] || 'other';
            }
            // Smart description analysis
            else if (oldCost.description) {
                const descLower = oldCost.description.toLowerCase();
                for (const [key, value] of Object.entries(categoryMapping)) {
                    if (descLower.includes(key)) {
                        categoryId = value;
                        break;
                    }
                }
            }
            
            // Ensure proper date format
            let costDate = new Date().toISOString().split('T')[0];
            if (oldCost.date) {
                try {
                    const dateObj = new Date(oldCost.date);
                    if (!isNaN(dateObj.getTime())) {
                        costDate = dateObj.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Invalid date format:', oldCost.date);
                }
            }
            
            // Create new expense record
            const newExpense = {
                id: oldCost.id || `migrated_${Date.now()}_${index}`,
                description: oldCost.description || oldCost.note || oldCost.name || 'Costo migrato',
                amount: parseFloat(oldCost.amount || oldCost.cost || oldCost.price || 0),
                categoryId: categoryId,
                date: costDate,
                notes: oldCost.notes || oldCost.description || oldCost.details || '',
                migratedFrom: 'boilerCosts',
                originalCategory: oldCost.category || oldCost.type || 'N/A'
            };
            
            // Validate expense data
            if (newExpense.amount > 0 && newExpense.description.trim()) {
                app.data.expenses.push(newExpense);
                migrated++;
            } else {
                console.warn('Skipping invalid expense:', oldCost);
            }
            
        } catch (e) {
            console.error('Error migrating cost record:', oldCost, e);
            errors++;
        }
    });
    
    // Save migrated data
    try {
        saveAppData();
        console.log(`âœ… Successfully migrated ${migrated} cost records (${errors} errors)`);
        
        // Create detailed backup
        const backup = {
            boilerCosts: oldCosts,
            migratedCount: migrated,
            errorCount: errors,
            migratedAt: new Date().toISOString(),
            categoryMapping: categoryMapping
        };
        localStorage.setItem('boilerCosts_migration_backup', JSON.stringify(backup));
        
        // Show success message
        if (migrated > 0) {
            app.showToast(`Migrati ${migrated} costi dal vecchio sistema`, 'success');
        }
        
    } catch (e) {
        console.error('âŒ Error saving migrated data:', e);
        app.showToast('Errore nel salvataggio dei costi migrati', 'error');
    }
}

// Initialize Cost Categories with complete data
function initializeCostCategories() {
    if (!app.data.costCategories || app.data.costCategories.length === 0) {
        app.data.costCategories = [
            { 
                id: 'combustible', 
                name: 'Combustibile', 
                description: 'Legna, pellet, cippato, biomassa', 
                color: '#dc3545', 
                icon: 'fas fa-fire',
                priority: 1
            },
            { 
                id: 'maintenance', 
                name: 'Manutenzione', 
                description: 'Riparazioni, assistenza, ricambi', 
                color: '#fd7e14', 
                icon: 'fas fa-tools',
                priority: 2
            },
            { 
                id: 'transport', 
                name: 'Trasporto', 
                description: 'Spedizioni, consegne, carburante', 
                color: '#6f42c1', 
                icon: 'fas fa-truck',
                priority: 3
            },
            { 
                id: 'utilities', 
                name: 'Utenze', 
                description: 'ElettricitÃ , gas, acqua, telefono', 
                color: '#0d6efd', 
                icon: 'fas fa-bolt',
                priority: 4
            },
            { 
                id: 'personnel', 
                name: 'Personale', 
                description: 'Stipendi, salari, manodopera', 
                color: '#198754', 
                icon: 'fas fa-users',
                priority: 5
            },
            { 
                id: 'equipment', 
                name: 'Attrezzature', 
                description: 'Strumenti, macchinari, attrezzi', 
                color: '#6c757d', 
                icon: 'fas fa-hammer',
                priority: 6
            },
            { 
                id: 'cleaning', 
                name: 'Pulizia', 
                description: 'Detergenti, igiene, pulizie', 
                color: '#20c997', 
                icon: 'fas fa-broom',
                priority: 7
            },
            { 
                id: 'insurance', 
                name: 'Assicurazioni', 
                description: 'Polizze, coperture assicurative', 
                color: '#0dcaf0', 
                icon: 'fas fa-shield-alt',
                priority: 8
            },
            { 
                id: 'office', 
                name: 'Ufficio', 
                description: 'Cancelleria, amministrazione', 
                color: '#ffc107', 
                icon: 'fas fa-briefcase',
                priority: 9
            },
            { 
                id: 'other', 
                name: 'Altri Costi', 
                description: 'Spese varie e diverse', 
                color: '#adb5bd', 
                icon: 'fas fa-ellipsis-h',
                priority: 10
            }
        ];
        saveAppData();
    }
}

// Enhanced expense management functions
function getAllExpenses() {
    return app.data.expenses || [];
}

function getExpenseById(id) {
    return getAllExpenses().find(expense => expense.id === id);
}

function addExpense(expenseData) {
    try {
        if (!app.data.expenses) {
            app.data.expenses = [];
        }
        
        const newExpense = {
            id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: expenseData.description.trim(),
            amount: parseFloat(expenseData.amount),
            categoryId: expenseData.categoryId,
            date: expenseData.date,
            notes: expenseData.notes ? expenseData.notes.trim() : '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validate expense data
        if (!newExpense.description || newExpense.amount <= 0 || !newExpense.categoryId) {
            throw new Error('Dati spesa non validi');
        }
        
        app.data.expenses.push(newExpense);
        saveAppData();
        
        console.log('âœ… Expense added:', newExpense);
        return newExpense;
        
    } catch (error) {
        console.error('âŒ Error adding expense:', error);
        throw error;
    }
}

function updateExpense(id, updateData) {
    try {
        const expense = getExpenseById(id);
        if (!expense) {
            throw new Error('Spesa non trovata');
        }
        
        // Update fields
        if (updateData.description !== undefined) expense.description = updateData.description.trim();
        if (updateData.amount !== undefined) expense.amount = parseFloat(updateData.amount);
        if (updateData.categoryId !== undefined) expense.categoryId = updateData.categoryId;
        if (updateData.date !== undefined) expense.date = updateData.date;
        if (updateData.notes !== undefined) expense.notes = updateData.notes.trim();
        
        expense.updatedAt = new Date().toISOString();
        
        saveAppData();
        console.log('âœ… Expense updated:', expense);
        return expense;
        
    } catch (error) {
        console.error('âŒ Error updating expense:', error);
        throw error;
    }
}

function deleteExpense(id) {
    try {
        const index = app.data.expenses.findIndex(expense => expense.id === id);
        if (index === -1) {
            throw new Error('Spesa non trovata');
        }
        
        const deletedExpense = app.data.expenses.splice(index, 1)[0];
        saveAppData();
        
        console.log('âœ… Expense deleted:', deletedExpense);
        return deletedExpense;
        
    } catch (error) {
        console.error('âŒ Error deleting expense:', error);
        throw error;
    }
}

// Enhanced data saving with error handling
function saveAppData() {
    try {
        localStorage.setItem('app_data', JSON.stringify(app.data));
        return true;
    } catch (error) {
        console.error('âŒ Error saving app data:', error);
        app.showToast('Errore nel salvataggio dei dati', 'error');
        return false;
    }
}

// Date filter management
function initializeDateFilter() {
    const now = new Date();
    window.accountingDateFilter = {
        type: 'month',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
    updateDateFilterDisplay();
}

function setDateFilter(type) {
    const now = new Date();
    
    switch (type) {
        case 'month':
            window.accountingDateFilter = {
                type: 'month',
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            };
            break;
        case 'year':
            window.accountingDateFilter = {
                type: 'year',
                startDate: new Date(now.getFullYear(), 0, 1),
                endDate: new Date(now.getFullYear(), 11, 31)
            };
            break;
    }
    
    updateDateFilterDisplay();
    updateFilterButtons(type);
    refreshAccountingData();
}

function setCustomDateRange(startDate, endDate) {
    window.accountingDateFilter = {
        type: 'custom',
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    };
    
    updateDateFilterDisplay();
    updateFilterButtons('custom');
    refreshAccountingData();
}

function updateDateFilterDisplay() {
    const filterEl = document.getElementById('currentDateFilter');
    if (!filterEl || !window.accountingDateFilter) return;
    
    const filter = window.accountingDateFilter;
    let text = 'Visualizzazione: ';
    
    switch (filter.type) {
        case 'month':
            text += `Mese corrente (${filter.startDate.toLocaleDateString('it-IT', {month: 'long', year: 'numeric'})})`;
            break;
        case 'year':
            text += `Anno corrente (${filter.startDate.getFullYear()})`;
            break;
        case 'custom':
            text += `Dal ${filter.startDate.toLocaleDateString('it-IT')} al ${filter.endDate.toLocaleDateString('it-IT')}`;
            break;
    }
    
    filterEl.textContent = text;
}

function updateFilterButtons(activeType) {
    const buttons = {
        'month': document.getElementById('filterMonth'),
        'year': document.getElementById('filterYear'),
        'custom': document.getElementById('filterRange')
    };
    
    Object.entries(buttons).forEach(([type, button]) => {
        if (button) {
            button.classList.toggle('active', type === activeType);
        }
    });
}

function isDateInFilterRange(dateString) {
    if (!dateString || !window.accountingDateFilter) return true;
    
    const filterDate = new Date(dateString);
    return filterDate >= window.accountingDateFilter.startDate && 
           filterDate <= window.accountingDateFilter.endDate;
}

function refreshAccountingData() {
    setTimeout(() => {
        renderAccountingDashboard();
        renderCostManagement();
        renderAnalysis();
    }, 10);
}

// Main page loader
function loadAccountingPage(container) {
    // Migrate old costs first
    migrateOldCosts();
    
    // Initialize categories and date filter
    initializeCostCategories();
    initializeDateFilter();
    
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-calculator"></i> ContabilitÃ </h2>
                        <p class="text-muted">Gestione completa fatturato, costi e ricavi</p>
                    </div>
                    <div>
                        <div class="btn-group me-2">
                            <button class="btn btn-outline-primary active" onclick="setDateFilter('month')" id="filterMonth">
                                <i class="fas fa-calendar"></i> Mese Corrente
                            </button>
                            <button class="btn btn-outline-primary" onclick="setDateFilter('year')" id="filterYear">
                                <i class="fas fa-calendar-alt"></i> Anno Corrente
                            </button>
                            <button class="btn btn-outline-primary" onclick="openDateRangeModal()" id="filterRange">
                                <i class="fas fa-calendar-week"></i> Range Personalizzato
                            </button>
                        </div>
                        <button class="btn btn-primary" onclick="exportAccountingReport()">
                            <i class="fas fa-file-export"></i> Esporta Report
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Date Filter Display -->
        <div class="row mb-3">
            <div class="col-12">
                <div class="alert alert-info d-flex justify-content-between align-items-center">
                    <span id="currentDateFilter">Caricamento...</span>
                    <button class="btn btn-sm btn-outline-info" onclick="setDateFilter('month')">
                        <i class="fas fa-refresh"></i> Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4" id="accountingTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                    <i class="fas fa-chart-bar"></i> Dashboard
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="costs-tab" data-bs-toggle="tab" data-bs-target="#costs" type="button" role="tab">
                    <i class="fas fa-receipt"></i> Gestione Costi
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories" type="button" role="tab">
                    <i class="fas fa-tags"></i> Categorie
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="analysis-tab" data-bs-toggle="tab" data-bs-target="#analysis" type="button" role="tab">
                    <i class="fas fa-chart-pie"></i> Analisi
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="accountingTabContent">
            <!-- Dashboard Tab -->
            <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                ${createDashboardTab()}
            </div>

            <!-- Costs Tab -->
            <div class="tab-pane fade" id="costs" role="tabpanel">
                ${createCostsTab()}
            </div>

            <!-- Categories Tab -->
            <div class="tab-pane fade" id="categories" role="tabpanel">
                ${createCategoriesTab()}
            </div>

            <!-- Analysis Tab -->
            <div class="tab-pane fade" id="analysis" role="tabpanel">
                ${createAnalysisTab()}
            </div>
        </div>

        <!-- Modals -->
        ${createExpenseModal()}
        ${createDateRangeModal()}
        ${createCategoryModal()}
    `;

    // Initialize components after DOM is ready
    setTimeout(() => {
        refreshAccountingData();
    }, 10);
}

// Continue with tab creation functions and other functionality...
// This is part 1 of the refactored file. Part 2 will include all the rendering functions.
// Part 2: Rendering Functions and UI Components

// Tab Creation Functions
function createDashboardTab() {
    return `
        <div class="row">
            <!-- Summary Cards -->
            <div class="col-md-3 mb-4">
                <div class="card stat-card success">
                    <div class="card-body text-center">
                        <i class="fas fa-euro-sign stat-icon"></i>
                        <h5 class="card-title">Ricavi Totali</h5>
                        <h3 id="total-income">â‚¬0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stat-card danger">
                    <div class="card-body text-center">
                        <i class="fas fa-credit-card stat-icon"></i>
                        <h5 class="card-title">Costi Totali</h5>
                        <h3 id="total-expenses">â‚¬0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stat-card" id="profit-card">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line stat-icon"></i>
                        <h5 class="card-title">Profitto Netto</h5>
                        <h3 id="net-profit">â‚¬0</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card stat-card primary">
                    <div class="card-body text-center">
                        <i class="fas fa-percentage stat-icon"></i>
                        <h5 class="card-title">Margine %</h5>
                        <h3 id="profit-margin">0%</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <!-- Revenue Breakdown -->
            <div class="col-lg-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-bar"></i> Ricavi per Fonte</h5>
                    </div>
                    <div class="card-body">
                        <div id="revenueChart"></div>
                        <div class="mt-3">
                            <div class="row">
                                <div class="col-6">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="bg-success rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                                        <span class="small">Carichi: <strong id="load-revenue">â‚¬0</strong></span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="bg-primary rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                                        <span class="small">Ordini: <strong id="order-revenue">â‚¬0</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Expense Breakdown -->
            <div class="col-lg-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-pie"></i> Costi per Categoria</h5>
                    </div>
                    <div class="card-body">
                        <div id="expenseChart"></div>
                        <div class="mt-3" id="expense-legend">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-list"></i> Transazioni Recenti</h5>
                    </div>
                    <div class="card-body">
                        <div id="recentTransactions">
                            <div class="text-center text-muted py-3">
                                <i class="fas fa-spinner fa-spin"></i> Caricamento...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCostsTab() {
    return `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-receipt"></i> Gestione Costi</h4>
                    <button class="btn btn-primary" onclick="openExpenseModal()">
                        <i class="fas fa-plus"></i> Aggiungi Costo
                    </button>
                </div>
            </div>
        </div>

        <!-- Search and Filter -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="expenseSearch" placeholder="Cerca per descrizione..." onkeyup="filterExpenses()">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="categoryFilter" onchange="filterExpenses()">
                    <option value="">Tutte le categorie</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="sortExpenses" onchange="sortExpenses()">
                    <option value="date-desc">Data (piÃ¹ recente)</option>
                    <option value="date-asc">Data (meno recente)</option>
                    <option value="amount-desc">Importo (maggiore)</option>
                    <option value="amount-asc">Importo (minore)</option>
                    <option value="description">Descrizione</option>
                </select>
            </div>
        </div>

        <!-- Expenses Table -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div id="expensesTable">
                            <div class="text-center text-muted py-3">
                                <i class="fas fa-spinner fa-spin"></i> Caricamento costi...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCategoriesTab() {
    return `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h4><i class="fas fa-tags"></i> Categorie Costi</h4>
                    <button class="btn btn-primary" onclick="openCategoryModal()">
                        <i class="fas fa-plus"></i> Nuova Categoria
                    </button>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div id="categoriesGrid">
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-spinner fa-spin"></i> Caricamento categorie...
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createAnalysisTab() {
    return `
        <div class="row mb-4">
            <div class="col-12">
                <h4><i class="fas fa-chart-pie"></i> Analisi e Statistiche</h4>
            </div>
        </div>

        <!-- Period Comparison -->
        <div class="row mb-4">
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-calendar-alt"></i> Confronto Mensile</h6>
                    </div>
                    <div class="card-body">
                        <div id="monthlyComparisonChart" style="height: 300px;">
                            <div class="d-flex align-items-center justify-content-center h-100">
                                <div class="text-center text-muted">
                                    <i class="fas fa-chart-bar fa-2x mb-2"></i>
                                    <div>Grafico mensile in caricamento...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-chart-line"></i> Trend Annuale</h6>
                    </div>
                    <div class="card-body">
                        <div id="yearlyTrendChart" style="height: 300px;">
                            <div class="d-flex align-items-center justify-content-center h-100">
                                <div class="text-center text-muted">
                                    <i class="fas fa-chart-line fa-2x mb-2"></i>
                                    <div>Trend annuale in caricamento...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Analysis -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-tags"></i> Analisi per Categoria</h6>
                    </div>
                    <div class="card-body">
                        <div id="categoryAnalysisTable">
                            <div class="text-center text-muted py-3">
                                <i class="fas fa-spinner fa-spin"></i> Analisi categorie in caricamento...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Performance Metrics -->
        <div class="row">
            <div class="col-md-4">
                <div class="card bg-gradient-success text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-trending-up fa-2x mb-2"></i>
                        <h6>Migliore Mese</h6>
                        <h4 id="bestMonth">-</h4>
                        <small id="bestMonthProfit">â‚¬0 profitto</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-gradient-warning text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-pie fa-2x mb-2"></i>
                        <h6>Categoria Principale</h6>
                        <h4 id="topCategory">-</h4>
                        <small id="topCategoryAmount">â‚¬0 spesi</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-gradient-info text-white">
                    <div class="card-body text-center">
                        <i class="fas fa-calculator fa-2x mb-2"></i>
                        <h6>Costo Medio</h6>
                        <h4 id="avgExpense">â‚¬0</h4>
                        <small id="expenseCount">0 transazioni</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Modal Creation Functions
function createExpenseModal() {
    return `
        <div class="modal fade" id="expenseModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt"></i> <span id="expenseModalTitle">Aggiungi Costo</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="expenseForm">
                            <input type="hidden" id="expenseId">
                            
                            <div class="mb-3">
                                <label for="expenseDescription" class="form-label">Descrizione *</label>
                                <input type="text" class="form-control" id="expenseDescription" required>
                                <div class="invalid-feedback">Inserisci una descrizione</div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="expenseAmount" class="form-label">Importo (â‚¬) *</label>
                                        <input type="number" class="form-control" id="expenseAmount" min="0" step="0.01" required>
                                        <div class="invalid-feedback">Inserisci un importo valido</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="expenseDate" class="form-label">Data *</label>
                                        <input type="date" class="form-control" id="expenseDate" required>
                                        <div class="invalid-feedback">Seleziona una data</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseCategory" class="form-label">Categoria *</label>
                                <select class="form-select" id="expenseCategory" required>
                                    <option value="">Seleziona categoria...</option>
                                </select>
                                <div class="invalid-feedback">Seleziona una categoria</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseNotes" class="form-label">Note</label>
                                <textarea class="form-control" id="expenseNotes" rows="3" placeholder="Note aggiuntive..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveExpense()">
                            <i class="fas fa-save"></i> Salva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createDateRangeModal() {
    return `
        <div class="modal fade" id="dateRangeModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-week"></i> Seleziona Periodo
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="rangeStartDate" class="form-label">Data Inizio</label>
                                <input type="date" class="form-control" id="rangeStartDate">
                            </div>
                            <div class="col-md-6">
                                <label for="rangeEndDate" class="form-label">Data Fine</label>
                                <input type="date" class="form-control" id="rangeEndDate">
                            </div>
                        </div>
                        
                        <!-- Quick presets -->
                        <div class="mt-3">
                            <h6>Periodi Predefiniti:</h6>
                            <div class="btn-group-vertical w-100" role="group">
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="setQuickRange('lastMonth')">
                                    Mese Scorso
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="setQuickRange('last3Months')">
                                    Ultimi 3 Mesi
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="setQuickRange('last6Months')">
                                    Ultimi 6 Mesi
                                </button>
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="setQuickRange('lastYear')">
                                    Anno Scorso
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="applyDateRange()">
                            <i class="fas fa-check"></i> Applica
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCategoryModal() {
    return `
        <div class="modal fade" id="categoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-tag"></i> <span id="categoryModalTitle">Nuova Categoria</span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm">
                            <input type="hidden" id="categoryId">
                            
                            <div class="mb-3">
                                <label for="categoryName" class="form-label">Nome Categoria *</label>
                                <input type="text" class="form-control" id="categoryName" required>
                                <div class="invalid-feedback">Inserisci un nome</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="categoryDescription" class="form-label">Descrizione</label>
                                <textarea class="form-control" id="categoryDescription" rows="2"></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categoryColor" class="form-label">Colore</label>
                                        <input type="color" class="form-control form-control-color" id="categoryColor" value="#6c757d">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="categoryIcon" class="form-label">Icona</label>
                                        <select class="form-select" id="categoryIcon">
                                            <option value="fas fa-tag">Tag</option>
                                            <option value="fas fa-fire">Fuoco</option>
                                            <option value="fas fa-tools">Strumenti</option>
                                            <option value="fas fa-truck">Camion</option>
                                            <option value="fas fa-bolt">Fulmine</option>
                                            <option value="fas fa-users">Persone</option>
                                            <option value="fas fa-hammer">Martello</option>
                                            <option value="fas fa-broom">Scopa</option>
                                            <option value="fas fa-shield-alt">Scudo</option>
                                            <option value="fas fa-briefcase">Valigia</option>
                                            <option value="fas fa-ellipsis-h">Altro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveCategory()">
                            <i class="fas fa-save"></i> Salva
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Continue with rendering and event handling functions in part 3...
// Part 3: Rendering Functions and Event Handlers

// Dashboard Rendering
function renderAccountingDashboard() {
    try {
        console.log('ðŸ”„ Rendering accounting dashboard...');
        
        // Get filtered data
        const loads = getAllLoads().filter(load => isDateInFilterRange(load.date));
        const orders = getFilteredOrders().filter(order => isDateInFilterRange(order.date));
        const expenses = getAllExpenses().filter(expense => isDateInFilterRange(expense.date));

        // Calculate totals
        const totalLoadRevenue = loads.reduce((sum, load) => sum + (parseFloat(load.amount) || 15), 0);
        const totalOrderRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        const totalIncome = totalLoadRevenue + totalOrderRevenue;
        const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Update summary cards
        updateElement('total-income', `â‚¬${totalIncome.toFixed(2)}`);
        updateElement('total-expenses', `â‚¬${totalExpenses.toFixed(2)}`);
        updateElement('net-profit', `â‚¬${netProfit.toFixed(2)}`);
        updateElement('profit-margin', `${profitMargin.toFixed(1)}%`);
        updateElement('load-revenue', `â‚¬${totalLoadRevenue.toFixed(2)}`);
        updateElement('order-revenue', `â‚¬${totalOrderRevenue.toFixed(2)}`);

        // Update profit card color
        const profitCard = document.getElementById('profit-card');
        if (profitCard) {
            profitCard.className = `card stat-card ${netProfit >= 0 ? 'success' : 'danger'}`;
        }

        // Render charts
        renderRevenueChart(totalLoadRevenue, totalOrderRevenue);
        renderExpenseChart(expenses);
        renderRecentTransactions(loads, orders, expenses);

        console.log('âœ… Dashboard rendered successfully');
        
    } catch (error) {
        console.error('âŒ Error rendering dashboard:', error);
        app.showToast('Errore nel caricamento dashboard', 'error');
    }
}

// Cost Management Rendering
function renderCostManagement() {
    try {
        console.log('ðŸ”„ Rendering cost management...');
        
        // Populate category filter
        populateCategoryFilter();
        
        // Render expenses table
        const expenses = getAllExpenses().filter(expense => isDateInFilterRange(expense.date));
        renderExpensesTable(expenses);
        
        console.log('âœ… Cost management rendered successfully');
        
    } catch (error) {
        console.error('âŒ Error rendering cost management:', error);
        app.showToast('Errore nel caricamento gestione costi', 'error');
    }
}

// Analysis Rendering
function renderAnalysis() {
    try {
        console.log('ðŸ”„ Rendering analysis...');
        
        const expenses = getAllExpenses();
        
        // Render analysis components
        renderCategoryAnalysis(expenses);
        renderMonthlyComparison(expenses);
        renderYearlyTrend(expenses);
        renderPerformanceMetrics(expenses);
        
        console.log('âœ… Analysis rendered successfully');
        
    } catch (error) {
        console.error('âŒ Error rendering analysis:', error);
        app.showToast('Errore nel caricamento analisi', 'error');
    }
}

// Helper function to update elements safely
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

// Expenses Table Rendering
function renderExpensesTable(expenses) {
    const container = document.getElementById('expensesTable');
    if (!container) return;

    if (!expenses || expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-receipt fa-3x mb-3"></i>
                <h5>Nessun costo trovato</h5>
                <p>Non ci sono costi per il periodo selezionato.</p>
                <button class="btn btn-primary" onclick="openExpenseModal()">
                    <i class="fas fa-plus"></i> Aggiungi primo costo
                </button>
            </div>
        `;
        return;
    }

    const categories = app.data.costCategories || [];
    
    let tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Data</th>
                        <th>Descrizione</th>
                        <th>Categoria</th>
                        <th>Importo</th>
                        <th>Note</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
    `;

    expenses.forEach(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        const categoryName = category ? category.name : 'Sconosciuta';
        const categoryColor = category ? category.color : '#6c757d';
        const categoryIcon = category ? category.icon : 'fas fa-tag';

        tableHTML += `
            <tr>
                <td>
                    <small class="text-muted">${new Date(expense.date).toLocaleDateString('it-IT')}</small>
                </td>
                <td>
                    <strong>${escapeHtml(expense.description)}</strong>
                    ${expense.migratedFrom ? '<span class="badge bg-info ms-1">Migrato</span>' : ''}
                </td>
                <td>
                    <span class="badge" style="background-color: ${categoryColor}">
                        <i class="${categoryIcon}"></i> ${categoryName}
                    </span>
                </td>
                <td>
                    <strong class="text-danger">â‚¬${parseFloat(expense.amount).toFixed(2)}</strong>
                </td>
                <td>
                    <small class="text-muted">${escapeHtml(expense.notes || '-')}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editExpense('${expense.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmDeleteExpense('${expense.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
        
        <!-- Summary -->
        <div class="mt-3 p-3 bg-light rounded">
            <div class="row">
                <div class="col-md-6">
                    <strong>Totale costi visualizzati: </strong>
                    <span class="text-danger">â‚¬${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}</span>
                </div>
                <div class="col-md-6 text-end">
                    <strong>Numero transazioni: </strong>
                    <span class="text-info">${expenses.length}</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// Categories Rendering
function renderCostCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    const categories = app.data.costCategories || [];
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-tags fa-3x mb-3"></i>
                <h5>Nessuna categoria definita</h5>
                <p>Inizializza le categorie predefinite.</p>
                <button class="btn btn-primary" onclick="initializeCostCategories(); renderCostCategories();">
                    <i class="fas fa-plus"></i> Inizializza Categorie
                </button>
            </div>
        `;
        return;
    }

    let gridHTML = '<div class="row">';
    
    categories.forEach(category => {
        const expenses = getAllExpenses().filter(exp => exp.categoryId === category.id);
        const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const expenseCount = expenses.length;

        gridHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style="width: 50px; height: 50px; background-color: ${category.color}; color: white;">
                                    <i class="${category.icon}"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${escapeHtml(category.name)}</h6>
                                    <small class="text-muted">${escapeHtml(category.description)}</small>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="editCategory('${category.id}')">
                                        <i class="fas fa-edit"></i> Modifica
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="confirmDeleteCategory('${category.id}')">
                                        <i class="fas fa-trash"></i> Elimina
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="row text-center">
                            <div class="col-6">
                                <div class="border-end">
                                    <h5 class="mb-0 text-danger">â‚¬${totalAmount.toFixed(2)}</h5>
                                    <small class="text-muted">Totale speso</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <h5 class="mb-0 text-info">${expenseCount}</h5>
                                <small class="text-muted">Transazioni</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    gridHTML += '</div>';
    container.innerHTML = gridHTML;
}

// Chart rendering functions
function renderRevenueChart(loadRevenue, orderRevenue) {
    const container = document.getElementById('revenueChart');
    if (!container || (loadRevenue === 0 && orderRevenue === 0)) {
        if (container) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-chart-bar fa-2x mb-2"></i>
                    <div>Nessun ricavo per il periodo selezionato</div>
                </div>
            `;
        }
        return;
    }

    const total = loadRevenue + orderRevenue;
    const loadPercentage = (loadRevenue / total) * 100;
    const orderPercentage = (orderRevenue / total) * 100;

    container.innerHTML = `
        <div class="progress" style="height: 30px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${loadPercentage}%" 
                 title="Carichi: â‚¬${loadRevenue.toFixed(2)} (${loadPercentage.toFixed(1)}%)">
            </div>
            <div class="progress-bar bg-primary" role="progressbar" style="width: ${orderPercentage}%" 
                 title="Ordini: â‚¬${orderRevenue.toFixed(2)} (${orderPercentage.toFixed(1)}%)">
            </div>
        </div>
        <div class="text-center mt-2">
            <small class="text-muted">Totale: â‚¬${total.toFixed(2)}</small>
        </div>
    `;
}

function renderExpenseChart(expenses) {
    const container = document.getElementById('expenseChart');
    const legendContainer = document.getElementById('expense-legend');
    
    if (!container) return;

    if (!expenses || expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-chart-pie fa-2x mb-2"></i>
                <div>Nessun costo per il periodo selezionato</div>
            </div>
        `;
        if (legendContainer) legendContainer.innerHTML = '';
        return;
    }

    const categories = app.data.costCategories || [];
    const categoryTotals = {};
    
    // Calculate totals by category
    expenses.forEach(expense => {
        if (!categoryTotals[expense.categoryId]) {
            categoryTotals[expense.categoryId] = 0;
        }
        categoryTotals[expense.categoryId] += parseFloat(expense.amount);
    });

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    if (total === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-chart-pie fa-2x mb-2"></i>
                <div>Nessun costo per il periodo selezionato</div>
            </div>
        `;
        if (legendContainer) legendContainer.innerHTML = '';
        return;
    }

    // Create simple progress bar visualization
    let chartHTML = '<div class="progress" style="height: 30px;">';
    let legendHTML = '<div class="row">';
    
    Object.entries(categoryTotals).forEach(([categoryId, amount]) => {
        const category = categories.find(cat => cat.id === categoryId) || 
                        { name: 'Sconosciuta', color: '#6c757d', icon: 'fas fa-tag' };
        const percentage = (amount / total) * 100;
        
        chartHTML += `
            <div class="progress-bar" role="progressbar" 
                 style="width: ${percentage}%; background-color: ${category.color}" 
                 title="${category.name}: â‚¬${amount.toFixed(2)} (${percentage.toFixed(1)}%)">
            </div>
        `;
        
        legendHTML += `
            <div class="col-6 mb-2">
                <div class="d-flex align-items-center">
                    <div class="rounded-circle me-2" 
                         style="width: 12px; height: 12px; background-color: ${category.color}"></div>
                    <span class="small">${category.name}: <strong>â‚¬${amount.toFixed(2)}</strong></span>
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    legendHTML += '</div>';
    
    container.innerHTML = chartHTML + `
        <div class="text-center mt-2">
            <small class="text-muted">Totale: â‚¬${total.toFixed(2)}</small>
        </div>
    `;
    
    if (legendContainer) {
        legendContainer.innerHTML = legendHTML;
    }
}

// Recent transactions rendering
function renderRecentTransactions(loads, orders, expenses) {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    // Combine all transactions
    const transactions = [
        ...loads.map(load => ({
            type: 'load',
            date: load.date,
            description: `Carico #${load.id || 'N/A'}`,
            amount: parseFloat(load.amount) || 15,
            isIncome: true
        })),
        ...orders.map(order => ({
            type: 'order',
            date: order.date,
            description: `Ordine #${order.id || 'N/A'}`,
            amount: parseFloat(order.total) || 0,
            isIncome: true
        })),
        ...expenses.map(expense => ({
            type: 'expense',
            date: expense.date,
            description: expense.description,
            amount: parseFloat(expense.amount) || 0,
            isIncome: false,
            categoryId: expense.categoryId
        }))
    ];

    // Sort by date (most recent first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the most recent 10
    const recentTransactions = transactions.slice(0, 10);

    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-list"></i> Nessuna transazione recente
            </div>
        `;
        return;
    }

    let html = '<div class="list-group list-group-flush">';
    
    recentTransactions.forEach(transaction => {
        const icon = transaction.type === 'load' ? 'fas fa-truck' :
                     transaction.type === 'order' ? 'fas fa-shopping-cart' :
                     'fas fa-receipt';
        
        const colorClass = transaction.isIncome ? 'text-success' : 'text-danger';
        const sign = transaction.isIncome ? '+' : '-';
        
        html += `
            <div class="list-group-item border-0 px-0">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="${icon} ${colorClass}"></i>
                        </div>
                        <div>
                            <h6 class="mb-1">${escapeHtml(transaction.description)}</h6>
                            <small class="text-muted">${new Date(transaction.date).toLocaleDateString('it-IT')}</small>
                        </div>
                    </div>
                    <div class="text-end">
                        <strong class="${colorClass}">${sign}â‚¬${transaction.amount.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Continue with additional rendering functions in part 4...
// Part 4: Event Handlers and Analysis Functions

// Modal Management
function openExpenseModal(expenseId = null) {
    const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
    const form = document.getElementById('expenseForm');
    const titleEl = document.getElementById('expenseModalTitle');
    
    // Reset form
    form.reset();
    form.classList.remove('was-validated');
    
    // Populate category dropdown
    populateExpenseCategories();
    
    if (expenseId) {
        // Edit mode
        const expense = getExpenseById(expenseId);
        if (expense) {
            titleEl.textContent = 'Modifica Costo';
            document.getElementById('expenseId').value = expense.id;
            document.getElementById('expenseDescription').value = expense.description;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('expenseDate').value = expense.date;
            document.getElementById('expenseCategory').value = expense.categoryId;
            document.getElementById('expenseNotes').value = expense.notes || '';
        }
    } else {
        // Add mode
        titleEl.textContent = 'Aggiungi Costo';
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.show();
}

function saveExpense() {
    const form = document.getElementById('expenseForm');
    const modal = bootstrap.Modal.getInstance(document.getElementById('expenseModal'));
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    try {
        const expenseId = document.getElementById('expenseId').value;
        const expenseData = {
            description: document.getElementById('expenseDescription').value,
            amount: document.getElementById('expenseAmount').value,
            date: document.getElementById('expenseDate').value,
            categoryId: document.getElementById('expenseCategory').value,
            notes: document.getElementById('expenseNotes').value
        };
        
        if (expenseId) {
            // Update existing expense
            updateExpense(expenseId, expenseData);
            app.showToast('Costo aggiornato con successo', 'success');
        } else {
            // Add new expense
            addExpense(expenseData);
            app.showToast('Costo aggiunto con successo', 'success');
        }
        
        modal.hide();
        refreshAccountingData();
        
    } catch (error) {
        console.error('Error saving expense:', error);
        app.showToast(error.message || 'Errore nel salvataggio del costo', 'error');
    }
}

function editExpense(expenseId) {
    openExpenseModal(expenseId);
}

function confirmDeleteExpense(expenseId) {
    const expense = getExpenseById(expenseId);
    if (!expense) return;
    
    if (confirm(`Sei sicuro di voler eliminare il costo "${expense.description}"?`)) {
        try {
            deleteExpense(expenseId);
            app.showToast('Costo eliminato con successo', 'success');
            refreshAccountingData();
        } catch (error) {
            console.error('Error deleting expense:', error);
            app.showToast('Errore nell\'eliminazione del costo', 'error');
        }
    }
}

// Category Management
function populateExpenseCategories() {
    const select = document.getElementById('expenseCategory');
    if (!select) return;
    
    const categories = app.data.costCategories || [];
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Seleziona categoria...</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    const categories = app.data.costCategories || [];
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Tutte le categorie</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Date Range Management
function openDateRangeModal() {
    const modal = new bootstrap.Modal(document.getElementById('dateRangeModal'));
    
    if (window.accountingDateFilter) {
        document.getElementById('rangeStartDate').value = window.accountingDateFilter.startDate.toISOString().split('T')[0];
        document.getElementById('rangeEndDate').value = window.accountingDateFilter.endDate.toISOString().split('T')[0];
    }
    
    modal.show();
}

function setQuickRange(range) {
    const now = new Date();
    let startDate, endDate;
    
    switch (range) {
        case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'last3Months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = new Date();
            break;
        case 'last6Months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            endDate = new Date();
            break;
        case 'lastYear':
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear() - 1, 11, 31);
            break;
        default:
            return;
    }
    
    document.getElementById('rangeStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('rangeEndDate').value = endDate.toISOString().split('T')[0];
}

function applyDateRange() {
    const startDate = document.getElementById('rangeStartDate').value;
    const endDate = document.getElementById('rangeEndDate').value;
    
    if (!startDate || !endDate) {
        app.showToast('Seleziona entrambe le date', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        app.showToast('La data di inizio deve essere precedente alla data di fine', 'error');
        return;
    }
    
    setCustomDateRange(startDate, endDate);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('dateRangeModal'));
    modal.hide();
    
    app.showToast('Periodo personalizzato applicato', 'success');
}

// Filtering and Sorting
function filterExpenses() {
    const searchTerm = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    let expenses = getAllExpenses().filter(expense => isDateInFilterRange(expense.date));
    
    // Apply search filter
    if (searchTerm) {
        expenses = expenses.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply category filter
    if (categoryFilter) {
        expenses = expenses.filter(expense => expense.categoryId === categoryFilter);
    }
    
    renderExpensesTable(expenses);
}

function sortExpenses() {
    const sortBy = document.getElementById('sortExpenses')?.value || 'date-desc';
    const searchTerm = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    
    let expenses = getAllExpenses().filter(expense => isDateInFilterRange(expense.date));
    
    // Apply filters first
    if (searchTerm) {
        expenses = expenses.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categoryFilter) {
        expenses = expenses.filter(expense => expense.categoryId === categoryFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
        case 'date-desc':
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            expenses.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
            break;
        case 'amount-asc':
            expenses.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            break;
        case 'description':
            expenses.sort((a, b) => a.description.localeCompare(b.description));
            break;
    }
    
    renderExpensesTable(expenses);
}

// Analysis Functions
function renderCategoryAnalysis(expenses) {
    const container = document.getElementById('categoryAnalysisTable');
    if (!container) return;
    
    const categories = app.data.costCategories || [];
    const categoryData = {};
    
    // Calculate data for each category
    categories.forEach(category => {
        const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
        const total = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const count = categoryExpenses.length;
        const average = count > 0 ? total / count : 0;
        
        categoryData[category.id] = {
            category,
            total,
            count,
            average,
            percentage: 0 // Will be calculated after total is known
        };
    });
    
    const grandTotal = Object.values(categoryData).reduce((sum, data) => sum + data.total, 0);
    
    // Calculate percentages
    Object.values(categoryData).forEach(data => {
        data.percentage = grandTotal > 0 ? (data.total / grandTotal) * 100 : 0;
    });
    
    // Sort by total amount
    const sortedData = Object.values(categoryData).sort((a, b) => b.total - a.total);
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Categoria</th>
                        <th>Totale Speso</th>
                        <th>% del Totale</th>
                        <th>NÂ° Transazioni</th>
                        <th>Media per Transazione</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    sortedData.forEach(data => {
        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle me-2" 
                             style="width: 20px; height: 20px; background-color: ${data.category.color}"></div>
                        <span><i class="${data.category.icon}"></i> ${data.category.name}</span>
                    </div>
                </td>
                <td><strong class="text-danger">â‚¬${data.total.toFixed(2)}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress me-2" style="width: 100px; height: 15px;">
                            <div class="progress-bar" style="width: ${data.percentage}%; background-color: ${data.category.color}"></div>
                        </div>
                        <span>${data.percentage.toFixed(1)}%</span>
                    </div>
                </td>
                <td><span class="badge bg-info">${data.count}</span></td>
                <td>â‚¬${data.average.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
                <tfoot class="table-light">
                    <tr>
                        <th>TOTALE</th>
                        <th class="text-danger">â‚¬${grandTotal.toFixed(2)}</th>
                        <th>100%</th>
                        <th><span class="badge bg-secondary">${expenses.length}</span></th>
                        <th>â‚¬${expenses.length > 0 ? (grandTotal / expenses.length).toFixed(2) : '0.00'}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderMonthlyComparison(expenses) {
    const container = document.getElementById('monthlyComparisonChart');
    if (!container) return;
    
    // Get last 6 months data
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = monthDate.toISOString().substring(0, 7); // YYYY-MM format
        const monthName = monthDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
        
        monthlyData[monthKey] = {
            name: monthName,
            expenses: 0,
            count: 0
        };
    }
    
    // Calculate expenses for each month
    expenses.forEach(expense => {
        const expenseMonth = expense.date.substring(0, 7);
        if (monthlyData[expenseMonth]) {
            monthlyData[expenseMonth].expenses += parseFloat(expense.amount);
            monthlyData[expenseMonth].count++;
        }
    });
    
    const maxAmount = Math.max(...Object.values(monthlyData).map(data => data.expenses), 1);
    
    let html = '<div class="row">';
    
    Object.values(monthlyData).forEach((data, index) => {
        const heightPercentage = (data.expenses / maxAmount) * 100;
        
        html += `
            <div class="col-2 text-center">
                <div class="mb-2">
                    <div class="bg-primary mx-auto" 
                         style="width: 30px; height: ${Math.max(heightPercentage, 5)}px; max-height: 150px;">
                    </div>
                </div>
                <small class="text-muted">${data.name}</small>
                <div><strong>â‚¬${data.expenses.toFixed(0)}</strong></div>
                <small class="text-muted">${data.count} spese</small>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderYearlyTrend(expenses) {
    const container = document.getElementById('yearlyTrendChart');
    if (!container) return;
    
    // Simple yearly trend visualization
    const currentYear = new Date().getFullYear();
    const yearlyExpenses = expenses.filter(exp => new Date(exp.date).getFullYear() === currentYear);
    const totalThisYear = yearlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const lastYear = currentYear - 1;
    const lastYearExpenses = expenses.filter(exp => new Date(exp.date).getFullYear() === lastYear);
    const totalLastYear = lastYearExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const trend = totalLastYear > 0 ? ((totalThisYear - totalLastYear) / totalLastYear) * 100 : 0;
    const isPositiveTrend = trend > 0;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="row">
                <div class="col-6">
                    <h5>${lastYear}</h5>
                    <h3 class="text-muted">â‚¬${totalLastYear.toFixed(2)}</h3>
                    <small class="text-muted">${lastYearExpenses.length} spese</small>
                </div>
                <div class="col-6">
                    <h5>${currentYear}</h5>
                    <h3 class="text-primary">â‚¬${totalThisYear.toFixed(2)}</h3>
                    <small class="text-muted">${yearlyExpenses.length} spese</small>
                </div>
            </div>
            <div class="mt-3">
                <div class="d-flex align-items-center justify-content-center">
                    <i class="fas fa-arrow-${isPositiveTrend ? 'up text-danger' : 'down text-success'} me-2"></i>
                    <span class="${isPositiveTrend ? 'text-danger' : 'text-success'}">
                        ${Math.abs(trend).toFixed(1)}% rispetto al ${lastYear}
                    </span>
                </div>
                <small class="text-muted">
                    ${isPositiveTrend ? 'Aumento' : 'Diminuzione'} dei costi
                </small>
            </div>
        </div>
    `;
}

function renderPerformanceMetrics(expenses) {
    // Calculate performance metrics
    const monthlyData = {};
    const categoryTotals = {};
    
    expenses.forEach(expense => {
        const month = expense.date.substring(0, 7);
        const category = expense.categoryId;
        
        if (!monthlyData[month]) monthlyData[month] = 0;
        if (!categoryTotals[category]) categoryTotals[category] = 0;
        
        monthlyData[month] += parseFloat(expense.amount);
        categoryTotals[category] += parseFloat(expense.amount);
    });
    
    // Best month (lowest expenses)
    const bestMonth = Object.entries(monthlyData).reduce((best, [month, amount]) => 
        !best || amount < best.amount ? { month, amount } : best, null);
    
    // Top category
    const topCategory = Object.entries(categoryTotals).reduce((top, [categoryId, amount]) => 
        !top || amount > top.amount ? { categoryId, amount } : top, null);
    
    // Average expense
    const avgExpense = expenses.length > 0 ? 
        expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) / expenses.length : 0;
    
    // Update metrics
    if (bestMonth) {
        updateElement('bestMonth', new Date(bestMonth.month + '-01').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }));
        updateElement('bestMonthProfit', `â‚¬${bestMonth.amount.toFixed(2)} costi`);
    }
    
    if (topCategory) {
        const category = (app.data.costCategories || []).find(cat => cat.id === topCategory.categoryId);
        updateElement('topCategory', category ? category.name : 'Sconosciuta');
        updateElement('topCategoryAmount', `â‚¬${topCategory.amount.toFixed(2)} spesi`);
    }
    
    updateElement('avgExpense', `â‚¬${avgExpense.toFixed(2)}`);
    updateElement('expenseCount', `${expenses.length} transazioni`);
}

// Export functionality
function exportAccountingReport() {
    try {
        const filter = window.accountingDateFilter;
        if (!filter) {
            app.showToast('Filtro date non inizializzato', 'error');
            return;
        }
        
        // Get filtered data
        const loads = getAllLoads().filter(load => isDateInFilterRange(load.date));
        const orders = getFilteredOrders().filter(order => isDateInFilterRange(order.date));
        const expenses = getAllExpenses().filter(expense => isDateInFilterRange(expense.date));
        
        // Calculate totals
        const totalLoadRevenue = loads.reduce((sum, load) => sum + (parseFloat(load.amount) || 15), 0);
        const totalOrderRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
        const totalIncome = totalLoadRevenue + totalOrderRevenue;
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const netProfit = totalIncome - totalExpenses;
        
        // Create export data
        const data = [
            { Tipo: 'RICAVI DA CARICHI', Importo: totalLoadRevenue.toFixed(2) },
            { Tipo: 'RICAVI DA ORDINI', Importo: totalOrderRevenue.toFixed(2) },
            { Tipo: 'TOTALE RICAVI', Importo: totalIncome.toFixed(2) },
            { Tipo: '', Importo: '' },
            { Tipo: 'TOTALE COSTI', Importo: totalExpenses.toFixed(2) },
            { Tipo: '', Importo: '' },
            { Tipo: 'PROFITTO NETTO', Importo: netProfit.toFixed(2) },
            { Tipo: 'MARGINE %', Importo: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) + '%' : '0%' }
        ];
        
        const csv = convertToCSV(data);
        const period = filter.type === 'month' ? 'mese-corrente' : 
                      filter.type === 'year' ? 'anno-corrente' : 
                      'range-personalizzato';
        downloadCSV(csv, `report-contabilita-${period}.csv`);
        app.showToast('Report esportato con successo', 'success');
        
    } catch (error) {
        console.error('Error exporting report:', error);
        app.showToast('Errore nell\'esportazione del report', 'error');
    }
}

// Helper functions for data access (these should exist in your app)
function getAllLoads() {
    return app.data.loads || [];
}

function getFilteredOrders() {
    return app.data.orders || [];
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
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

// Debug functions (make available globally)
window.checkMigrationStatus = function() {
    console.log('=== MIGRATION STATUS CHECK ===');
    
    const oldCosts = localStorage.getItem('boilerCosts');
    if (oldCosts) {
        try {
            const parsed = JSON.parse(oldCosts);
            console.log(`Found ${parsed.length} old boilerCosts records:`, parsed);
        } catch (e) {
            console.log('Found boilerCosts but could not parse:', oldCosts);
        }
    } else {
        console.log('No old boilerCosts found in localStorage');
    }
    
    if (app.data.expenses) {
        console.log(`Current expenses count: ${app.data.expenses.length}`);
        const migrated = app.data.expenses.filter(e => e.migratedFrom === 'boilerCosts');
        console.log(`Migrated expenses count: ${migrated.length}`);
        if (migrated.length > 0) {
            console.log('Sample migrated expense:', migrated[0]);
        }
    } else {
        console.log('No expenses array found');
    }
    
    const backup = localStorage.getItem('boilerCosts_migration_backup');
    if (backup) {
        try {
            const parsed = JSON.parse(backup);
            console.log(`Migration backup created at: ${parsed.migratedAt}`);
            console.log(`Backup contains ${parsed.boilerCosts.length} records`);
        } catch (e) {
            console.log('Found backup but could not parse');
        }
    } else {
        console.log('No migration backup found');
    }
    
    console.log('=== END MIGRATION STATUS ===');
};

window.forceMigration = function() {
    console.log('=== FORCING MIGRATION ===');
    const originalExpenses = app.data.expenses;
    app.data.expenses = [];
    
    try {
        migrateOldCosts();
        console.log('Forced migration completed');
        refreshAccountingData();
        return true;
    } catch (e) {
        console.error('Error during forced migration:', e);
        app.data.expenses = originalExpenses;
        return false;
    }
};

console.log('âœ… Accounting refactored module loaded successfully');
