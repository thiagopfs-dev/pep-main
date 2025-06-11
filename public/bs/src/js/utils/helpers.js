/**
 * Helper utility functions
 */

class Helpers {
    // Format date to Brazilian format
    static formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    // Format date and time
    static formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('pt-BR');
    }

    // Format CPF
    static formatCPF(cpf) {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Format phone number
    static formatPhone(phone) {
        if (!phone) return '';
        return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }

    // Validate CPF
    static validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        
        // Check if all digits are the same
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validate check digits
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    // Get blood type display
    static getBloodTypeDisplay(type, rh) {
        return `${type}${rh}`;
    }

    // Get blood type CSS class
    static getBloodTypeClass(type, rh) {
        const bloodType = `${type}${rh}`.toLowerCase();
        return `blood-type ${bloodType.replace('+', '-positive').replace('-', '-negative')}`;
    }

    // Calculate age from birth date
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Check if blood is expired
    static isBloodExpired(collectionDate, expiryDays = 42) {
        const collection = new Date(collectionDate);
        const expiry = new Date(collection.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        return new Date() > expiry;
    }

    // Check if blood is expiring soon
    static isBloodExpiringSoon(collectionDate, warningDays = 7, expiryDays = 42) {
        const collection = new Date(collectionDate);
        const expiry = new Date(collection.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        const warning = new Date(expiry.getTime() - (warningDays * 24 * 60 * 60 * 1000));
        const now = new Date();
        return now >= warning && now < expiry;
    }

    // Get expiry date for blood
    static getBloodExpiryDate(collectionDate, expiryDays = 42) {
        const collection = new Date(collectionDate);
        return new Date(collection.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    }

    // Generate collection code
    static generateCollectionCode() {
        const now = new Date();
        const year = now.getFullYear().toString().substr(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${year}${month}${day}-${random}`;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#10b981';
                break;
            case 'error':
                toast.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                toast.style.backgroundColor = '#f59e0b';
                break;
            default:
                toast.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Validate email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone
    static validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    // Get status badge HTML
    static getStatusBadge(status) {
        const statusMap = {
            'confirmado': { class: 'badge-success', text: 'Confirmado' },
            'pendente': { class: 'badge-warning', text: 'Pendente' },
            'concluido': { class: 'badge-success', text: 'Concluído' },
            'ausente': { class: 'badge-error', text: 'Ausente' },
            'apto': { class: 'badge-success', text: 'Apto' },
            'inapto': { class: 'badge-error', text: 'Inapto' },
            'disponivel': { class: 'badge-success', text: 'Disponível' },
            'reservado': { class: 'badge-warning', text: 'Reservado' },
            'vencido': { class: 'badge-error', text: 'Vencido' },
            'descartado': { class: 'badge-error', text: 'Descartado' },
            'entregue': { class: 'badge-success', text: 'Entregue' }
        };

        const statusInfo = statusMap[status.toLowerCase()] || { class: 'badge-info', text: status };
        return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
    }

    // Search filter function
    static filterItems(items, searchTerm, fields) {
        if (!searchTerm) return items;
        
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            return fields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    }

    // Get nested object value
    static getNestedValue(obj, path) {
        return path.split('.').reduce((curr, prop) => curr && curr[prop], obj);
    }

    // Sort items by field
    static sortItems(items, field, direction = 'asc') {
        return [...items].sort((a, b) => {
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Export data to CSV
    static exportToCSV(data, filename) {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = value ? value.toString().replace(/"/g, '""') : '';
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Get current date in YYYY-MM-DD format
    static getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    // Get current time in HH:MM format
    static getCurrentTime() {
        return new Date().toTimeString().split(' ')[0].substr(0, 5);
    }

    // Clean and format input values
    static cleanCPF(cpf) {
        return cpf.replace(/[^\d]/g, '');
    }

    static cleanPhone(phone) {
        return phone.replace(/[^\d]/g, '');
    }
}

window.Helpers = Helpers;