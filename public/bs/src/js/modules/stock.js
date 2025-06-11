/**
 * Stock module
 */

class Stock {
    constructor() {
        this.stock = [];
        this.filteredStock = [];
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Gestão de Estoque</h1>
                    <div class="flex gap-2">
                        <button class="btn btn-warning" id="checkExpiryBtn">
                            ⚠️ Verificar Vencimentos
                        </button>
                        <button class="btn" id="exportStockBtn">
                            📊 Exportar
                        </button>
                    </div>
                </div>

                <!-- Stock Summary -->
                <div class="stats-grid mb-6" id="stockStats"></div>

                <!-- Filters -->
                <div class="search-filter-bar">
                    <input type="text" class="form-input search-input" id="searchStock" 
                           placeholder="Buscar por código da bolsa...">
                    <select class="form-select" id="bloodTypeFilterStock">
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
                    <select class="form-select" id="statusFilterStock">
                        <option value="">Todos os status</option>
                        <option value="disponivel">Disponível</option>
                        <option value="reservado">Reservado</option>
                        <option value="vencido">Vencido</option>
                        <option value="descartado">Descartado</option>
                    </select>
                    <select class="form-select" id="expiryFilterStock">
                        <option value="">Todos os prazos</option>
                        <option value="expiring">Vencendo em 7 dias</option>
                        <option value="expired">Vencidos</option>
                    </select>
                </div>

                <!-- Stock Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Estoque de Sangue</h3>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código da Bolsa</th>
                                    <th>Tipo Sanguíneo</th>
                                    <th>Volume (ml)</th>
                                    <th>Data de Coleta</th>
                                    <th>Data de Validade</th>
                                    <th>Status</th>
                                    <th>Doador</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="stockTableBody">
                                <!-- Dynamic content -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Blood Type Distribution -->
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">Distribuição por Tipo Sanguíneo</h3>
                    </div>
                    <div class="card-body">
                        <div class="chart-container" id="stockDistributionChart"></div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-status-btn')) {
                this.updateStatus(e.target.dataset.id, e.target.dataset.status);
            } else if (e.target.classList.contains('view-stock-btn')) {
                this.viewStockItem(e.target.dataset.id);
            } else if (e.target.id === 'checkExpiryBtn') {
                this.checkExpiry();
            } else if (e.target.id === 'exportStockBtn') {
                this.exportStock();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchStock') {
                this.applyFilters();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'bloodTypeFilterStock' || 
                e.target.id === 'statusFilterStock' || 
                e.target.id === 'expiryFilterStock') {
                this.applyFilters();
            }
        });
    }

    init() {
        this.updateExpiredItems();
        this.renderStockStats();
        this.renderStockTable();
        this.renderDistributionChart();
    }

    loadData() {
        this.stock = Storage.getStock();
        this.filteredStock = [...this.stock];
    }

    updateExpiredItems() {
        // Automatically update expired items
        let updated = false;
        this.stock.forEach(item => {
            if (item.status === 'disponivel' && Helpers.isBloodExpired(item.collectionDate)) {
                item.status = 'vencido';
                updated = true;
            }
        });

        if (updated) {
            Storage.setStock(this.stock);
        }
    }

    renderStockStats() {
        const available = this.stock.filter(item => item.status === 'disponivel').length;
        const reserved = this.stock.filter(item => item.status === 'reservado').length;
        const expired = this.stock.filter(item => item.status === 'vencido').length;
        const expiring = this.stock.filter(item => 
            item.status === 'disponivel' && Helpers.isBloodExpiringSoon(item.collectionDate)
        ).length;

        const totalVolume = this.stock
            .filter(item => item.status === 'disponivel')
            .reduce((sum, item) => sum + parseInt(item.volume), 0);

        const stats = [
            {
                title: 'Disponível',
                value: available,
                icon: '✅',
                color: 'success'
            },
            {
                title: 'Reservado',
                value: reserved,
                icon: '📋',
                color: 'warning'
            },
            {
                title: 'Vencendo em 7 dias',
                value: expiring,
                icon: '⚠️',
                color: 'warning'
            },
            {
                title: 'Vencidos',
                value: expired,
                icon: '❌',
                color: 'error'
            },
            {
                title: 'Volume Total',
                value: `${totalVolume}ml`,
                icon: '🩸',
                color: 'info'
            }
        ];

        const statsContainer = document.getElementById('stockStats');
        if (statsContainer) {
            statsContainer.innerHTML = stats.map(stat => `
                <div class="stat-card ${stat.color ? `border-l-4 border-l-${stat.color}` : ''}">
                    <div class="stat-card-header">
                        <div class="stat-card-title">${stat.title}</div>
                        <div class="stat-card-icon">${stat.icon}</div>
                    </div>
                    <div class="stat-card-value">${stat.value}</div>
                </div>
            `).join('');
        }
    }

    renderStockTable() {
        const tbody = document.getElementById('stockTableBody');
        if (!tbody) return;

        if (this.filteredStock.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-secondary">
                        Nenhum item no estoque
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by expiry date (closest first)
        const sortedStock = [...this.filteredStock].sort((a, b) => {
            const aExpiry = new Date(a.expiryDate || Helpers.getBloodExpiryDate(a.collectionDate));
            const bExpiry = new Date(b.expiryDate || Helpers.getBloodExpiryDate(b.collectionDate));
            return aExpiry - bExpiry;
        });

        tbody.innerHTML = sortedStock.map(item => {
            const bloodType = Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor);
            const expiryDate = new Date(item.expiryDate || Helpers.getBloodExpiryDate(item.collectionDate));
            const isExpired = Helpers.isBloodExpired(item.collectionDate);
            const isExpiring = Helpers.isBloodExpiringSoon(item.collectionDate);
            
            let rowClass = '';
            if (isExpired) rowClass = 'bg-red-50';
            else if (isExpiring) rowClass = 'bg-yellow-50';

            return `
                <tr class="${rowClass}">
                    <td class="font-semibold">${item.bagCode}</td>
                    <td>
                        <span class="${Helpers.getBloodTypeClass(item.bloodType, item.rhFactor)}">
                            ${bloodType}
                        </span>
                    </td>
                    <td class="font-semibold">${item.volume}ml</td>
                    <td>${Helpers.formatDate(item.collectionDate)}</td>
                    <td class="${isExpired ? 'text-error font-bold' : isExpiring ? 'text-warning font-bold' : ''}">
                        ${Helpers.formatDate(expiryDate)}
                        ${isExpiring && !isExpired ? '<br><small class="text-warning">⚠️ Vencendo</small>' : ''}
                        ${isExpired ? '<br><small class="text-error">❌ Vencido</small>' : ''}
                    </td>
                    <td>${Helpers.getStatusBadge(item.status)}</td>
                    <td>${item.donorName || 'N/A'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm view-stock-btn" data-id="${item.id}">
                                👁️ Ver
                            </button>
                            ${item.status === 'disponivel' ? `
                                <button class="btn btn-sm btn-warning update-status-btn" 
                                        data-id="${item.id}" data-status="reservado">
                                    📋 Reservar
                                </button>
                            ` : ''}
                            ${item.status === 'reservado' ? `
                                <button class="btn btn-sm btn-success update-status-btn" 
                                        data-id="${item.id}" data-status="disponivel">
                                    ✅ Liberar
                                </button>
                            ` : ''}
                            ${(item.status === 'disponivel' || item.status === 'vencido') ? `
                                <button class="btn btn-sm btn-error update-status-btn" 
                                        data-id="${item.id}" data-status="descartado">
                                    🗑️ Descartar
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderDistributionChart() {
        const bloodTypeCount = {};
        
        // Count available stock by blood type
        this.stock
            .filter(item => item.status === 'disponivel')
            .forEach(item => {
                const type = Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor);
                bloodTypeCount[type] = (bloodTypeCount[type] || 0) + 1;
            });

        const chartData = Object.entries(bloodTypeCount).map(([type, count]) => ({
            label: type,
            value: count
        }));

        const container = document.getElementById('stockDistributionChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'bar',
                width: container.offsetWidth || 600,
                height: 300
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhum item disponível no estoque</div>';
        }
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchStock')?.value || '';
        const bloodTypeFilter = document.getElementById('bloodTypeFilterStock')?.value || '';
        const statusFilter = document.getElementById('statusFilterStock')?.value || '';
        const expiryFilter = document.getElementById('expiryFilterStock')?.value || '';

        this.filteredStock = [...this.stock];

        // Apply search filter
        if (searchTerm) {
            this.filteredStock = Helpers.filterItems(
                this.filteredStock,
                searchTerm,
                ['bagCode', 'donorName']
            );
        }

        // Apply blood type filter
        if (bloodTypeFilter) {
            this.filteredStock = this.filteredStock.filter(item => 
                Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor) === bloodTypeFilter
            );
        }

        // Apply status filter
        if (statusFilter) {
            this.filteredStock = this.filteredStock.filter(item => item.status === statusFilter);
        }

        // Apply expiry filter
        if (expiryFilter === 'expiring') {
            this.filteredStock = this.filteredStock.filter(item => 
                item.status === 'disponivel' && Helpers.isBloodExpiringSoon(item.collectionDate)
            );
        } else if (expiryFilter === 'expired') {
            this.filteredStock = this.filteredStock.filter(item => 
                Helpers.isBloodExpired(item.collectionDate)
            );
        }

        this.renderStockTable();
    }

    updateStatus(itemId, newStatus) {
        const item = this.stock.find(s => s.id === itemId);
        if (!item) return;

        const statusMessages = {
            'reservado': 'reservar',
            'disponivel': 'liberar',
            'descartado': 'descartar'
        };

        modal.confirm(
            'Confirmar Alteração',
            `Tem certeza que deseja ${statusMessages[newStatus]} a bolsa "${item.bagCode}"?`,
            () => {
                item.status = newStatus;
                item.updatedAt = new Date().toISOString();
                
                if (newStatus === 'descartado') {
                    item.discardedAt = new Date().toISOString();
                }

                Storage.setStock(this.stock);
                this.renderStockStats();
                this.renderStockTable();
                this.renderDistributionChart();
                
                Helpers.showToast(`Bolsa ${statusMessages[newStatus]}da com sucesso!`, 'success');
            }
        );
    }

    viewStockItem(itemId) {
        const item = this.stock.find(s => s.id === itemId);
        if (!item) return;

        const bloodType = Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor);
        const expiryDate = new Date(item.expiryDate || Helpers.getBloodExpiryDate(item.collectionDate));
        const isExpired = Helpers.isBloodExpired(item.collectionDate);
        const isExpiring = Helpers.isBloodExpiringSoon(item.collectionDate);

        const content = `
            <div class="stock-details">
                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Informações da Bolsa</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <p><strong>Código:</strong> ${item.bagCode}</p>
                        <p><strong>Tipo Sanguíneo:</strong> 
                            <span class="${Helpers.getBloodTypeClass(item.bloodType, item.rhFactor)}">
                                ${bloodType}
                            </span>
                        </p>
                        <p><strong>Volume:</strong> ${item.volume}ml</p>
                        <p><strong>Status:</strong> ${Helpers.getStatusBadge(item.status)}</p>
                        <p><strong>Data de Coleta:</strong> ${Helpers.formatDate(item.collectionDate)}</p>
                        <p><strong>Data de Validade:</strong> 
                            <span class="${isExpired ? 'text-error font-bold' : isExpiring ? 'text-warning font-bold' : ''}">
                                ${Helpers.formatDate(expiryDate)}
                                ${isExpiring && !isExpired ? ' ⚠️' : ''}
                                ${isExpired ? ' ❌' : ''}
                            </span>
                        </p>
                        <p><strong>Doador:</strong> ${item.donorName || 'N/A'}</p>
                    </div>
                </div>

                ${isExpired || isExpiring ? `
                    <div class="alert ${isExpired ? 'alert-error' : 'alert-warning'} mb-4">
                        ${isExpired ? '❌ Esta bolsa está vencida e deve ser descartada.' : '⚠️ Esta bolsa está próxima do vencimento.'}
                    </div>
                ` : ''}

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Histórico</h4>
                    <div class="text-sm text-secondary">
                        <p><strong>Criado em:</strong> ${Helpers.formatDateTime(item.createdAt)}</p>
                        ${item.updatedAt !== item.createdAt ? `
                            <p><strong>Atualizado em:</strong> ${Helpers.formatDateTime(item.updatedAt)}</p>
                        ` : ''}
                        ${item.discardedAt ? `
                            <p><strong>Descartado em:</strong> ${Helpers.formatDateTime(item.discardedAt)}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.show('Detalhes do Item', content);
    }

    checkExpiry() {
        const expiring = this.stock.filter(item => 
            item.status === 'disponivel' && Helpers.isBloodExpiringSoon(item.collectionDate)
        );
        
        const expired = this.stock.filter(item => 
            item.status === 'disponivel' && Helpers.isBloodExpired(item.collectionDate)
        );

        let message = '';
        if (expired.length > 0) {
            message += `❌ ${expired.length} bolsa(s) vencida(s) encontrada(s).\n`;
        }
        if (expiring.length > 0) {
            message += `⚠️ ${expiring.length} bolsa(s) vencendo em 7 dias.\n`;
        }
        if (expired.length === 0 && expiring.length === 0) {
            message = '✅ Nenhuma bolsa próxima do vencimento.';
        }

        modal.alert('Verificação de Vencimentos', message);

        // Auto-update expired items
        if (expired.length > 0) {
            expired.forEach(item => {
                item.status = 'vencido';
                item.updatedAt = new Date().toISOString();
            });
            Storage.setStock(this.stock);
            this.renderStockStats();
            this.renderStockTable();
        }
    }

    exportStock() {
        if (this.stock.length === 0) {
            Helpers.showToast('Nenhum item no estoque para exportar', 'warning');
            return;
        }

        const exportData = this.stock.map(item => {
            const expiryDate = new Date(item.expiryDate || Helpers.getBloodExpiryDate(item.collectionDate));
            return {
                'Código da Bolsa': item.bagCode,
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor),
                'Volume (ml)': item.volume,
                'Data de Coleta': Helpers.formatDate(item.collectionDate),
                'Data de Validade': Helpers.formatDate(expiryDate),
                'Status': item.status,
                'Doador': item.donorName || 'N/A',
                'Criado em': Helpers.formatDateTime(item.createdAt)
            };
        });

        const filename = `estoque_${new Date().toISOString().split('T')[0]}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Dados exportados com sucesso!', 'success');
    }
}

window.Stock = Stock;