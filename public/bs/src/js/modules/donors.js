/**
 * Donors module
 */

class Donors {
    constructor() {
        this.donors = [];
        this.filteredDonors = [];
        this.currentSort = { field: 'name', direction: 'asc' };
        this.bindEvents();
        this.loadDonors();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Gestão de Doadores</h1>
                    <button class="btn btn-primary" id="addDonorBtn">
                        ➕ Adicionar Doador
                    </button>
                </div>

                <!-- Search and Filter -->
                <div class="search-filter-bar">
                    <input type="text" class="form-input search-input" id="searchDonors" 
                           placeholder="Buscar por nome ou CPF...">
                    <select class="form-select filter-select" id="filterBloodType">
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
                    <button class="btn" id="exportDonorsBtn">📊 Exportar</button>
                </div>

                <!-- Donors Table -->
                <div class="card">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th><button class="sort-btn" data-field="name">Nome</button></th>
                                    <th><button class="sort-btn" data-field="cpf">CPF</button></th>
                                    <th><button class="sort-btn" data-field="birthDate">Idade</button></th>
                                    <th><button class="sort-btn" data-field="bloodType">Tipo Sanguíneo</button></th>
                                    <th><button class="sort-btn" data-field="phone">Telefone</button></th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="donorsTableBody">
                                <!-- Dynamic content -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addDonorBtn') {
                this.showDonorForm();
            } else if (e.target.classList.contains('edit-donor-btn')) {
                this.editDonor(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-donor-btn')) {
                this.deleteDonor(e.target.dataset.id);
            } else if (e.target.classList.contains('sort-btn')) {
                this.sortDonors(e.target.dataset.field);
            } else if (e.target.id === 'exportDonorsBtn') {
                this.exportDonors();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchDonors') {
                this.searchDonors(e.target.value);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'filterBloodType') {
                this.filterByBloodType(e.target.value);
            }
        });
    }

    init() {
        this.renderDonorsTable();
    }

    loadDonors() {
        this.donors = Storage.getDonors();
        this.filteredDonors = [...this.donors];
    }

    renderDonorsTable() {
        const tbody = document.getElementById('donorsTableBody');
        if (!tbody) return;

        if (this.filteredDonors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-secondary">
                        Nenhum doador encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredDonors.map(donor => `
            <tr>
                <td class="font-semibold">${donor.name}</td>
                <td>${Helpers.formatCPF(donor.cpf)}</td>
                <td>${Helpers.calculateAge(donor.birthDate)} anos</td>
                <td>
                    <span class="${Helpers.getBloodTypeClass(donor.bloodType, donor.rhFactor)}">
                        ${Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor)}
                    </span>
                </td>
                <td>${Helpers.formatPhone(donor.phone)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm edit-donor-btn" data-id="${donor.id}">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-error delete-donor-btn" data-id="${donor.id}">
                            🗑️ Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showDonorForm(donorId = null) {
        const isEdit = donorId !== null;
        const donor = isEdit ? this.donors.find(d => d.id === donorId) : null;

        const formHTML = `
            <form id="donorForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome Completo *</label>
                        <input type="text" name="name" class="form-input" required 
                               value="${donor?.name || ''}" placeholder="Nome completo do doador">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CPF *</label>
                        <input type="text" name="cpf" class="form-input" required 
                               value="${donor?.cpf || ''}" placeholder="000.000.000-00"
                               maxlength="14" pattern="[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Nascimento *</label>
                        <input type="date" name="birthDate" class="form-input" required 
                               value="${donor?.birthDate || ''}" max="${Helpers.getCurrentDate()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Sexo *</label>
                        <select name="gender" class="form-select" required>
                            <option value="">Selecione</option>
                            <option value="M" ${donor?.gender === 'M' ? 'selected' : ''}>Masculino</option>
                            <option value="F" ${donor?.gender === 'F' ? 'selected' : ''}>Feminino</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo Sanguíneo *</label>
                        <select name="bloodType" class="form-select" required>
                            <option value="">Selecione</option>
                            <option value="A" ${donor?.bloodType === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${donor?.bloodType === 'B' ? 'selected' : ''}>B</option>
                            <option value="AB" ${donor?.bloodType === 'AB' ? 'selected' : ''}>AB</option>
                            <option value="O" ${donor?.bloodType === 'O' ? 'selected' : ''}>O</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fator RH *</label>
                        <select name="rhFactor" class="form-select" required>
                            <option value="">Selecione</option>
                            <option value="+" ${donor?.rhFactor === '+' ? 'selected' : ''}>Positivo (+)</option>
                            <option value="-" ${donor?.rhFactor === '-' ? 'selected' : ''}>Negativo (-)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Telefone *</label>
                        <input type="tel" name="phone" class="form-input" required 
                               value="${donor?.phone || ''}" placeholder="(00) 00000-0000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-input" 
                               value="${donor?.email || ''}" placeholder="email@exemplo.com">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Endereço</label>
                    <textarea name="address" class="form-textarea" 
                              placeholder="Endereço completo">${donor?.address || ''}</textarea>
                </div>
            </form>
        `;

        modal.form(
            isEdit ? 'Editar Doador' : 'Novo Doador',
            formHTML,
            (data, form) => {
                if (this.validateDonorForm(data, form)) {
                    this.saveDonor(data, donorId);
                    return true;
                }
                return false;
            }
        );

        // Add input masks
        setTimeout(() => {
            const cpfInput = form.querySelector('input[name="cpf"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            
            if (cpfInput) {
                cpfInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = value;
                });
            }
            
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

    validateDonorForm(data, form) {
        const errors = [];

        // Validate required fields
        if (!data.name?.trim()) errors.push('Nome é obrigatório');
        if (!data.cpf?.trim()) errors.push('CPF é obrigatório');
        if (!data.birthDate) errors.push('Data de nascimento é obrigatória');
        if (!data.gender) errors.push('Sexo é obrigatório');
        if (!data.bloodType) errors.push('Tipo sanguíneo é obrigatório');
        if (!data.rhFactor) errors.push('Fator RH é obrigatório');
        if (!data.phone?.trim()) errors.push('Telefone é obrigatório');

        // Validate CPF
        if (data.cpf && !Helpers.validateCPF(data.cpf)) {
            errors.push('CPF inválido');
        }

        // Check for duplicate CPF
        const existingDonor = this.donors.find(d => 
            Helpers.cleanCPF(d.cpf) === Helpers.cleanCPF(data.cpf) && 
            d.id !== data.id
        );
        if (existingDonor) {
            errors.push('CPF já cadastrado');
        }

        // Validate age (must be between 16 and 69)
        if (data.birthDate) {
            const age = Helpers.calculateAge(data.birthDate);
            if (age < 16 || age > 69) {
                errors.push('Doador deve ter entre 16 e 69 anos');
            }
        }

        // Validate email format
        if (data.email && !Helpers.validateEmail(data.email)) {
            errors.push('Email inválido');
        }

        if (errors.length > 0) {
            Helpers.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    saveDonor(data, donorId = null) {
        const isEdit = donorId !== null;
        
        if (isEdit) {
            // Update existing donor
            const index = this.donors.findIndex(d => d.id === donorId);
            if (index !== -1) {
                this.donors[index] = { ...this.donors[index], ...data };
                Helpers.showToast('Doador atualizado com sucesso!', 'success');
            }
        } else {
            // Create new donor
            const newDonor = {
                id: Storage.generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.donors.push(newDonor);
            Helpers.showToast('Doador cadastrado com sucesso!', 'success');
        }

        // Save to storage
        Storage.setDonors(this.donors);
        this.filteredDonors = [...this.donors];
        this.renderDonorsTable();
    }

    editDonor(donorId) {
        this.showDonorForm(donorId);
    }

    deleteDonor(donorId) {
        const donor = this.donors.find(d => d.id === donorId);
        if (!donor) return;

        modal.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o doador "${donor.name}"?`,
            () => {
                this.donors = this.donors.filter(d => d.id !== donorId);
                Storage.setDonors(this.donors);
                this.filteredDonors = [...this.donors];
                this.renderDonorsTable();
                Helpers.showToast('Doador excluído com sucesso!', 'success');
            }
        );
    }

    sortDonors(field) {
        const direction = this.currentSort.field === field && this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        this.currentSort = { field, direction };
        
        this.filteredDonors = Helpers.sortItems(this.filteredDonors, field, direction);
        this.renderDonorsTable();
    }

    searchDonors(searchTerm) {
        this.filteredDonors = Helpers.filterItems(
            this.donors, 
            searchTerm, 
            ['name', 'cpf', 'phone', 'email']
        );
        this.applyFilters();
    }

    filterByBloodType(bloodType) {
        if (bloodType) {
            this.filteredDonors = this.filteredDonors.filter(donor => 
                Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) === bloodType
            );
        }
        this.renderDonorsTable();
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchDonors')?.value || '';
        const bloodTypeFilter = document.getElementById('filterBloodType')?.value || '';
        
        this.filteredDonors = [...this.donors];
        
        if (searchTerm) {
            this.filteredDonors = Helpers.filterItems(
                this.filteredDonors, 
                searchTerm, 
                ['name', 'cpf', 'phone', 'email']
            );
        }
        
        if (bloodTypeFilter) {
            this.filteredDonors = this.filteredDonors.filter(donor => 
                Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) === bloodTypeFilter
            );
        }
        
        this.renderDonorsTable();
    }

    exportDonors() {
        if (this.filteredDonors.length === 0) {
            Helpers.showToast('Nenhum doador para exportar', 'warning');
            return;
        }

        const exportData = this.filteredDonors.map(donor => ({
            Nome: donor.name,
            CPF: Helpers.formatCPF(donor.cpf),
            'Data de Nascimento': Helpers.formatDate(donor.birthDate),
            Idade: Helpers.calculateAge(donor.birthDate),
            Sexo: donor.gender === 'M' ? 'Masculino' : 'Feminino',
            'Tipo Sanguíneo': Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor),
            Telefone: Helpers.formatPhone(donor.phone),
            Email: donor.email || '',
            Endereço: donor.address || ''
        }));

        const filename = `doadores_${new Date().toISOString().split('T')[0]}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Dados exportados com sucesso!', 'success');
    }
}

window.Donors = Donors;