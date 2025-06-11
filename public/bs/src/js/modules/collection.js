/**
 * Collection module
 */

class Collection {
    constructor() {
        this.collections = [];
        this.donors = [];
        this.screenings = [];
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Registro de Coleta</h1>
                    <button class="btn btn-primary" id="addCollectionBtn">
                        ➕ Nova Coleta
                    </button>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <input type="text" class="form-input search-input" id="searchCollections" 
                           placeholder="Buscar por código ou doador...">
                    <select class="form-select" id="bloodTypeFilterCollection">
                        <option value="">Todos os tipos sanguíneos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                    <button class="btn" id="exportCollectionsBtn">📊 Exportar</button>
                </div>

                <!-- Collections Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Registros de Coleta</h3>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código da Bolsa</th>
                                    <th>Data/Hora</th>
                                    <th>Doador</th>
                                    <th>Tipo Sanguíneo</th>
                                    <th>Volume (ml)</th>
                                    <th>Responsável</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="collectionsTableBody">
                                <!-- Dynamic content -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Today's Collections Summary -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Coletas Hoje</h3>
                        </div>
                        <div class="card-body">
                            <div class="stat-card-value" id="todayCollectionsCount">0</div>
                            <div class="text-sm text-secondary">Total de coletas realizadas</div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Volume Total Hoje</h3>
                        </div>
                        <div class="card-body">
                            <div class="stat-card-value" id="todayTotalVolume">0ml</div>
                            <div class="text-sm text-secondary">Volume coletado hoje</div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Tipo Mais Coletado</h3>
                        </div>
                        <div class="card-body">
                            <div class="stat-card-value" id="mostCollectedType">-</div>
                            <div class="text-sm text-secondary">Tipo sanguíneo mais coletado hoje</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addCollectionBtn') {
                this.showCollectionForm();
            } else if (e.target.classList.contains('view-collection-btn')) {
                this.viewCollection(e.target.dataset.id);
            } else if (e.target.classList.contains('edit-collection-btn')) {
                this.editCollection(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-collection-btn')) {
                this.deleteCollection(e.target.dataset.id);
            } else if (e.target.id === 'exportCollectionsBtn') {
                this.exportCollections();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchCollections') {
                this.searchCollections(e.target.value);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'bloodTypeFilterCollection') {
                this.filterCollections();
            }
        });
    }

    init() {
        this.renderCollectionsTable();
        this.renderTodayStats();
    }

    loadData() {
        this.collections = Storage.getCollections();
        this.donors = Storage.getDonors();
        this.screenings = Storage.getScreenings();
    }

    renderCollectionsTable() {
        const tbody = document.getElementById('collectionsTableBody');
        if (!tbody) return;

        let filteredCollections = [...this.collections];

        // Apply search filter
        const searchTerm = document.getElementById('searchCollections')?.value;
        if (searchTerm) {
            filteredCollections = Helpers.filterItems(
                filteredCollections,
                searchTerm,
                ['bagCode', 'donorName']
            );
        }

        // Apply blood type filter
        const bloodTypeFilter = document.getElementById('bloodTypeFilterCollection')?.value;
        if (bloodTypeFilter) {
            filteredCollections = filteredCollections.filter(collection => 
                Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor) === bloodTypeFilter
            );
        }

        // Sort by date (newest first)
        filteredCollections.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        if (filteredCollections.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-secondary">
                        Nenhuma coleta encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredCollections.map(collection => {
            const donor = this.donors.find(d => d.id === collection.donorId);
            const donorName = donor ? donor.name : collection.donorName || 'Doador não encontrado';
            const bloodType = Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor);

            return `
                <tr>
                    <td class="font-semibold">${collection.bagCode}</td>
                    <td>
                        <div class="font-semibold">${Helpers.formatDate(collection.date)}</div>
                        <div class="text-sm text-secondary">${collection.time}</div>
                    </td>
                    <td>${donorName}</td>
                    <td>
                        <span class="${Helpers.getBloodTypeClass(collection.bloodType, collection.rhFactor)}">
                            ${bloodType}
                        </span>
                    </td>
                    <td class="font-semibold">${collection.volume}ml</td>
                    <td>${collection.technician}</td>
                    <td>${Helpers.getStatusBadge(collection.status || 'coletado')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm view-collection-btn" data-id="${collection.id}">
                                👁️ Ver
                            </button>
                            <button class="btn btn-sm edit-collection-btn" data-id="${collection.id}">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-sm btn-error delete-collection-btn" data-id="${collection.id}">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayCollections = this.collections.filter(c => c.date === today);

        // Count
        const countElement = document.getElementById('todayCollectionsCount');
        if (countElement) {
            countElement.textContent = todayCollections.length;
        }

        // Total volume
        const totalVolume = todayCollections.reduce((sum, c) => sum + (parseInt(c.volume) || 0), 0);
        const volumeElement = document.getElementById('todayTotalVolume');
        if (volumeElement) {
            volumeElement.textContent = `${totalVolume}ml`;
        }

        // Most collected type
        const typeCount = {};
        todayCollections.forEach(c => {
            const type = Helpers.getBloodTypeDisplay(c.bloodType, c.rhFactor);
            typeCount[type] = (typeCount[type] || 0) + 1;
        });

        const mostCollected = Object.entries(typeCount)
            .sort(([,a], [,b]) => b - a)[0];

        const typeElement = document.getElementById('mostCollectedType');
        if (typeElement) {
            typeElement.textContent = mostCollected ? `${mostCollected[0]} (${mostCollected[1]})` : '-';
        }
    }

    showCollectionForm(collectionId = null) {
        const isEdit = collectionId !== null;
        const collection = isEdit ? this.collections.find(c => c.id === collectionId) : null;

        // Get apt donors (those who passed screening)
        const aptDonors = this.getAptDonors();

        if (aptDonors.length === 0) {
            Helpers.showToast('Nenhum doador apto para coleta. Realize a triagem primeiro.', 'warning');
            return;
        }

        const formHTML = `
            <form id="collectionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Código da Bolsa *</label>
                        <input type="text" name="bagCode" class="form-input" required 
                               value="${collection?.bagCode || Helpers.generateCollectionCode()}" 
                               placeholder="Código automático" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data *</label>
                        <input type="date" name="date" class="form-input" required 
                               value="${collection?.date || Helpers.getCurrentDate()}"
                               max="${Helpers.getCurrentDate()}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Horário *</label>
                        <input type="time" name="time" class="form-input" required 
                               value="${collection?.time || Helpers.getCurrentTime()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Responsável Técnico *</label>
                        <input type="text" name="technician" class="form-input" required 
                               value="${collection?.technician || ''}" placeholder="Nome do responsável">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Doador *</label>
                    <select name="donorId" class="form-select" required ${isEdit ? 'disabled' : ''}>
                        <option value="">Selecione um doador apto</option>
                        ${aptDonors.map(donor => `
                            <option value="${donor.id}" ${collection?.donorId === donor.id ? 'selected' : ''}>
                                ${donor.name} - ${Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor)} 
                                (Triagem: ${Helpers.formatDate(donor.lastScreeningDate)})
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo Sanguíneo *</label>
                        <select name="bloodType" class="form-select" required ${isEdit ? 'disabled' : ''}>
                            <option value="">Selecione o tipo</option>
                            <option value="A" ${collection?.bloodType === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${collection?.bloodType === 'B' ? 'selected' : ''}>B</option>
                            <option value="AB" ${collection?.bloodType === 'AB' ? 'selected' : ''}>AB</option>
                            <option value="O" ${collection?.bloodType === 'O' ? 'selected' : ''}>O</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fator RH *</label>
                        <select name="rhFactor" class="form-select" required ${isEdit ? 'disabled' : ''}>
                            <option value="">Selecione o fator</option>
                            <option value="+" ${collection?.rhFactor === '+' ? 'selected' : ''}>Positivo (+)</option>
                            <option value="-" ${collection?.rhFactor === '-' ? 'selected' : ''}>Negativo (-)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Volume Coletado (ml) *</label>
                        <select name="volume" class="form-select" required>
                            <option value="">Selecione o volume</option>
                            <option value="350" ${collection?.volume === '350' ? 'selected' : ''}>350ml</option>
                            <option value="400" ${collection?.volume === '400' ? 'selected' : ''}>400ml</option>
                            <option value="450" ${collection?.volume === '450' ? 'selected' : ''}>450ml</option>
                            <option value="500" ${collection?.volume === '500' ? 'selected' : ''}>500ml</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select name="status" class="form-select">
                            <option value="coletado" ${collection?.status === 'coletado' ? 'selected' : ''}>Coletado</option>
                            <option value="processando" ${collection?.status === 'processando' ? 'selected' : ''}>Processando</option>
                            <option value="descartado" ${collection?.status === 'descartado' ? 'selected' : ''}>Descartado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea name="observations" class="form-textarea" 
                              placeholder="Observações sobre a coleta">${collection?.observations || ''}</textarea>
                </div>
            </form>
        `;

        modal.form(
            isEdit ? 'Editar Coleta' : 'Nova Coleta',
            formHTML,
            (data, form) => {
                if (this.validateCollectionForm(data, form)) {
                    this.saveCollection(data, collectionId);
                    return true;
                }
                return false;
            }
        );

        // Auto-fill blood type when donor is selected
        setTimeout(() => {
            const donorSelect = document.querySelector('select[name="donorId"]');
            const bloodTypeSelect = document.querySelector('select[name="bloodType"]');
            const rhFactorSelect = document.querySelector('select[name="rhFactor"]');
            
            if (donorSelect && bloodTypeSelect && rhFactorSelect && !isEdit) {
                donorSelect.addEventListener('change', (e) => {
                    const donor = aptDonors.find(d => d.id === e.target.value);
                    if (donor) {
                        bloodTypeSelect.value = donor.bloodType;
                        rhFactorSelect.value = donor.rhFactor;
                    }
                });
            }
        }, 100);
    }

    getAptDonors() {
        // Get donors who have recent apt screening (within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const aptScreenings = this.screenings.filter(s => 
            s.result === 'apto' && 
            new Date(s.date) >= thirtyDaysAgo
        );

        return aptScreenings.map(screening => {
            const donor = this.donors.find(d => d.id === screening.donorId);
            return donor ? {
                ...donor,
                lastScreeningDate: screening.date
            } : null;
        }).filter(Boolean);
    }

    validateCollectionForm(data, form) {
        const errors = [];

        // Validate required fields
        if (!data.bagCode?.trim()) errors.push('Código da bolsa é obrigatório');
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.time) errors.push('Horário é obrigatório');
        if (!data.donorId) errors.push('Doador é obrigatório');
        if (!data.bloodType) errors.push('Tipo sanguíneo é obrigatório');
        if (!data.rhFactor) errors.push('Fator RH é obrigatório');
        if (!data.volume) errors.push('Volume é obrigatório');
        if (!data.technician?.trim()) errors.push('Responsável técnico é obrigatório');

        // Check for duplicate bag code
        const existingCollection = this.collections.find(c => 
            c.bagCode === data.bagCode && c.id !== data.id
        );
        if (existingCollection) {
            errors.push('Código da bolsa já existe');
        }

        // Validate volume range
        const volume = parseInt(data.volume);
        if (volume && (volume < 300 || volume > 500)) {
            errors.push('Volume deve estar entre 300ml e 500ml');
        }

        if (errors.length > 0) {
            Helpers.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    saveCollection(data, collectionId = null) {
        const isEdit = collectionId !== null;
        
        // Get donor info for storage
        const donor = this.donors.find(d => d.id === data.donorId);
        
        if (isEdit) {
            // Update existing collection
            const index = this.collections.findIndex(c => c.id === collectionId);
            if (index !== -1) {
                this.collections[index] = { 
                    ...this.collections[index], 
                    ...data,
                    donorName: donor ? donor.name : this.collections[index].donorName,
                    updatedAt: new Date().toISOString()
                };
                Helpers.showToast('Coleta atualizada com sucesso!', 'success');
            }
        } else {
            // Create new collection
            const newCollection = {
                id: Storage.generateId(),
                ...data,
                donorName: donor ? donor.name : '',
                status: data.status || 'coletado',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.collections.push(newCollection);
            
            // Add to stock automatically
            this.addToStock(newCollection);
            
            Helpers.showToast('Coleta registrada com sucesso!', 'success');
        }

        // Save to storage
        Storage.setCollections(this.collections);
        this.renderCollectionsTable();
        this.renderTodayStats();
    }

    addToStock(collection) {
        const stock = Storage.getStock();
        const stockItem = {
            id: Storage.generateId(),
            bagCode: collection.bagCode,
            bloodType: collection.bloodType,
            rhFactor: collection.rhFactor,
            volume: collection.volume,
            collectionDate: collection.date,
            expiryDate: Helpers.getBloodExpiryDate(collection.date),
            status: 'disponivel',
            donorId: collection.donorId,
            donorName: collection.donorName,
            createdAt: new Date().toISOString()
        };
        
        stock.push(stockItem);
        Storage.setStock(stock);
    }

    viewCollection(collectionId) {
        const collection = this.collections.find(c => c.id === collectionId);
        if (!collection) return;

        const donor = this.donors.find(d => d.id === collection.donorId);
        const donorName = donor ? donor.name : collection.donorName || 'Doador não encontrado';
        const bloodType = Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor);

        const content = `
            <div class="collection-details">
                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Informações da Coleta</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <p><strong>Código da Bolsa:</strong> ${collection.bagCode}</p>
                        <p><strong>Data/Hora:</strong> ${Helpers.formatDate(collection.date)} às ${collection.time}</p>
                        <p><strong>Doador:</strong> ${donorName}</p>
                        <p><strong>Tipo Sanguíneo:</strong> 
                            <span class="${Helpers.getBloodTypeClass(collection.bloodType, collection.rhFactor)}">
                                ${bloodType}
                            </span>
                        </p>
                        <p><strong>Volume:</strong> ${collection.volume}ml</p>
                        <p><strong>Status:</strong> ${Helpers.getStatusBadge(collection.status || 'coletado')}</p>
                        <p><strong>Responsável:</strong> ${collection.technician}</p>
                        <p><strong>Data de Validade:</strong> ${Helpers.formatDate(Helpers.getBloodExpiryDate(collection.date))}</p>
                    </div>
                </div>

                ${collection.observations ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Observações</h4>
                        <p>${collection.observations}</p>
                    </div>
                ` : ''}

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Informações do Sistema</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm text-secondary">
                        <p><strong>Criado em:</strong> ${Helpers.formatDateTime(collection.createdAt)}</p>
                        ${collection.updatedAt !== collection.createdAt ? `
                            <p><strong>Atualizado em:</strong> ${Helpers.formatDateTime(collection.updatedAt)}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.show('Detalhes da Coleta', content);
    }

    editCollection(collectionId) {
        this.showCollectionForm(collectionId);
    }

    deleteCollection(collectionId) {
        const collection = this.collections.find(c => c.id === collectionId);
        if (!collection) return;

        modal.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a coleta "${collection.bagCode}"? Esta ação também removerá o item do estoque.`,
            () => {
                // Remove from collections
                this.collections = this.collections.filter(c => c.id !== collectionId);
                Storage.setCollections(this.collections);

                // Remove from stock
                const stock = Storage.getStock();
                const updatedStock = stock.filter(s => s.bagCode !== collection.bagCode);
                Storage.setStock(updatedStock);

                this.renderCollectionsTable();
                this.renderTodayStats();
                Helpers.showToast('Coleta excluída com sucesso!', 'success');
            }
        );
    }

    searchCollections(searchTerm) {
        this.renderCollectionsTable();
    }

    filterCollections() {
        this.renderCollectionsTable();
    }

    exportCollections() {
        if (this.collections.length === 0) {
            Helpers.showToast('Nenhuma coleta para exportar', 'warning');
            return;
        }

        const exportData = this.collections.map(collection => {
            const donor = this.donors.find(d => d.id === collection.donorId);
            return {
                'Código da Bolsa': collection.bagCode,
                'Data': Helpers.formatDate(collection.date),
                'Horário': collection.time,
                'Doador': donor ? donor.name : collection.donorName || 'Não encontrado',
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor),
                'Volume (ml)': collection.volume,
                'Status': collection.status || 'coletado',
                'Responsável': collection.technician,
                'Data de Validade': Helpers.formatDate(Helpers.getBloodExpiryDate(collection.date)),
                'Observações': collection.observations || ''
            };
        });

        const filename = `coletas_${new Date().toISOString().split('T')[0]}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Dados exportados com sucesso!', 'success');
    }
}

window.Collection = Collection;