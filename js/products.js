// Products Management

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

function loadProductsPage(container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="fas fa-boxes"></i> Gestione Prodotti</h2>
                    <button class="btn btn-success" onclick="openProductModal()">
                        <i class="fas fa-plus"></i> Nuovo Prodotto
                    </button>
                </div>

                <!-- Tabs Navigation -->
                <ul class="nav nav-tabs mb-4" id="productTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="products-tab" data-bs-toggle="tab" data-bs-target="#products-pane" type="button" role="tab">
                            <i class="fas fa-boxes"></i> Prodotti
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories-pane" type="button" role="tab">
                            <i class="fas fa-tags"></i> Categorie
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="units-tab" data-bs-toggle="tab" data-bs-target="#units-pane" type="button" role="tab">
                            <i class="fas fa-balance-scale"></i> Unità di Misura
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="productTabContent">
                    <!-- Prodotti Tab -->
                    <div class="tab-pane fade show active" id="products-pane" role="tabpanel">
                        <div id="products-list">
                            <!-- Lista prodotti verrà generata qui -->
                        </div>
                    </div>

                    <!-- Categorie Tab -->
                    <div class="tab-pane fade" id="categories-pane" role="tabpanel">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-tags"></i> Gestione Categorie Prodotto</h4>
                            <button class="btn btn-success" onclick="openCategoryModal()">
                                <i class="fas fa-plus"></i> Nuova Categoria
                            </button>
                        </div>
                        <div id="categories-list">
                            <!-- Lista categorie verrà generata qui -->
                        </div>
                    </div>

                    <!-- Unità di Misura Tab -->
                    <div class="tab-pane fade" id="units-pane" role="tabpanel">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4><i class="fas fa-balance-scale"></i> Gestione Unità di Misura</h4>
                            <button class="btn btn-success" onclick="openUnitModal()">
                                <i class="fas fa-plus"></i> Nuova Unità
                            </button>
                        </div>
                        <div id="units-list">
                            <!-- Lista unità verrà generata qui -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inizializza i dati se non esistono
    initializeProductCategories();
    initializeUnitsOfMeasure();

    // Render iniziale delle liste
    renderProductsList();
    renderCategoriesList();
    renderUnitsList();
    updateCategoryFilter();

    // Event listener per i tab
    const categoriesTab = document.getElementById('categories-tab');
    const unitsTab = document.getElementById('units-tab');
    
    if (categoriesTab) {
        categoriesTab.addEventListener('shown.bs.tab', function () {
            renderCategoriesList();
        });
    }

    if (unitsTab) {
        unitsTab.addEventListener('shown.bs.tab', function () {
            renderUnitsList();
        });
    }

    // Aggiungi il modal dei prodotti
    addProductModal();
}

function addProductModal() {
    const modalHtml = `
        <!-- Product Modal -->
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalTitle">Nuovo Prodotto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm">
                            <input type="hidden" id="productId">
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">Nome Prodotto *</label>
                                    <input type="text" class="form-control" id="productName" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Prezzo (€) *</label>
                                    <input type="number" step="0.01" class="form-control" id="productPrice" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Categoria *</label>
                                    <select class="form-select" id="productCategory" required>
                                        <option value="">Seleziona categoria</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Unità di Misura *</label>
                                    <select class="form-select" id="productUnit" required>
                                        <option value="">Seleziona unità</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stock Attuale</label>
                                    <input type="number" class="form-control" id="productStock" min="0" value="0">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stock Minimo</label>
                                    <input type="number" class="form-control" id="productMinStock" min="0" value="10">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrizione</label>
                                <textarea class="form-control" id="productDescription" rows="3"></textarea>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="productIsActive" checked>
                                <label class="form-check-label" for="productIsActive">
                                    Prodotto attivo
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-primary" onclick="saveProduct()">Salva</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Rimuovi modal esistente se presente
    const existingModal = document.getElementById('productModal');
    if (existingModal) existingModal.remove();

    // Aggiungi nuovo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function renderProductsList() {
    const container = document.getElementById('products-list');
    if (!container) return;

    const products = app.data.products || [];
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-boxes fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessun prodotto trovato</h5>
                <p class="text-muted">Inizia creando il primo prodotto</p>
                <button class="btn btn-success" onclick="openProductModal()">
                    <i class="fas fa-plus"></i> Crea Primo Prodotto
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead class="table-light"><tr>';
    html += '<th>Nome</th><th>Categoria</th><th>Unità</th><th>Prezzo</th><th>Stock</th><th>Stato</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    products.forEach(product => {
        // Ottieni categoria e unità
        const category = app.data.productCategories?.find(c => c.id === product.categoryId) || 
                        { name: product.category || 'N/A', color: '#6c757d' };
        const unit = app.data.unitsOfMeasure?.find(u => u.id === product.unitId) || 
                    { symbol: product.unit || 'N/A' };

        const stockLevel = product.stock <= product.minStock ? 'danger' : 
                          product.stock <= product.minStock * 2 ? 'warning' : 'success';
        
        const statusClass = product.isActive ? 'success' : 'secondary';
        const statusText = product.isActive ? 'Attivo' : 'Disattivo';
        
        html += `<tr>
            <td><strong>${product.name}</strong></td>
            <td>
                <span class="badge" style="background-color: ${category.color}">
                    ${category.name}
                </span>
            </td>
            <td><span class="badge bg-info">${unit.symbol}</span></td>
            <td>€${product.price.toFixed(2)}</td>
            <td>
                <span class="badge bg-${stockLevel}">
                    ${product.stock} / ${product.minStock}
                </span>
            </td>
            <td><span class="badge bg-${statusClass}">${statusText}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function openProductModal(productId = null) {
    const isEdit = productId !== null;
    const product = isEdit ? app.data.products.find(p => p.id === productId) : null;
    
    // Popola categorie dinamicamente
    const categorySelect = document.getElementById('productCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Seleziona categoria</option>';
        const activeCategories = (app.data.productCategories || []).filter(c => c.isActive);
        activeCategories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    }
    
    // Popola unità di misura dinamicamente
    const unitSelect = document.getElementById('productUnit');
    if (unitSelect) {
        unitSelect.innerHTML = '<option value="">Seleziona unità</option>';
        const activeUnits = (app.data.unitsOfMeasure || []).filter(u => u.isActive);
        activeUnits.forEach(unit => {
            unitSelect.innerHTML += `<option value="${unit.id}">${unit.name} (${unit.symbol})</option>`;
        });
    }
    
    if (isEdit && product) {
        document.getElementById('productModalTitle').textContent = 'Modifica Prodotto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.categoryId || product.category;
        document.getElementById('productUnit').value = product.unitId || product.unit;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productMinStock').value = product.minStock;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productIsActive').checked = product.isActive;
    } else {
        document.getElementById('productModalTitle').textContent = 'Nuovo Prodotto';
        document.getElementById('productForm').reset();
        document.getElementById('productIsActive').checked = true;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = document.getElementById('productId').value;
    const categoryId = document.getElementById('productCategory').value;
    const unitId = document.getElementById('productUnit').value;
    
    // Ottieni i nomi delle categorie e unità per backward compatibility
    const category = app.data.productCategories.find(c => c.id === categoryId);
    const unit = app.data.unitsOfMeasure.find(u => u.id === unitId);
    
    const productData = {
        name: document.getElementById('productName').value,
        categoryId: categoryId,
        category: category ? category.name : '',
        unitId: unitId,
        unit: unit ? unit.symbol : '',
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        minStock: parseInt(document.getElementById('productMinStock').value) || 10,
        description: document.getElementById('productDescription').value,
        isActive: document.getElementById('productIsActive').checked
    };
    
    if (productId) {
        // Update existing product
        const productIndex = app.data.products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            app.data.products[productIndex] = {
                ...app.data.products[productIndex],
                ...productData,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new product
        const newProduct = {
            id: app.generateId(),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        app.data.products.push(newProduct);
    }
    
    app.saveData('products', app.data.products);
    app.updateDashboard();
    renderProductsList();

    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();

    app.showToast(
        productId ? 'Prodotto aggiornato con successo!' : 'Prodotto creato con successo!',
        'success'
    );
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    const product = app.data.products.find(p => p.id === productId);
    if (!product) return;
    
    ConfirmationDialog.confirmDelete(product.name, 'il prodotto').then(confirmed => {
        if (confirmed) {
            app.data.products = app.data.products.filter(p => p.id !== productId);
            app.saveData('products', app.data.products);
            renderProductsList();
            app.showToast('Prodotto eliminato con successo!', 'success');
        }
    });
}

// ==========================================
// CATEGORIE PRODOTTO
// ==========================================

function initializeProductCategories() {
    if (!app.data.productCategories) {
        app.data.productCategories = [
            {
                id: 'cat_' + Date.now() + '_1',
                name: 'Legna da Ardere',
                code: 'LEGNA',
                description: 'Legna da ardere di vario tipo',
                color: '#8B4513',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'cat_' + Date.now() + '_2',
                name: 'Pellet',
                code: 'PELLET',
                description: 'Pellet di legno compresso',
                color: '#DAA520',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'cat_' + Date.now() + '_3',
                name: 'Cippato',
                code: 'CIPPATO',
                description: 'Cippato di legno',
                color: '#CD853F',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'cat_' + Date.now() + '_4',
                name: 'Bricchetti',
                code: 'BRICCH',
                description: 'Bricchetti di legno pressato',
                color: '#A0522D',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
        app.saveData('productCategories', app.data.productCategories);
    }
}

function renderCategoriesList() {
    const container = document.getElementById('categories-list');
    if (!container) return;

    const categories = app.data.productCategories || [];
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-tags fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessuna categoria trovata</h5>
                <p class="text-muted">Inizia creando la prima categoria</p>
                <button class="btn btn-success" onclick="openCategoryModal()">
                    <i class="fas fa-plus"></i> Crea Prima Categoria
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead class="table-light"><tr>';
    html += '<th>Codice</th><th>Nome</th><th>Descrizione</th><th>Colore</th><th>Stato</th><th>Prodotti</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    categories.forEach(category => {
        const productCount = (app.data.products || []).filter(p => p.categoryId === category.id).length;
        const statusClass = category.isActive ? 'success' : 'danger';
        const statusText = category.isActive ? 'Attiva' : 'Disattivata';
        
        html += `<tr>
            <td><span class="badge" style="background-color: ${category.color}">${category.code}</span></td>
            <td><strong>${category.name}</strong></td>
            <td>${category.description || '-'}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div style="width: 20px; height: 20px; background-color: ${category.color}; border-radius: 3px; border: 1px solid #ddd;" class="me-2"></div>
                    <code>${category.color}</code>
                </div>
            </td>
            <td><span class="badge bg-${statusClass}">${statusText}</span></td>
            <td><span class="badge bg-info">${productCount}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editCategory('${category.id}')" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCategory('${category.id}')" title="Elimina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function openCategoryModal(categoryId = null) {
    const isEdit = categoryId !== null;
    const category = isEdit ? app.data.productCategories.find(c => c.id === categoryId) : null;
    
    const modalHtml = `
        <div class="modal fade" id="categoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-tags"></i> ${isEdit ? 'Modifica Categoria' : 'Nuova Categoria'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="categoryForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Codice *</label>
                                    <input type="text" class="form-control" id="categoryCode" value="${category ? category.code : ''}" maxlength="10" required>
                                    <small class="text-muted">Max 10 caratteri</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nome *</label>
                                    <input type="text" class="form-control" id="categoryName" value="${category ? category.name : ''}" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrizione</label>
                                <textarea class="form-control" id="categoryDescription" rows="3">${category ? category.description : ''}</textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Colore</label>
                                    <input type="color" class="form-control form-control-color" id="categoryColor" value="${category ? category.color : '#007bff'}">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stato</label>
                                    <select class="form-select" id="categoryStatus">
                                        <option value="true" ${category && category.isActive ? 'selected' : ''}>Attiva</option>
                                        <option value="false" ${category && !category.isActive ? 'selected' : ''}>Disattivata</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-success" onclick="saveCategory('${categoryId || ''}')">
                            <i class="fas fa-save"></i> ${isEdit ? 'Aggiorna' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('categoryModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

function saveCategory(categoryId) {
    const form = document.getElementById('categoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Assicurati che l'array esista
    if (!app.data.productCategories) {
        app.data.productCategories = [];
    }

    const categoryData = {
        id: categoryId || 'cat_' + Date.now(),
        code: document.getElementById('categoryCode').value.toUpperCase(),
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        color: document.getElementById('categoryColor').value,
        isActive: document.getElementById('categoryStatus').value === 'true',
        createdAt: categoryId ? (app.data.productCategories.find(c => c.id === categoryId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (categoryId) {
        const index = app.data.productCategories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            app.data.productCategories[index] = categoryData;
            console.log('Categoria aggiornata:', categoryData);
        } else {
            console.error('Categoria non trovata per aggiornamento:', categoryId);
            app.data.productCategories.push(categoryData);
        }
    } else {
        app.data.productCategories.push(categoryData);
        console.log('Nuova categoria aggiunta:', categoryData);
    }

    app.saveData('productCategories', app.data.productCategories);
    console.log('Categorie salvate in localStorage:', app.data.productCategories);
    renderCategoriesList();
    updateCategoryFilter();

    const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    modal.hide();

    app.showToast(
        categoryId ? 'Categoria aggiornata con successo!' : 'Categoria creata con successo!',
        'success'
    );
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

function deleteCategory(categoryId) {
    const category = app.data.productCategories.find(c => c.id === categoryId);
    const productCount = (app.data.products || []).filter(p => p.categoryId === categoryId).length;
    
    if (productCount > 0) {
        app.showToast(`Impossibile eliminare: ${productCount} prodotti usano questa categoria`, 'warning');
        return;
    }
    
    ConfirmationDialog.confirmDelete(category.name, 'la categoria').then(confirmed => {
        if (confirmed) {
            app.data.productCategories = app.data.productCategories.filter(c => c.id !== categoryId);
            app.saveData('productCategories', app.data.productCategories);
            renderCategoriesList();
            updateCategoryFilter();
            app.showToast('Categoria eliminata con successo!', 'success');
        }
    });
}

// ==========================================
// UNITÀ DI MISURA
// ==========================================

function initializeUnitsOfMeasure() {
    if (!app.data.unitsOfMeasure) {
        app.data.unitsOfMeasure = [
            {
                id: 'unit_' + Date.now() + '_1',
                name: 'Chilogrammo',
                symbol: 'kg',
                type: 'peso',
                description: 'Unità di misura del peso',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'unit_' + Date.now() + '_2',
                name: 'Metro Cubo',
                symbol: 'm³',
                type: 'volume',
                description: 'Unità di misura del volume',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'unit_' + Date.now() + '_3',
                name: 'Quintale',
                symbol: 'q',
                type: 'peso',
                description: '100 chilogrammi',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'unit_' + Date.now() + '_4',
                name: 'Tonnellata',
                symbol: 't',
                type: 'peso',
                description: '1000 chilogrammi',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'unit_' + Date.now() + '_5',
                name: 'Pezzo',
                symbol: 'pz',
                type: 'quantita',
                description: 'Singola unità',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'unit_' + Date.now() + '_6',
                name: 'Sacco',
                symbol: 'sacco',
                type: 'confezione',
                description: 'Confezione standard',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
        app.saveData('unitsOfMeasure', app.data.unitsOfMeasure);
    }
}

function renderUnitsList() {
    const container = document.getElementById('units-list');
    if (!container) return;

    const units = app.data.unitsOfMeasure || [];
    
    if (units.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Nessuna unità di misura trovata</h5>
                <p class="text-muted">Inizia creando la prima unità</p>
                <button class="btn btn-success" onclick="openUnitModal()">
                    <i class="fas fa-plus"></i> Crea Prima Unità
                </button>
            </div>
        `;
        return;
    }

    // Group by type
    const groupedUnits = units.reduce((groups, unit) => {
        const type = unit.type || 'altro';
        if (!groups[type]) groups[type] = [];
        groups[type].push(unit);
        return groups;
    }, {});

    let html = '';
    
    Object.entries(groupedUnits).forEach(([type, typeUnits]) => {
        const typeNames = {
            'peso': 'Peso',
            'volume': 'Volume',
            'quantita': 'Quantità',
            'confezione': 'Confezioni',
            'altro': 'Altro'
        };
        
        html += `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0"><i class="fas fa-folder"></i> ${typeNames[type] || type}</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th>Simbolo</th>
                                    <th>Nome</th>
                                    <th>Descrizione</th>
                                    <th>Stato</th>
                                    <th>Prodotti</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        typeUnits.forEach(unit => {
            const productCount = (app.data.products || []).filter(p => p.unitId === unit.id).length;
            const statusClass = unit.isActive ? 'success' : 'danger';
            const statusText = unit.isActive ? 'Attiva' : 'Disattivata';
            
            html += `<tr>
                <td><span class="badge bg-primary">${unit.symbol}</span></td>
                <td><strong>${unit.name}</strong></td>
                <td>${unit.description || '-'}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td><span class="badge bg-info">${productCount}</span></td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="editUnit('${unit.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteUnit('${unit.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openUnitModal(unitId = null) {
    const isEdit = unitId !== null;
    const unit = isEdit ? app.data.unitsOfMeasure.find(u => u.id === unitId) : null;
    
    const modalHtml = `
        <div class="modal fade" id="unitModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-balance-scale"></i> ${isEdit ? 'Modifica Unità' : 'Nuova Unità di Misura'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="unitForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Simbolo *</label>
                                    <input type="text" class="form-control" id="unitSymbol" value="${unit ? unit.symbol : ''}" maxlength="10" required>
                                    <small class="text-muted">Es: kg, m³, pz</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nome *</label>
                                    <input type="text" class="form-control" id="unitName" value="${unit ? unit.name : ''}" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Tipo</label>
                                    <select class="form-select" id="unitType">
                                        <option value="peso" ${unit && unit.type === 'peso' ? 'selected' : ''}>Peso</option>
                                        <option value="volume" ${unit && unit.type === 'volume' ? 'selected' : ''}>Volume</option>
                                        <option value="quantita" ${unit && unit.type === 'quantita' ? 'selected' : ''}>Quantità</option>
                                        <option value="confezione" ${unit && unit.type === 'confezione' ? 'selected' : ''}>Confezione</option>
                                        <option value="altro" ${unit && unit.type === 'altro' ? 'selected' : ''}>Altro</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Stato</label>
                                    <select class="form-select" id="unitStatus">
                                        <option value="true" ${unit && unit.isActive ? 'selected' : ''}>Attiva</option>
                                        <option value="false" ${unit && !unit.isActive ? 'selected' : ''}>Disattivata</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrizione</label>
                                <textarea class="form-control" id="unitDescription" rows="3">${unit ? unit.description : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-success" onclick="saveUnit('${unitId || ''}')">
                            <i class="fas fa-save"></i> ${isEdit ? 'Aggiorna' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('unitModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('unitModal'));
    modal.show();
}

function saveUnit(unitId) {
    const form = document.getElementById('unitForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Assicurati che l'array esista
    if (!app.data.unitsOfMeasure) {
        app.data.unitsOfMeasure = [];
    }

    const unitData = {
        id: unitId || 'unit_' + Date.now(),
        symbol: document.getElementById('unitSymbol').value,
        name: document.getElementById('unitName').value,
        type: document.getElementById('unitType').value,
        description: document.getElementById('unitDescription').value,
        isActive: document.getElementById('unitStatus').value === 'true',
        createdAt: unitId ? (app.data.unitsOfMeasure.find(u => u.id === unitId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (unitId) {
        const index = app.data.unitsOfMeasure.findIndex(u => u.id === unitId);
        if (index !== -1) {
            app.data.unitsOfMeasure[index] = unitData;
            console.log('Unità aggiornata:', unitData);
        } else {
            console.error('Unità non trovata per aggiornamento:', unitId);
            app.data.unitsOfMeasure.push(unitData);
        }
    } else {
        app.data.unitsOfMeasure.push(unitData);
        console.log('Nuova unità aggiunta:', unitData);
    }

    app.saveData('unitsOfMeasure', app.data.unitsOfMeasure);
    console.log('Unità salvate in localStorage:', app.data.unitsOfMeasure);
    renderUnitsList();

    const modal = bootstrap.Modal.getInstance(document.getElementById('unitModal'));
    modal.hide();

    app.showToast(
        unitId ? 'Unità aggiornata con successo!' : 'Unità creata con successo!',
        'success'
    );
}

function editUnit(unitId) {
    openUnitModal(unitId);
}

function deleteUnit(unitId) {
    const unit = app.data.unitsOfMeasure.find(u => u.id === unitId);
    const productCount = (app.data.products || []).filter(p => p.unitId === unitId).length;
    
    if (productCount > 0) {
        app.showToast(`Impossibile eliminare: ${productCount} prodotti usano questa unità`, 'warning');
        return;
    }
    
    ConfirmationDialog.confirmDelete(`${unit.name} (${unit.symbol})`, 'l\'unità di misura').then(confirmed => {
        if (confirmed) {
            app.data.unitsOfMeasure = app.data.unitsOfMeasure.filter(u => u.id !== unitId);
            app.saveData('unitsOfMeasure', app.data.unitsOfMeasure);
            renderUnitsList();
            app.showToast('Unità eliminata con successo!', 'success');
        }
    });
}

function updateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    const categories = app.data.productCategories || [];
    
    let options = '<option value="">Tutte le categorie</option>';
    categories.filter(c => c.isActive).forEach(category => {
        options += `<option value="${category.id}">${category.name}</option>`;
    });
    
    filter.innerHTML = options;
}