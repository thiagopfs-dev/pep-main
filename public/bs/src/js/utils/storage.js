/**
 * Local Storage utility functions
 */

class Storage {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Specific methods for our application data
    static getDonors() {
        return this.get('donors', []);
    }

    static setDonors(donors) {
        return this.set('donors', donors);
    }

    static getAppointments() {
        return this.get('appointments', []);
    }

    static setAppointments(appointments) {
        return this.set('appointments', appointments);
    }

    static getScreenings() {
        return this.get('screenings', []);
    }

    static setScreenings(screenings) {
        return this.set('screenings', screenings);
    }

    static getCollections() {
        return this.get('collections', []);
    }

    static setCollections(collections) {
        return this.set('collections', collections);
    }

    static getStock() {
        return this.get('stock', []);
    }

    static setStock(stock) {
        return this.set('stock', stock);
    }

    static getDistributions() {
        return this.get('distributions', []);
    }

    static setDistributions(distributions) {
        return this.set('distributions', distributions);
    }

    // Generate unique IDs
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Initialize default data if needed
    static initializeData() {
        // Initialize empty arrays if they don't exist
        if (!this.getDonors().length) {
            this.setDonors([]);
        }
        if (!this.getAppointments().length) {
            this.setAppointments([]);
        }
        if (!this.getScreenings().length) {
            this.setScreenings([]);
        }
        if (!this.getCollections().length) {
            this.setCollections([]);
        }
        if (!this.getStock().length) {
            this.setStock([]);
        }
        if (!this.getDistributions().length) {
            this.setDistributions([]);
        }
    }
}

// Initialize data when the module loads
Storage.initializeData();

window.Storage = Storage;