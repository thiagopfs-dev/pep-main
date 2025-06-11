/**
 * Reports module
 */

class Reports {
    constructor() {
        this.donors = [];
        this.appointments = [];
        this.screenings = [];
        this.collections = [];
        this.stock = [];
        this.distributions = [];
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <h1 class="text-2xl font-bold mb-6">Relatórios e Estatísticas</h1>

                <!-- Report Filters -->
                <div class="card mb-6">
                    <div class="card-header">
                        <h3 class="card-title">Filtros de Período</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Data Inicial</label>
                                <input type="date" id="startDate" class="form-input" 
                                       value="${this.getDefaultStartDate()}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Data Final</label>
                                <input type="date" id="endDate" class="form-input" 
                                       value="${Helpers.getCurrentDate()}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Período Rápido</label>
                                <select id="quickPeriod" class="form-select">
                                    <option value="">Personalizado</option>
                                    <option value="today">Hoje</option>
                                    <option value="week">Última Semana</option>
                                    <option value="month">Último Mês</option>
                                    <option value="quarter">Último Trimestre</option>
                                    <option value="year">Último Ano</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">&nbsp;</label>
                                <button class="btn btn-primary" id="updateReportsBtn">
                                    📊 Atualizar Relatórios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="stats-grid mb-6" id="reportStats"></div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Donations by Blood Type -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Doações por Tipo Sanguíneo</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="donationsByTypeChart"></div>
                        </div>
                    </div>

                    <!-- Monthly Trend -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Tendência Mensal de Doações</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="monthlyTrendChart"></div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Stock Status -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Status do Estoque</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="stockStatusChart"></div>
                        </div>
                    </div>

                    <!-- Screening Results -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Resultados de Triagem</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="screeningResultsChart"></div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Tables -->
                <div class="grid grid-cols-1 gap-6">
                    <!-- Top Donors -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Principais Doadores (por número de doações)</h3>
                        </div>
                        <div class="card-body">
                            <div id="topDonorsTable"></div>
                        </div>
                    </div>

                    <!-- Distribution Summary -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Resumo de Distribuições</h3>
                        </div>
                        <div class="card-body">
                            <div id="distributionSummaryTable"></div>
                        </div>
                    </div>

                    <!-- Export Options -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Exportar Relatórios</h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button class="btn btn-primary" id="exportSummaryBtn">
                                    📊 Resumo Geral
                                </button>
                                <button class="btn btn-primary" id="exportDonorsBtn">
                                    👤 Relatório de Doadores
                                </button>
                                <button class="btn btn-primary" id="exportCollectionsBtn">
                                    🩸 Relatório de Coletas
                                </button>
                                <button class="btn btn-primary" id="exportStockBtn">
                                    📦 Relatório de Estoque
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'updateReportsBtn') {
                this.updateReports();
            } else if (e.target.id === 'exportSummaryBtn') {
                this.exportSummaryReport();
            } else if (e.target.id === 'exportDonorsBtn') {
                this.exportDonorsReport();
            } else if (e.target.id === 'exportCollectionsBtn') {
                this.exportCollectionsReport();
            } else if (e.target.id === 'exportStockBtn') {
                this.exportStockReport();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'quickPeriod') {
                this.setQuickPeriod(e.target.value);
            }
        });
    }

    init() {
        this.updateReports();
    }

    loadData() {
        this.donors = Storage.getDonors();
        this.appointments = Storage.getAppointments();
        this.screenings = Storage.getScreenings();
        this.collections = Storage.getCollections();
        this.stock = Storage.getStock();
        this.distributions = Storage.getDistributions();
    }

    getDefaultStartDate() {
        const date = new Date();
        date.setMonth(date.getMonth() - 3); // 3 months ago
        return date.toISOString().split('T')[0];
    }

    setQuickPeriod(period) {
        const endDate = new Date();
        let startDate = new Date();

        switch (period) {
            case 'today':
                startDate = new Date();
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                return;
        }

        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        
        this.updateReports();
    }

    getDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        return { startDate, endDate };
    }

    filterByDateRange(items, dateField) {
        const { startDate, endDate } = this.getDateRange();
        if (!startDate || !endDate) return items;

        return items.filter(item => {
            const itemDate = item[dateField];
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    updateReports() {
        this.loadData();
        this.renderReportStats();
        this.renderCharts();
        this.renderTables();
    }

    renderReportStats() {
        const { startDate, endDate } = this.getDateRange();
        
        // Filter data by date range
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        const filteredScreenings = this.filterByDateRange(this.screenings, 'date');
        const filteredDistributions = this.filterByDateRange(this.distributions, 'date');

        // Calculate statistics
        const totalCollections = filteredCollections.length;
        const totalVolume = filteredCollections.reduce((sum, c) => sum + parseInt(c.volume), 0);
        const aptScreenings = filteredScreenings.filter(s => s.result === 'apto').length;
        const totalScreenings = filteredScreenings.length;
        const aptRate = totalScreenings > 0 ? ((aptScreenings / totalScreenings) * 100).toFixed(1) : 0;
        const totalDistributions = filteredDistributions.filter(d => d.status === 'entregue').length;

        const stats = [
            {
                title: 'Total de Coletas',
                value: totalCollections,
                icon: '🩸'
            },
            {
                title: 'Volume Total Coletado',
                value: `${totalVolume}ml`,
                icon: '📊'
            },
            {
                title: 'Taxa de Aptidão',
                value: `${aptRate}%`,
                icon: '✅'
            },
            {
                title: 'Distribuições Realizadas',
                value: totalDistributions,
                icon: '🚚'
            }
        ];

        const statsContainer = document.getElementById('reportStats');
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

    renderCharts() {
        this.renderDonationsByTypeChart();
        this.renderMonthlyTrendChart();
        this.renderStockStatusChart();
        this.renderScreeningResultsChart();
    }

    renderDonationsByTypeChart() {
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        const bloodTypeCount = {};

        filteredCollections.forEach(collection => {
            const type = Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor);
            bloodTypeCount[type] = (bloodTypeCount[type] || 0) + 1;
        });

        const chartData = Object.entries(bloodTypeCount).map(([type, count]) => ({
            label: type,
            value: count
        }));

        const container = document.getElementById('donationsByTypeChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'pie',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhuma coleta no período</div>';
        }
    }

    renderMonthlyTrendChart() {
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        const monthlyData = {};

        // Get all months in the date range
        const { startDate, endDate } = this.getDateRange();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            const monthKey = d.toISOString().substr(0, 7);
            const monthName = d.toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
            });
            monthlyData[monthKey] = { name: monthName, count: 0 };
        }

        // Count collections by month
        filteredCollections.forEach(collection => {
            const monthKey = collection.date.substr(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].count++;
            }
        });

        const chartData = Object.values(monthlyData).map(item => ({
            label: item.name,
            value: item.count
        }));

        const container = document.getElementById('monthlyTrendChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'line',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Dados insuficientes para o gráfico</div>';
        }
    }

    renderStockStatusChart() {
        const statusCount = {
            'Disponível': this.stock.filter(s => s.status === 'disponivel').length,
            'Reservado': this.stock.filter(s => s.status === 'reservado').length,
            'Vencido': this.stock.filter(s => s.status === 'vencido').length,
            'Descartado': this.stock.filter(s => s.status === 'descartado').length
        };

        const chartData = Object.entries(statusCount)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => ({
                label: status,
                value: count
            }));

        const container = document.getElementById('stockStatusChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'pie',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhum item no estoque</div>';
        }
    }

    renderScreeningResultsChart() {
        const filteredScreenings = this.filterByDateRange(this.screenings, 'date');
        const resultCount = {
            'Apto': filteredScreenings.filter(s => s.result === 'apto').length,
            'Inapto': filteredScreenings.filter(s => s.result === 'inapto').length
        };

        const chartData = Object.entries(resultCount)
            .filter(([, count]) => count > 0)
            .map(([result, count]) => ({
                label: result,
                value: count
            }));

        const container = document.getElementById('screeningResultsChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'pie',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhuma triagem no período</div>';
        }
    }

    renderTables() {
        this.renderTopDonorsTable();
        this.renderDistributionSummaryTable();
    }

    renderTopDonorsTable() {
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        const donorCollections = {};

        // Count collections by donor
        filteredCollections.forEach(collection => {
            const donorId = collection.donorId;
            if (!donorCollections[donorId]) {
                donorCollections[donorId] = {
                    count: 0,
                    volume: 0,
                    donor: this.donors.find(d => d.id === donorId)
                };
            }
            donorCollections[donorId].count++;
            donorCollections[donorId].volume += parseInt(collection.volume);
        });

        // Sort by count and get top 10
        const topDonors = Object.values(donorCollections)
            .filter(item => item.donor)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const container = document.getElementById('topDonorsTable');
        if (container) {
            if (topDonors.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhuma doação no período</div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Posição</th>
                                <th>Doador</th>
                                <th>Tipo Sanguíneo</th>
                                <th>Doações</th>
                                <th>Volume Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topDonors.map((item, index) => `
                                <tr>
                                    <td class="font-bold">${index + 1}º</td>
                                    <td>${item.donor.name}</td>
                                    <td>
                                        <span class="${Helpers.getBloodTypeClass(item.donor.bloodType, item.donor.rhFactor)}">
                                            ${Helpers.getBloodTypeDisplay(item.donor.bloodType, item.donor.rhFactor)}
                                        </span>
                                    </td>
                                    <td class="font-semibold">${item.count}</td>
                                    <td class="font-semibold">${item.volume}ml</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    renderDistributionSummaryTable() {
        const filteredDistributions = this.filterByDateRange(this.distributions, 'date');
        const hospitalSummary = {};

        // Group by hospital
        filteredDistributions.forEach(distribution => {
            const hospital = distribution.hospital;
            if (!hospitalSummary[hospital]) {
                hospitalSummary[hospital] = {
                    hospital,
                    total: 0,
                    delivered: 0,
                    volume: 0
                };
            }
            hospitalSummary[hospital].total++;
            if (distribution.status === 'entregue') {
                hospitalSummary[hospital].delivered++;
                const volume = distribution.bags 
                    ? distribution.bags.reduce((sum, bag) => sum + parseInt(bag.volume), 0)
                    : 0;
                hospitalSummary[hospital].volume += volume;
            }
        });

        const summaryData = Object.values(hospitalSummary)
            .sort((a, b) => b.delivered - a.delivered);

        const container = document.getElementById('distributionSummaryTable');
        if (container) {
            if (summaryData.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhuma distribuição no período</div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Hospital/Clínica</th>
                                <th>Total Solicitado</th>
                                <th>Entregue</th>
                                <th>Volume Entregue</th>
                                <th>Taxa de Entrega</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${summaryData.map(item => {
                                const deliveryRate = item.total > 0 ? ((item.delivered / item.total) * 100).toFixed(1) : 0;
                                return `
                                    <tr>
                                        <td class="font-semibold">${item.hospital}</td>
                                        <td>${item.total}</td>
                                        <td class="font-semibold">${item.delivered}</td>
                                        <td class="font-semibold">${item.volume}ml</td>
                                        <td>
                                            <span class="badge ${deliveryRate >= 80 ? 'badge-success' : deliveryRate >= 60 ? 'badge-warning' : 'badge-error'}">
                                                ${deliveryRate}%
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    exportSummaryReport() {
        const { startDate, endDate } = this.getDateRange();
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        const filteredScreenings = this.filterByDateRange(this.screenings, 'date');
        const filteredDistributions = this.filterByDateRange(this.distributions, 'date');

        const summary = {
            'Período': `${Helpers.formatDate(startDate)} a ${Helpers.formatDate(endDate)}`,
            'Total de Doadores Cadastrados': this.donors.length,
            'Total de Coletas': filteredCollections.length,
            'Volume Total Coletado (ml)': filteredCollections.reduce((sum, c) => sum + parseInt(c.volume), 0),
            'Total de Triagens': filteredScreenings.length,
            'Triagens Aptas': filteredScreenings.filter(s => s.result === 'apto').length,
            'Triagens Inaptas': filteredScreenings.filter(s => s.result === 'inapto').length,
            'Taxa de Aptidão (%)': filteredScreenings.length > 0 ? 
                ((filteredScreenings.filter(s => s.result === 'apto').length / filteredScreenings.length) * 100).toFixed(1) : 0,
            'Total de Distribuições': filteredDistributions.length,
            'Distribuições Entregues': filteredDistributions.filter(d => d.status === 'entregue').length,
            'Estoque Disponível': this.stock.filter(s => s.status === 'disponivel').length,
            'Estoque Vencido': this.stock.filter(s => s.status === 'vencido').length
        };

        const exportData = Object.entries(summary).map(([key, value]) => ({
            'Indicador': key,
            'Valor': value
        }));

        const filename = `resumo_geral_${startDate}_${endDate}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Resumo geral exportado com sucesso!', 'success');
    }

    exportDonorsReport() {
        const { startDate, endDate } = this.getDateRange();
        const filteredCollections = this.filterByDateRange(this.collections, 'date');
        
        const donorStats = this.donors.map(donor => {
            const donorCollections = filteredCollections.filter(c => c.donorId === donor.id);
            const totalVolume = donorCollections.reduce((sum, c) => sum + parseInt(c.volume), 0);
            const lastDonation = donorCollections.length > 0 
                ? Math.max(...donorCollections.map(c => new Date(c.date)))
                : null;

            return {
                'Nome': donor.name,
                'CPF': Helpers.formatCPF(donor.cpf),
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor),
                'Idade': Helpers.calculateAge(donor.birthDate),
                'Telefone': Helpers.formatPhone(donor.phone),
                'Doações no Período': donorCollections.length,
                'Volume Total Doado (ml)': totalVolume,
                'Última Doação': lastDonation ? Helpers.formatDate(new Date(lastDonation)) : 'Nunca'
            };
        });

        const filename = `relatorio_doadores_${startDate}_${endDate}.csv`;
        Helpers.exportToCSV(donorStats, filename);
        Helpers.showToast('Relatório de doadores exportado com sucesso!', 'success');
    }

    exportCollectionsReport() {
        const { startDate, endDate } = this.getDateRange();
        const filteredCollections = this.filterByDateRange(this.collections, 'date');

        const exportData = filteredCollections.map(collection => {
            const donor = this.donors.find(d => d.id === collection.donorId);
            return {
                'Data': Helpers.formatDate(collection.date),
                'Código da Bolsa': collection.bagCode,
                'Doador': donor ? donor.name : collection.donorName || 'N/A',
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(collection.bloodType, collection.rhFactor),
                'Volume (ml)': collection.volume,
                'Responsável': collection.technician,
                'Status': collection.status || 'coletado'
            };
        });

        const filename = `relatorio_coletas_${startDate}_${endDate}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Relatório de coletas exportado com sucesso!', 'success');
    }

    exportStockReport() {
        const exportData = this.stock.map(item => {
            const expiryDate = new Date(item.expiryDate || Helpers.getBloodExpiryDate(item.collectionDate));
            const isExpired = Helpers.isBloodExpired(item.collectionDate);
            const isExpiring = Helpers.isBloodExpiringSoon(item.collectionDate);

            return {
                'Código da Bolsa': item.bagCode,
                'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor),
                'Volume (ml)': item.volume,
                'Data de Coleta': Helpers.formatDate(item.collectionDate),
                'Data de Validade': Helpers.formatDate(expiryDate),
                'Status': item.status,
                'Situação': isExpired ? 'Vencido' : isExpiring ? 'Vencendo' : 'Normal',
                'Doador': item.donorName || 'N/A'
            };
        });

        const filename = `relatorio_estoque_${Helpers.getCurrentDate()}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Relatório de estoque exportado com sucesso!', 'success');
    }
}

window.Reports = Reports;