/**
 * Distribution module
 */

class Distribution {
    constructor() {
        this.distributions = [];
        this.stock = [];
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Distribuição de Sangue</h1>
                    <button class="btn btn-primary" id="addDistributionBtn">
                        ➕ Nova Solicitação
                    </button>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid mb-6" id="distributionStats"></div>

                <!-- Filters -->
                <div class="search-filter-bar">
                    <input type="text" class="form-input search-input" id="searchDistributions" 
                           placeholder="Buscar por hospital ou código...">
                    <select class="form-select" id="statusFilterDistribution">
                        <option value="">Todos os status</option>
                        <option value="solicitado">Solicitado</option>
                        <option value="preparando">Preparando</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    <select class="form-select" id="bloodTypeFilterDistribution">
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
                    <button class="btn" id="exportDistributionsBtn">📊 Exportar</button>
                </div>

                <!-- Distributions Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Solicitações de Distribuição</h3>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Data/Hora</th>
                                    <th>Hospital/Clínica</th>
                                    <th>Tipo Sanguíneo</th>
                                    <th>Quantidade</th>
                                    <th>Status</th>
                                    <th>Responsável</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="distributionsTableBody">
                                <!-- Dynamic content -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Available Stock for Distribution -->
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">Estoque Disponível para Distribuição</h3>
                    </div>
                    <div class="card-body">
                        <div id="availableStockSummary"></div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addDistributionBtn') {
                this.showDistributionForm();
            } else if (e.target.classList.contains('view-distribution-btn')) {
                this.viewDistribution(e.target.dataset.id);
            } else if (e.target.classList.contains('edit-distribution-btn')) {
                this.editDistribution(e.target.dataset.id);
            } else if (e.target.classList.contains('update-distribution-status-btn')) {
                this.updateDistributionStatus(e.target.dataset.id, e.target.dataset.status);
            } else if (e.target.classList.contains('delete-distribution-btn')) {
                this.deleteDistribution(e.target.dataset.id);
            } else if (e.target.id === 'exportDistributionsBtn') {
                this.exportDistributions();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchDistributions') {
                this.applyFilters();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'statusFilterDistribution' || 
                e.target.id === 'bloodTypeFilterDistribution') {
                this.applyFilters();
            }
        });
    }

    init() {
        this.renderDistributionStats();
        this.renderDistributionsTable();
        this.renderAvailableStock();
    }

    loadData() {
        this.distributions = Storage.getDistributions();
        this.stock = Storage.getStock();
    }

    renderDistributionStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const todayDistributions = this.distributions.filter(d => d.date === today);
        const pendingDistributions = this.distributions.filter(d => 
            d.status === 'solicitado' || d.status === 'preparando'
        );
        const deliveredToday = todayDistributions.filter(d => d.status === 'entregue');
        const totalVolumeToday = deliveredToday.reduce((sum, d) => 
            sum + (d.bags ? d.bags.reduce((bagSum, bag) => bagSum + parseInt(bag.volume), 0) : 0), 0
        );

        const stats = [
            {
                title: 'Solicitações Hoje',
                value: todayDistributions.length,
                icon: '📋'
            },
            {
                title: 'Pendentes',
                value: pendingDistributions.length,
                icon: '⏳'
            },
            {
                title: 'Entregues Hoje',
                value: deliveredToday.length,
                icon: '✅'
            },
            {
                title: 'Volume Distribuído Hoje',
                value: `${totalVolumeToday}ml`,
                icon: '🩸'
            }
        ];

        const statsContainer = document.getElementById('distributionStats');
        if (statsContainer) {
            statsContainer.innerHTML = stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">${stat.title}</div>
                        <div class="stat-card-icon">${stat.icon}</div>
                    </div>
                    <div class="stat-card-value">${stat.value}</div>
                </div>
            `).join('');
        }
    }

    renderDistributionsTable() {
        const tbody = document.getElementById('distributionsTableBody');
        if (!tbody) return;

        let filteredDistributions = [...this.distributions];

        // Apply filters
        const searchTerm = document.getElementById('searchDistributions')?.value || '';
        const statusFilter = document.getElementById('statusFilterDistribution')?.value || '';
        const bloodTypeFilter = document.getElementById('bloodTypeFilterDistribution')?.value || '';

        if (searchTerm) {
            filteredDistributions = Helpers.filterItems(
                filteredDistributions,
                searchTerm,
                ['distributionCode', 'hospital', 'contactPerson']
            );
        }

        if (statusFilter) {
            filteredDistributions = filteredDistributions.filter(d => d.status === statusFilter);
        }

        if (bloodTypeFilter) {
            filteredDistributions = filteredDistributions.filter(d => 
                Helpers.getBloodTypeDisplay(d.bloodType, d.rhFactor) === bloodTypeFilter
            );
        }

        // Sort by date (newest first)
        filteredDistributions.sort((a, b) => 
            new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time)
        );

        if (filteredDistributions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-secondary">
                        Nenhuma distribuição encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredDistributions.map(distribution => {
            const bloodType = Helpers.getBloodTypeDisplay(distribution.bloodType, distribution.rhFactor);
            const quantity = distribution.bags ? distribution.bags.length : distribution.quantity || 0;

            return `
                <tr>
                    <td class="font-semibold">${distribution.distributionCode}</td>
                    <td>
                        <div class="font-semibold">${Helpers.formatDate(distribution.date)}</div>
                        <div class="text-sm text-secondary">${distribution.time}</div>
                    </td>
                    <td>
                        <div class="font-semibold">${distribution.hospital}</div>
                        <div class="text-sm text-secondary">${distribution.contactPerson}</div>
                    </td>
                    <td>
                        <span class="${Helpers.getBloodTypeClass(distribution.bloodType, distribution.rhFactor)}">
                            ${bloodType}
                        </span>
                    </td>
                    <td class="font-semibold">${quantity} bolsa(s)</td>
                    <td>${Helpers.getStatusBadge(distribution.status)}</td>
                    <td>${distribution.responsibleTechnician}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm view-distribution-btn" data-id="${distribution.id}">
                                👁️ Ver
                            </button>
                            ${distribution.status === 'solicitado' ? `
                                <button class="btn btn-sm btn-warning update-distribution-status-btn" 
                                        data-id="${distribution.id}" data-status="preparando">
                                    📦 Preparar
                                </button>
                            ` : ''}
                            ${distribution.status === 'preparando' ? `
                                <button class="btn btn-sm btn-success update-distribution-status-btn" 
                                        data-id="${distribution.id}" data-status="entregue">
                                    🚚 Entregar
                                </button>
                            ` : ''}
                            ${distribution.status !== 'entregue' ? `
                                <button class="btn btn-sm edit-distribution-btn" data-id="${distribution.id}">
                                    ✏️ Editar
                                </button>
                                <button class="btn btn-sm btn-error delete-distribution-btn" data-id="${distribution.id}">
                                    🗑️ Excluir
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderAvailableStock() {
        const availableStock = this.stock.filter(item => item.status === 'disponivel');
        const stockByType = {};

        availableStock.forEach(item => {
            const type = Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor);
            if (!stockByType[type]) {
                stockByType[type] = { count: 0, volume: 0 };
            }
            stockByType[type].count++;
            stockByType[type].volume += parseInt(item.volume);
        });

        const container = document.getElementById('availableStockSummary');
        if (container) {
            if (Object.keys(stockByType).length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhum item disponível no estoque</div>';
                return;
            }

            container.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.entries(stockByType).map(([type, data]) => `
                        <div class="text-center p-4 border border-gray-200 rounded-lg">
                            <div class="font-bold text-lg mb-1">${type}</div>
                            <div class="text-sm text-secondary">${data.count} bolsa(s)</div>
                            <div class="text-sm text-secondary">${data.volume}ml</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    showDistributionForm(distributionId = null) {
        const isEdit = distributionId !== null;
        const distribution = isEdit ? this.distributions.find(d => d.id === distributionId) : null;

        const availableStock = this.stock.filter(item => item.status === 'disponivel');
        if (availableStock.length === 0) {
            Helpers.showToast('Nenhum item disponível no estoque para distribuição', 'warning');
            return;
        }

        const formHTML = `
            <form id="distributionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Código da Distribuição *</label>
                        <input type="text" name="distributionCode" class="form-input" required 
                               value="${distribution?.distributionCode || this.generateDistributionCode()}" 
                               placeholder="Código automático" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data *</label>
                        <input type="date" name="date" class="form-input" required 
                               value="${distribution?.date || Helpers.getCurrentDate()}"
                               min="${Helpers.getCurrentDate()}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Horário *</label>
                        <input type="time" name="time" class="form-input" required 
                               value="${distribution?.time || Helpers.getCurrentTime()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Responsável Técnico *</label>
                        <input type="text" name="responsibleTechnician" class="form-input" required 
                               value="${distribution?.responsibleTechnician || ''}" 
                               placeholder="Nome do responsável">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Hospital/Clínica *</label>
                        <input type="text" name="hospital" class="form-input" required 
                               value="${distribution?.hospital || ''}" 
                               placeholder="Nome do hospital ou clínica">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pessoa de Contato *</label>
                        <input type="text" name="contactPerson" class="form-input" required 
                               value="${distribution?.contactPerson || ''}" 
                               placeholder="Nome do responsável no hospital">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telefone de Contato *</label>
                        <input type="tel" name="contactPhone" class="form-input" required 
                               value="${distribution?.contactPhone || ''}" 
                               placeholder="(00) 00000-0000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Urgência</label>
                        <select name="urgency" class="form-select">
                            <option value="normal" ${distribution?.urgency === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="urgente" ${distribution?.urgency === 'urgente' ? 'selected' : ''}>Urgente</option>
                            <option value="emergencia" ${distribution?.urgency === 'emergencia' ? 'selected' : ''}>Emergência</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo Sanguíneo *</label>
                        <select name="bloodType" class="form-select" required>
                            <option value="">Selecione o tipo</option>
                            <option value="A" ${distribution?.bloodType === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${distribution?.bloodType === 'B' ? 'selected' : ''}>B</option>
                            <option value="AB" ${distribution?.bloodType === 'AB' ? 'selected' : ''}>AB</option>
                            <option value="O" ${distribution?.bloodType === 'O' ? 'selected' : ''}>O</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fator RH *</label>
                        <select name="rhFactor" class="form-select" required>
                            <option value="">Selecione o fator</option>
                            <option value="+" ${distribution?.rhFactor === '+' ? 'selected' : ''}>Positivo (+)</option>
                            <option value="-" ${distribution?.rhFactor === '-' ? 'selected' : ''}>Negativo (-)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Quantidade Solicitada *</label>
                    <input type="number" name="quantity" class="form-input" required min="1" max="10"
                           value="${distribution?.quantity || 1}" 
                           placeholder="Número de bolsas">
                </div>

                <div class="form-group">
                    <label class="form-label">Motivo da Solicitação</label>
                    <textarea name="reason" class="form-textarea" 
                              placeholder="Descreva o motivo da solicitação">${distribution?.reason || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea name="observations" class="form-textarea" 
                              placeholder="Observações adicionais">${distribution?.observations || ''}</textarea>
                </div>
            </form>
        `;

        modal.form(
            isEdit ? 'Editar Distribuição' : 'Nova Solicitação de Distribuição',
            formHTML,
            (data, form) => {
                if (this.validateDistributionForm(data, form)) {
                    this.saveDistribution(data, distributionId);
                    return true;
                }
                return false;
            }
        );

        // Add phone mask
        setTimeout(() => {
            const phoneInput = document.querySelector('input[name="contactPhone"]');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
                    e.target.value = value;
                });
            }
        }, 100);
    }

    generateDistributionCode() {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `DIST-${year}${month}${day}-${random}`;
    }

    validateDistributionForm(data, form) {
        const errors = [];

        // Validate required fields
        if (!data.distributionCode?.trim()) errors.push('Código da distribuição é obrigatório');
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.time) errors.push('Horário é obrigatório');
        if (!data.hospital?.trim()) errors.push('Hospital/Clínica é obrigatório');
        if (!data.contactPerson?.trim()) errors.push('Pessoa de contato é obrigatória');
        if (!data.contactPhone?.trim()) errors.push('Telefone de contato é obrigatório');
        if (!data.bloodType) errors.push('Tipo sanguíneo é obrigatório');
        if (!data.rhFactor) errors.push('Fator RH é obrigatório');
        if (!data.quantity) errors.push('Quantidade é obrigatória');
        if (!data.responsibleTechnician?.trim()) errors.push('Responsável técnico é obrigatório');

        // Validate quantity
        const quantity = parseInt(data.quantity);
        if (quantity < 1 || quantity > 10) {
            errors.push('Quantidade deve estar entre 1 e 10 bolsas');
        }

        // Check stock availability
        const bloodType = Helpers.getBloodTypeDisplay(data.bloodType, data.rhFactor);
        const availableStock = this.stock.filter(item => 
            item.status === 'disponivel' && 
            Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor) === bloodType
        );

        if (availableStock.length < quantity) {
            errors.push(`Estoque insuficiente. Disponível: ${availableStock.length} bolsa(s) do tipo ${bloodType}`);
        }

        // Validate phone format
        if (data.contactPhone && !Helpers.validatePhone(data.contactPhone)) {
            errors.push('Formato de telefone inválido');
        }

        if (errors.length > 0) {
            Helpers.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    saveDistribution(data, distributionId = null) {
        const isEdit = distributionId !== null;
        
        if (isEdit) {
            // Update existing distribution
            const index = this.distributions.findIndex(d => d.id === distributionId);
            if (index !== -1) {
                this.distributions[index] = { 
                    ...this.distributions[index], 
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                Helpers.showToast('Distribuição atualizada com sucesso!', 'success');
            }
        } else {
            // Create new distribution
            const newDistribution = {
                id: Storage.generateId(),
                ...data,
                status: 'solicitado',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.distributions.push(newDistribution);
            Helpers.showToast('Solicitação de distribuição criada com sucesso!', 'success');
        }

        // Save to storage
        Storage.setDistributions(this.distributions);
        this.renderDistributionStats();
        this.renderDistributionsTable();
    }

    updateDistributionStatus(distributionId, newStatus) {
        const distribution = this.distributions.find(d => d.id === distributionId);
        if (!distribution) return;

        const statusMessages = {
            'preparando': 'preparar',
            'entregue': 'marcar como entregue'
        };

        modal.confirm(
            'Confirmar Alteração',
            `Tem certeza que deseja ${statusMessages[newStatus]} a distribuição "${distribution.distributionCode}"?`,
            () => {
                if (newStatus === 'preparando') {
                    // Reserve stock items
                    this.reserveStockForDistribution(distribution);
                } else if (newStatus === 'entregue') {
                    // Mark stock items as used
                    this.markStockAsUsed(distribution);
                    distribution.deliveredAt = new Date().toISOString();
                }

                distribution.status = newStatus;
                distribution.updatedAt = new Date().toISOString();

                Storage.setDistributions(this.distributions);
                this.renderDistributionStats();
                this.renderDistributionsTable();
                this.renderAvailableStock();
                
                Helpers.showToast(`Distribuição ${statusMessages[newStatus]}da com sucesso!`, 'success');
            }
        );
    }

    reserveStockForDistribution(distribution) {
        const bloodType = Helpers.getBloodTypeDisplay(distribution.bloodType, distribution.rhFactor);
        const availableStock = this.stock
            .filter(item => 
                item.status === 'disponivel' && 
                Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor) === bloodType
            )
            .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // FIFO
            .slice(0, parseInt(distribution.quantity));

        const reservedBags = [];
        availableStock.forEach(item => {
            item.status = 'reservado';
            item.reservedFor = distribution.id;
            item.updatedAt = new Date().toISOString();
            reservedBags.push({
                bagCode: item.bagCode,
                volume: item.volume,
                collectionDate: item.collectionDate
            });
        });

        distribution.bags = reservedBags;
        Storage.setStock(this.stock);
    }

    markStockAsUsed(distribution) {
        if (distribution.bags) {
            distribution.bags.forEach(bag => {
                const stockItem = this.stock.find(item => item.bagCode === bag.bagCode);
                if (stockItem) {
                    stockItem.status = 'utilizado';
                    stockItem.usedAt = new Date().toISOString();
                    stockItem.distributionId = distribution.id;
                }
            });
            Storage.setStock(this.stock);
        }
    }

    viewDistribution(distributionId) {
        const distribution = this.distributions.find(d => d.id === distributionId);
        if (!distribution) return;

        const bloodType = Helpers.getBloodTypeDisplay(distribution.bloodType, distribution.rhFactor);
        const quantity = distribution.bags ? distribution.bags.length : distribution.quantity || 0;

        const content = `
            <div class="distribution-details">
                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Informações da Distribuição</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <p><strong>Código:</strong> ${distribution.distributionCode}</p>
                        <p><strong>Data/Hora:</strong> ${Helpers.formatDate(distribution.date)} às ${distribution.time}</p>
                        <p><strong>Status:</strong> ${Helpers.getStatusBadge(distribution.status)}</p>
                        <p><strong>Urgência:</strong> ${distribution.urgency || 'Normal'}</p>
                        <p><strong>Tipo Sanguíneo:</strong> 
                            <span class="${Helpers.getBloodTypeClass(distribution.bloodType, distribution.rhFactor)}">
                                ${bloodType}
                            </span>
                        </p>
                        <p><strong>Quantidade:</strong> ${quantity} bolsa(s)</p>
                        <p><strong>Responsável:</strong> ${distribution.responsibleTechnician}</p>
                    </div>
                </div>

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Destino</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <p><strong>Hospital/Clínica:</strong> ${distribution.hospital}</p>
                        <p><strong>Contato:</strong> ${distribution.contactPerson}</p>
                        <p><strong>Telefone:</strong> ${Helpers.formatPhone(distribution.contactPhone)}</p>
                    </div>
                </div>

                ${distribution.bags && distribution.bags.length > 0 ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Bolsas Selecionadas</h4>
                        <div class="space-y-2">
                            ${distribution.bags.map(bag => `
                                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span class="font-semibold">${bag.bagCode}</span>
                                    <span>${bag.volume}ml</span>
                                    <span class="text-sm text-secondary">Coletado: ${Helpers.formatDate(bag.collectionDate)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${distribution.reason ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Motivo da Solicitação</h4>
                        <p>${distribution.reason}</p>
                    </div>
                ` : ''}

                ${distribution.observations ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Observações</h4>
                        <p>${distribution.observations}</p>
                    </div>
                ` : ''}

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Histórico</h4>
                    <div class="text-sm text-secondary">
                        <p><strong>Criado em:</strong> ${Helpers.formatDateTime(distribution.createdAt)}</p>
                        ${distribution.updatedAt !== distribution.createdAt ? `
                            <p><strong>Atualizado em:</strong> ${Helpers.formatDateTime(distribution.updatedAt)}</p>
                        ` : ''}
                        ${distribution.deliveredAt ? `
                            <p><strong>Entregue em:</strong> ${Helpers.formatDateTime(distribution.deliveredAt)}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.show('Detalhes da Distribuição', content);
    }

    editDistribution(distributionId) {
        this.showDistributionForm(distributionId);
    }

    deleteDistribution(distributionId) {
        const distribution = this.distributions.find(d => d.id === distributionId);
        if (!distribution) return;

        modal.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a distribuição "${distribution.distributionCode}"?`,
            () => {
                // Release reserved stock if any
                if (distribution.bags) {
                    distribution.bags.forEach(bag => {
                        const stockItem = this.stock.find(item => item.bagCode === bag.bagCode);
                        if (stockItem && stockItem.status === 'reservado') {
                            stockItem.status = 'disponivel';
                            delete stockItem.reservedFor;
                            stockItem.updatedAt = new Date().toISOString();
                        }
                    });
                    Storage.setStock(this.stock);
                }

                this.distributions = this.distributions.filter(d => d.id !== distributionId);
                Storage.setDistributions(this.distributions);
                
                this.renderDistributionStats();
                this.renderDistributionsTable();
                this.renderAvailableStock();
                
                Helpers.showToast('Distribuição excluída com sucesso!', 'success');
            }
        );
    }

    applyFilters() {
        this.renderDistributionsTable();
    }

    exportDistributions() {
        if (this.distributions.length === 0) {
            Helpers.showToast('Nenhuma distribuição para exportar', 'warning');
            return;
        }

        const exportData = this.distributions.map(distribution => {
            const quantity = distribution.bags ? distribution.bags.length : distribution.quantity || 0;
            return {
                'Código': distribution.distributionCode,
                'Data': Helpers.formatDate(distribution.date),
                'Horário': distribution.time,
                'Hospital/Clínica': distribution.hospital,
                'Contato': distribution.contactPerson,
                'Telefone': Helpers.formatPhone(distribution.contactPhone),
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(distribution.bloodType, distribution.rhFactor),
                'Quantidade': quantity,
                'Status': distribution.status,
                'Urgência': distribution.urgency || 'Normal',
                'Responsável': distribution.responsibleTechnician,
                'Motivo': distribution.reason || '',
                'Observações': distribution.observations || ''
            };
        });

        const filename = `distribuicoes_${new Date().toISOString().split('T')[0]}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Dados exportados com sucesso!', 'success');
    }
}

window.Distribution = Distribution;