/**
 * Dashboard module
 */

class Dashboard {
    constructor() {
        this.bindEvents();
    }

    render() {
        return `
            <div class="fade-in">
                <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
                
                <!-- Statistics Cards -->
                <div class="stats-grid" id="statsGrid"></div>
                
                <!-- Charts Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <!-- Blood Type Distribution -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Distribuição por Tipo Sanguíneo</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="bloodTypeChart"></div>
                        </div>
                    </div>
                    
                    <!-- Monthly Donations -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Doações por Mês</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container" id="monthlyChart"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Recent Appointments -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Próximos Agendamentos</h3>
                        </div>
                        <div class="card-body">
                            <div id="recentAppointments"></div>
                        </div>
                    </div>
                    
                    <!-- Expiring Stock -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Estoque Próximo ao Vencimento</h3>
                        </div>
                        <div class="card-body">
                            <div id="expiringStock"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Dashboard doesn't have specific events
    }

    init() {
        this.renderStatistics();
        this.renderCharts();
        this.renderRecentActivity();
    }

    renderStatistics() {
        const donors = Storage.getDonors();
        const appointments = Storage.getAppointments();
        const collections = Storage.getCollections();
        const stock = Storage.getStock();

        // Calculate statistics
        const totalDonors = donors.length;
        const todayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const today = new Date();
            return aptDate.toDateString() === today.toDateString();
        }).length;

        const availableStock = stock.filter(item => item.status === 'disponivel').length;
        const expiringStock = stock.filter(item => {
            return item.status === 'disponivel' && 
                   Helpers.isBloodExpiringSoon(item.collectionDate);
        }).length;

        const thisMonthCollections = collections.filter(collection => {
            const collectionDate = new Date(collection.date);  
            const now = new Date();
            return collectionDate.getMonth() === now.getMonth() && 
                   collectionDate.getFullYear() === now.getFullYear();
        }).length;

        const lastMonthCollections = collections.filter(collection => {
            const collectionDate = new Date(collection.date);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return collectionDate.getMonth() === lastMonth.getMonth() && 
                   collectionDate.getFullYear() === lastMonth.getFullYear();
        }).length;

        const collectionChange = lastMonthCollections > 0 
            ? ((thisMonthCollections - lastMonthCollections) / lastMonthCollections * 100).toFixed(1)
            : 0;

        const stats = [
            {
                title: 'Total de Doadores',
                value: totalDonors,
                icon: '👤',
                change: null
            },
            {
                title: 'Agendamentos Hoje',
                value: todayAppointments,
                icon: '📅',
                change: null
            },
            {
                title: 'Estoque Disponível',
                value: availableStock,
                icon: '🩸',
                change: null
            },
            {
                title: 'Coletas Este Mês',
                value: thisMonthCollections,
                icon: '📊',
                change: collectionChange !== '0' ? `${collectionChange > 0 ? '+' : ''}${collectionChange}%` : null,
                changeType: collectionChange > 0 ? 'positive' : 'negative'
            }
        ];

        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">${stat.title}</div>
                        <div class="stat-card-icon">${stat.icon}</div>
                    </div>
                    <div class="stat-card-value">${stat.value}</div>
                    ${stat.change ? `
                        <div class="stat-card-change ${stat.changeType}">
                            ${stat.changeType === 'positive' ? '↗' : '↘'} ${stat.change}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        // Add notification dot for expiring stock
        if (expiringStock > 0) {
            const stockCard = statsGrid.querySelector('.stat-card:nth-child(3)');
            if (stockCard) {
                stockCard.classList.add('notification-dot');
            }
        }
    }

    renderCharts() {
        this.renderBloodTypeChart();
        this.renderMonthlyChart();
    }

    renderBloodTypeChart() {
        const donors = Storage.getDonors();
        const bloodTypes = {};

        // Count blood types
        donors.forEach(donor => {
            const bloodType = Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor);
            bloodTypes[bloodType] = (bloodTypes[bloodType] || 0) + 1;
        });

        const chartData = Object.entries(bloodTypes).map(([type, count]) => ({
            label: type,
            value: count
        }));

        const container = document.getElementById('bloodTypeChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'pie',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhum doador cadastrado</div>';
        }
    }

    renderMonthlyChart() {
        const collections = Storage.getCollections();
        const monthlyData = {};

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substr(0, 7); // YYYY-MM format
            const monthName = date.toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
            });
            monthlyData[monthKey] = { name: monthName, count: 0 };
        }

        // Count collections by month
        collections.forEach(collection => {
            const monthKey = collection.date.substr(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].count++;
            }
        });

        const chartData = Object.values(monthlyData).map(item => ({
            label: item.name,
            value: item.count
        }));

        const container = document.getElementById('monthlyChart');
        if (container && chartData.length > 0) {
            const chart = new Chart(container, { 
                type: 'line',
                width: container.offsetWidth || 300,
                height: 250
            });
            chart.setData(chartData).render();
        } else if (container) {
            container.innerHTML = '<div class="empty-state">Nenhuma coleta registrada</div>';
        }
    }

    renderRecentActivity() {
        this.renderRecentAppointments();
        this.renderExpiringStock();
    }

    renderRecentAppointments() {
        const appointments = Storage.getAppointments();
        const donors = Storage.getDonors();
        
        // Get next 5 upcoming appointments
        const upcoming = appointments
            .filter(apt => new Date(apt.date + 'T' + apt.time) > new Date())
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
            .slice(0, 5);

        const container = document.getElementById('recentAppointments');
        if (container) {
            if (upcoming.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhum agendamento próximo</div>';
                return;
            }

            container.innerHTML = upcoming.map(apt => {
                const donor = donors.find(d => d.id === apt.donorId);
                const donorName = donor ? donor.name : 'Doador não encontrado';
                const bloodType = donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '';
                const dateTime = new Date(apt.date + 'T' + apt.time);
                
                return `
                    <div class="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0">
                        <div>
                            <div class="font-semibold">${donorName}</div>
                            <div class="text-sm text-secondary">
                                ${Helpers.formatDate(apt.date)} às ${apt.time}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="${Helpers.getBloodTypeClass(donor?.bloodType || 'O', donor?.rhFactor || '+')}">${bloodType}</span>
                            ${Helpers.getStatusBadge(apt.status)}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    renderExpiringStock() {
        const stock = Storage.getStock();
        
        // Get stock expiring in the next 7 days
        const expiring = stock
            .filter(item => {
                return item.status === 'disponivel' && 
                       Helpers.isBloodExpiringSoon(item.collectionDate);
            })
            .sort((a, b) => {
                const aExpiry = Helpers.getBloodExpiryDate(a.collectionDate);
                const bExpiry = Helpers.getBloodExpiryDate(b.collectionDate);
                return aExpiry - bExpiry;
            })
            .slice(0, 5);

        const container = document.getElementById('expiringStock');
        if (container) {
            if (expiring.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhum item próximo ao vencimento</div>';
                return;
            }

            container.innerHTML = expiring.map(item => {
                const expiryDate = Helpers.getBloodExpiryDate(item.collectionDate);
                const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0 expiry-warning">
                        <div>
                            <div class="font-semibold">${item.bagCode}</div>
                            <div class="text-sm text-secondary">
                                Vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="${Helpers.getBloodTypeClass(item.bloodType, item.rhFactor)}">
                                ${Helpers.getBloodTypeDisplay(item.bloodType, item.rhFactor)}
                            </span>
                            <span class="text-sm text-secondary">${item.volume}ml</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

window.Dashboard = Dashboard;