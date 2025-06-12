/**
 * Main application controller
 */

class App {
    constructor() {
        this.currentModule = null;
        this.modules = {};
        this.init();
    }

    init() {
        this.initializeModules();
        this.bindEvents();
        this.loadModule('dashboard');
        this.updateCurrentTime();
        this.checkForExpiredStock();
    }

    initializeModules() {
        // Initialize all modules
        this.modules = {
            dashboard: new Dashboard(),
            donors: new Donors(),
            appointments: new Appointments(),
            screening: new Screening(),
            collection: new Collection(),
            stock: new Stock(),
            distribution: new Distribution(),
            reports: new Reports()
        };
    }

    bindEvents() {
        // Sidebar navigation and other global events
        document.addEventListener('click', (e) => {
            const sidebarLink = e.target.closest('.sidebar-menu a');

            // --- CORREÇÃO APLICADA AQUI ---
            // Verifica se o clique foi em um link do menu da sidebar
            if (sidebarLink) {
                const module = sidebarLink.dataset.module;

                // Apenas executa a lógica de SPA se o link tiver o atributo data-module
                if (module) {
                    e.preventDefault(); // Previne o comportamento padrão APENAS para links de módulo
                    this.loadModule(module);
                }
                // Se o link não tiver data-module (como o "Home"), o navegador seguirá o href normalmente.
            
            } else if (e.target.id === 'sidebarToggle') {
                this.toggleSidebar();
            }

            // Close sidebar when clicking outside on mobile
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebarToggle');
            
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('show') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });

        // Handle responsive sidebar
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                document.getElementById('sidebar').classList.remove('show');
            }
        });
    }

    loadModule(moduleName) {
        const module = this.modules[moduleName];
        if (!module) {
            console.error(`Module ${moduleName} not found`);
            return;
        }

        // Update active navigation
        this.updateActiveNavigation(moduleName);
        
        // Update breadcrumb
        this.updateBreadcrumb(moduleName);
        
        // Render module content
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = module.render();
            
            // Initialize module after rendering
            setTimeout(() => {
                if (module.init) {
                    module.init();
                }
            }, 100);
        }

        this.currentModule = moduleName;
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('show');
        }
    }

    updateActiveNavigation(moduleName) {
        // Remove active class from all navigation items
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current module
        const activeLink = document.querySelector(`[data-module="${moduleName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateBreadcrumb(moduleName) {
        const breadcrumbMap = {
            dashboard: 'Dashboard',
            donors: 'Gestão de Doadores',
            appointments: 'Agendamento de Doações',
            screening: 'Triagem Clínica',
            collection: 'Registro de Coleta',
            stock: 'Gestão de Estoque',
            distribution: 'Distribuição de Sangue',
            reports: 'Relatórios e Estatísticas'
        };

        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.textContent = breadcrumbMap[moduleName] || moduleName;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleString('pt-BR');
        }

        // Update every minute
        setTimeout(() => this.updateCurrentTime(), 60000);
    }

    checkForExpiredStock() {
        const stock = Storage.getStock();
        const expiring = stock.filter(item => 
            item.status === 'disponivel' && 
            Helpers.isBloodExpiringSoon(item.collectionDate)
        );
        
        const expired = stock.filter(item => 
            item.status === 'disponivel' && 
            Helpers.isBloodExpired(item.collectionDate)
        );

        // Auto-update expired items
        if (expired.length > 0) {
            expired.forEach(item => {
                item.status = 'vencido';
                item.updatedAt = new Date().toISOString();
            });
            Storage.setStock(stock);
        }

        // Show notifications for expiring items
        if (expiring.length > 0) {
            setTimeout(() => {
                Helpers.showToast(
                    `⚠️ ${expiring.length} bolsa(s) vencendo em 7 dias. Verifique o estoque.`,
                    'warning'
                );
            }, 2000);
        }

        // Check again in 1 hour
        setTimeout(() => this.checkForExpiredStock(), 3600000);
    }

    // Public methods for module communication
    refreshModule(moduleName) {
        if (this.modules[moduleName] && this.modules[moduleName].init) {
            this.modules[moduleName].loadData();
            this.modules[moduleName].init();
        }
    }

    refreshCurrentModule() {
        if (this.currentModule) {
            this.refreshModule(this.currentModule);
        }
    }

    refreshAllModules() {
        Object.keys(this.modules).forEach(moduleName => {
            if (this.modules[moduleName].loadData) {
                this.modules[moduleName].loadData();
            }
        });
        
        if (this.currentModule) {
            this.refreshModule(this.currentModule);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    
    // Show welcome message
    setTimeout(() => {
        Helpers.showToast('Sistema de Gestão de Banco de Sangue carregado com sucesso!', 'success');
    }, 1000);
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    Helpers.showToast('Ocorreu um erro inesperado. Verifique o console para mais detalhes.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    Helpers.showToast('Erro de processamento. Tente novamente.', 'error');
});