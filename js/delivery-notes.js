// ==========================================
// DOCUMENTO DI TRASPORTO
// ==========================================

function generateDeliveryNote(orderId) {
    const order = app.data.orders.find(o => o.id === orderId);
    if (!order) {
        app.showToast('Ordine non trovato', 'error');
        return;
    }

    const customer = app.data.customers.find(c => c.id === order.customerId);
    if (!customer) {
        app.showToast('Cliente non trovato', 'error');
        return;
    }

    // Apri modal per compilare i dati del documento di trasporto
    openDeliveryNoteModal(order, customer);
}

function openDeliveryNoteModal(order, customer) {
    // Rimuovi modal esistente se presente
    const existingModal = document.getElementById('deliveryNoteModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div class="modal fade" id="deliveryNoteModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-truck"></i> Documento di Trasporto - Ordine ${order.orderNumber}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="deliveryNoteForm">
                            <div class="row">
                                <!-- Dati Documento -->
                                <div class="col-md-6">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="fas fa-file-alt"></i> Dati Documento
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">Numero DDT *</label>
                                        <input type="text" class="form-control" id="ddtNumber" value="${generateDDTNumber()}" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label class="form-label">Data DDT *</label>
                                            <input type="date" class="form-control" id="ddtDate" value="${new Date().toISOString().split('T')[0]}" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Ora</label>
                                            <input type="time" class="form-control" id="ddtTime" value="${new Date().toTimeString().slice(0,5)}">
                                        </div>
                                    </div>
                                </div>

                                <!-- Dati Trasporto -->
                                <div class="col-md-6">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="fas fa-shipping-fast"></i> Dati Trasporto
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">Causale Trasporto *</label>
                                        <select class="form-select" id="transportReason" required>
                                            <option value="">Seleziona causale</option>
                                            <option value="vendita" selected>Vendita</option>
                                            <option value="conto_lavorazione">Conto lavorazione</option>
                                            <option value="conto_deposito">Conto deposito</option>
                                            <option value="conto_visione">Conto visione</option>
                                            <option value="reso">Reso</option>
                                            <option value="omaggio">Omaggio</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Trasportatore</label>
                                        <input type="text" class="form-control" id="carrier" placeholder="Nome trasportatore">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Tipo Porto</label>
                                        <select class="form-select" id="portType">
                                            <option value="franco">Franco</option>
                                            <option value="assegnato" selected>Assegnato</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row mt-3">
                                <!-- Dati Mittente -->
                                <div class="col-md-6">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="fas fa-warehouse"></i> Mittente
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">Ragione Sociale *</label>
                                        <input type="text" class="form-control" id="senderName" value="D.I. MALLFARM" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Indirizzo *</label>
                                        <input type="text" class="form-control" id="senderAddress" value="Località Colpratello 1" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label class="form-label">CAP *</label>
                                            <input type="text" class="form-control" id="senderCap" value="60041" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Città *</label>
                                            <input type="text" class="form-control" id="senderCity" value="Sassoferrato" required>
                                        </div>
                                    </div>
                                </div>

                                <!-- Dati Destinatario -->
                                <div class="col-md-6">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="fas fa-map-marker-alt"></i> Destinatario
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">Ragione Sociale *</label>
                                        <input type="text" class="form-control" id="recipientName" value="${customer.name}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Indirizzo *</label>
                                        <input type="text" class="form-control" id="recipientAddress" value="${customer.address || ''}" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label class="form-label">CAP *</label>
                                            <input type="text" class="form-control" id="recipientCap" value="${customer.zipCode || ''}" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Città *</label>
                                            <input type="text" class="form-control" id="recipientCity" value="${customer.city || ''}" required>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6 class="border-bottom pb-2 mb-3">
                                        <i class="fas fa-boxes"></i> Articoli da Trasportare
                                    </h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Descrizione</th>
                                                    <th>Quantità</th>
                                                    <th>Unità</th>
                                                    <th>Colli</th>
                                                    <th>Peso (kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody id="ddtItemsTable">
                                                ${order.items.map(item => {
                                                    const product = app.data.products.find(p => p.id === item.productId);
                                                    return `
                                                        <tr>
                                                            <td>${product ? product.name : 'Prodotto sconosciuto'}</td>
                                                            <td>${item.quantity}</td>
                                                            <td>${getUnitName(product?.unit || item.unit || 'pz')}</td>
                                                            <td><input type="number" class="form-control form-control-sm" value="1" min="1"></td>
                                                            <td><input type="number" class="form-control form-control-sm" step="0.1" min="0" placeholder="0.0"></td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-md-12">
                                    <label class="form-label">Note</label>
                                    <textarea class="form-control" id="ddtNotes" rows="3" placeholder="Note aggiuntive per il trasporto..."></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                        <button type="button" class="btn btn-warning" onclick="previewDeliveryNote('${order.id}')">
                            <i class="fas fa-eye"></i> Anteprima
                        </button>
                        <button type="button" class="btn btn-success" onclick="printDeliveryNote('${order.id}')">
                            <i class="fas fa-print"></i> Stampa DDT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('deliveryNoteModal'));
    modal.show();
}

function generateDDTNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    return `DDT${year}${month}${day}-${time}`;
}

function previewDeliveryNote(orderId) {
    const deliveryNoteData = collectDeliveryNoteData(orderId);
    if (!deliveryNoteData) return;

    const printContent = generateDeliveryNotePrint(deliveryNoteData);
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(printContent);
    previewWindow.document.close();
}

function printDeliveryNote(orderId) {
    const form = document.getElementById('deliveryNoteForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const deliveryNoteData = collectDeliveryNoteData(orderId);
    if (!deliveryNoteData) return;

    // Salva il DDT nei dati dell'app per future consultazioni
    saveDeliveryNote(deliveryNoteData);

    const printContent = generateDeliveryNotePrint(deliveryNoteData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();

    // Chiudi il modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deliveryNoteModal'));
    modal.hide();

    app.showToast('Documento di trasporto generato con successo!', 'success');
}

function collectDeliveryNoteData(orderId) {
    const order = app.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    const customer = app.data.customers.find(c => c.id === order.customerId);

    // Raccogli i dati del modulo
    const ddtItems = [];
    const table = document.getElementById('ddtItemsTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        if (cells.length > 0) {
            const colli = row.querySelector('input[type="number"]').value || '1';
            const peso = row.querySelectorAll('input[type="number"]')[1].value || '0';
            
            ddtItems.push({
                description: cells[0].textContent,
                quantity: cells[1].textContent,
                unit: cells[2].textContent,
                colli: colli,
                peso: peso
            });
        }
    }

    return {
        order: order,
        customer: customer,
        ddtNumber: document.getElementById('ddtNumber').value,
        ddtDate: document.getElementById('ddtDate').value,
        ddtTime: document.getElementById('ddtTime').value,
        transportReason: document.getElementById('transportReason').value,
        carrier: document.getElementById('carrier').value,
        portType: document.getElementById('portType').value,
        sender: {
            name: document.getElementById('senderName').value,
            address: document.getElementById('senderAddress').value,
            cap: document.getElementById('senderCap').value,
            city: document.getElementById('senderCity').value
        },
        recipient: {
            name: document.getElementById('recipientName').value,
            address: document.getElementById('recipientAddress').value,
            cap: document.getElementById('recipientCap').value,
            city: document.getElementById('recipientCity').value
        },
        items: ddtItems,
        notes: document.getElementById('ddtNotes').value,
        createdAt: new Date().toISOString()
    };
}

function saveDeliveryNote(deliveryNoteData) {
    if (!app.data.deliveryNotes) {
        app.data.deliveryNotes = [];
    }

    const ddt = {
        id: app.generateId(),
        ...deliveryNoteData
    };

    app.data.deliveryNotes.push(ddt);
    app.saveData('deliveryNotes', app.data.deliveryNotes);
}

function generateDeliveryNotePrint(data) {
    // Usa la nuova funzione per ottenere il logo
    const logoSrc = window.getLogoForPDF ? window.getLogoForPDF() : 'assets/MALL FARM_cropped.png';
    const isBase64 = logoSrc.startsWith('data:');
    
    const transportReasonText = {
        'vendita': 'Vendita',
        'conto_lavorazione': 'Conto lavorazione',
        'conto_deposito': 'Conto deposito',
        'conto_visione': 'Conto visione',
        'reso': 'Reso',
        'omaggio': 'Omaggio'
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Documento di Trasporto - ${data.ddtNumber}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    font-size: 12px;
                    line-height: 1.4;
                }
                .header { 
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 2px solid #333; 
                    padding-bottom: 15px; 
                    margin-bottom: 20px;
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
                    font-size: 20px; 
                    font-weight: bold;
                    color: #2d5a27;
                }
                .company-info p {
                    margin: 2px 0;
                    color: #666;
                    font-size: 11px;
                }
                .document-title {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    color: #333;
                }
                .section { 
                    margin-bottom: 15px; 
                    border: 1px solid #ccc; 
                    padding: 10px;
                }
                .section-title { 
                    font-weight: bold; 
                    margin-bottom: 8px; 
                    background-color: #f8f9fa; 
                    padding: 5px;
                    border-left: 4px solid #2d5a27;
                }
                .row { 
                    display: flex; 
                    margin-bottom: 5px;
                }
                .col { 
                    flex: 1; 
                    padding-right: 10px;
                }
                .label { 
                    font-weight: bold; 
                    display: inline-block; 
                    width: 120px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                }
                th, td { 
                    border: 1px solid #333; 
                    padding: 8px; 
                    text-align: left;
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .signature-section {
                    margin-top: 30px;
                    display: flex;
                    justify-content: space-between;
                }
                .signature-box {
                    width: 200px;
                    border: 1px solid #333;
                    height: 80px;
                    text-align: center;
                    padding: 10px;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo-section">
                    <img src="${logoSrc}" alt="Mall Farm Logo" ${isBase64 ? 'style="max-width: 150px; height: auto;"' : 'style="height: 60px;"'}>
                </div>
                <div class="document-title">
                    <div>DOCUMENTO DI TRASPORTO</div>
                    <div style="font-size: 14px; margin-top: 5px;">
                        <strong>N. ${data.ddtNumber}</strong>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        del ${new Date(data.ddtDate).toLocaleDateString('it-IT')}
                        ${data.ddtTime ? ` alle ore ${data.ddtTime}` : ''}
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <div class="section">
                        <div class="section-title">MITTENTE</div>
                        <div><span class="label">Ragione Sociale:</span> ${data.sender.name}</div>
                        <div><span class="label">Indirizzo:</span> ${data.sender.address}</div>
                        <div><span class="label">CAP - Città:</span> ${data.sender.cap} ${data.sender.city}</div>
                    </div>
                </div>
                <div class="col">
                    <div class="section">
                        <div class="section-title">DESTINATARIO</div>
                        <div><span class="label">Ragione Sociale:</span> ${data.recipient.name}</div>
                        <div><span class="label">Indirizzo:</span> ${data.recipient.address}</div>
                        <div><span class="label">CAP - Città:</span> ${data.recipient.cap} ${data.recipient.city}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">DATI TRASPORTO</div>
                <div class="row">
                    <div class="col">
                        <div><span class="label">Causale:</span> ${transportReasonText[data.transportReason] || data.transportReason}</div>
                        <div><span class="label">Porto:</span> ${data.portType === 'franco' ? 'Franco' : 'Assegnato'}</div>
                    </div>
                    <div class="col">
                        <div><span class="label">Trasportatore:</span> ${data.carrier || 'Mittente'}</div>
                        <div><span class="label">Ordine N.:</span> ${data.order.orderNumber}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">ARTICOLI TRASPORTATI</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40%;">Descrizione</th>
                            <th style="width: 15%;">Quantità</th>
                            <th style="width: 10%;">Unità</th>
                            <th style="width: 15%;">N. Colli</th>
                            <th style="width: 20%;">Peso (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: center;">${item.unit}</td>
                                <td style="text-align: center;">${item.colli}</td>
                                <td style="text-align: center;">${item.peso}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td style="text-align: right;"><strong>TOTALI:</strong></td>
                            <td style="text-align: center;"><strong>${data.items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)}</strong></td>
                            <td></td>
                            <td style="text-align: center;"><strong>${data.items.reduce((sum, item) => sum + parseFloat(item.colli || 0), 0)}</strong></td>
                            <td style="text-align: center;"><strong>${data.items.reduce((sum, item) => sum + parseFloat(item.peso || 0), 0).toFixed(1)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${data.notes ? `
                <div class="section">
                    <div class="section-title">NOTE</div>
                    <div>${data.notes}</div>
                </div>
            ` : ''}

            <div class="signature-section">
                <div class="signature-box">
                    <div style="margin-bottom: 10px;"><strong>Firma Mittente</strong></div>
                    <div style="height: 40px;"></div>
                </div>
                <div class="signature-box">
                    <div style="margin-bottom: 10px;"><strong>Firma Destinatario</strong></div>
                    <div style="height: 40px;"></div>
                </div>
            </div>

            <div style="margin-top: 20px; font-size: 10px; text-align: center; color: #666;">
                Documento generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}
            </div>
        </body>
        </html>
    `;
}