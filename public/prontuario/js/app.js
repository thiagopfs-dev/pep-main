// Main application class
class PEPSystem {
    constructor() {
        this.activeSection = 'overview';
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.renderSidebar();
        this.bindEvents();
        this.renderContent();
        this.initLucideIcons();
    }

    initLucideIcons() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderSidebar() {
        const menuItemsContainer = document.getElementById('menu-items');
        
        menuItemsContainer.innerHTML = menuItems.map(item => `
            <li>
                <button
                    data-section="${item.id}"
                    class="menu-item w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        this.activeSection === item.id
                            ? 'bg-sky-100 text-sky-700 border border-sky-200'
                            : 'text-gray-600 hover:bg-gray-100'
                    }"
                >
                    <i data-lucide="${item.icon}" class="w-5 h-5 flex-shrink-0"></i>
                    <span class="font-medium menu-item-text">${item.label}</span>
                </button>
            </li>
        `).join('');
    }

    bindEvents() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Menu item clicks
        const menuItemsContainer = document.getElementById('menu-items');
        menuItemsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.menu-item');
            if (button) {
                const section = button.getAttribute('data-section');
                this.setActiveSection(section);
            }
        });

        // Search functionality
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('sidebar-collapsed');
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-16');
            sidebarToggle.innerHTML = '<i data-lucide="chevron-right" class="w-5 h-5"></i>';
        } else {
            sidebar.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('w-16');
            sidebar.classList.add('w-64');
            sidebarToggle.innerHTML = '<i data-lucide="chevron-left" class="w-5 h-5"></i>';
        }
        
        this.initLucideIcons();
    }

    setActiveSection(section) {
        this.activeSection = section;
        this.renderSidebar();
        this.renderContent();
        this.initLucideIcons();
    }

    renderContent() {
        const mainContent = document.getElementById('main-content');
        
        let content = '';
        switch (this.activeSection) {
            case 'overview':
                content = PEPComponents.renderOverview();
                break;
            case 'history':
                content = PEPComponents.renderHistory();
                break;
            case 'prescriptions':
                content = PEPComponents.renderPrescriptions();
                break;
            case 'labs':
                content = PEPComponents.renderLabs();
                break;
            case 'appointments':
                content = PEPComponents.renderPlaceholder('Consultas Agendadas');
                break;
            case 'documents':
                content = PEPComponents.renderPlaceholder('Documentos');
                break;
            default:
                content = PEPComponents.renderOverview();
        }
        
        mainContent.innerHTML = content;
        this.initLucideIcons();
    }

    handleSearch(query) {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // Implement search functionality here
        // This could filter patients, medications, tests, etc.
    }

    // Utility methods
    static showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    static formatDateTime(dateString) {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pepSystem = new PEPSystem();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PEPSystem;
}