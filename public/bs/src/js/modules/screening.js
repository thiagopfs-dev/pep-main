/**
 * Screening module
 */

class Screening {
    constructor() {
        this.screenings = [];
        this.donors = [];
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Triagem Clínica</h1>
                    <button class="btn btn-primary" id="addScreeningBtn">
                        ➕ Nova Triagem
                    </button>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <select class="form-select" id="donorFilterScreening">
                        <option value="">Filtrar por doador</option>
                        ${this.donors.map(donor => `
                            <option value="${donor.id}">${donor.name}</option>
                        `).join('')}
                    </select>
                    <select class="form-select" id="resultFilter">
                        <option value="">Todos os resultados</option>
                        <option value="apto">Apto</option>
                        <option value="inapto">Inapto</option>
                    </select>
                    <button class="btn" id="exportScreeningBtn">📊 Exportar</button>
                </div>

                <!-- Screenings Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Registros de Triagem</h3>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Doador</th>
                                    <th>Tipo Sanguíneo</th>
                                    <th>Sinais Vitais</th>
                                    <th>Resultado</th>
                                    <th>Responsável</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="screeningsTableBody">
                                <!-- Dynamic content -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addScreeningBtn') {
                this.showScreeningForm();
            } else if (e.target.classList.contains('view-screening-btn')) {
                this.viewScreening(e.target.dataset.id);
            } else if (e.target.classList.contains('edit-screening-btn')) {
                this.editScreening(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-screening-btn')) {
                this.deleteScreening(e.target.dataset.id);
            } else if (e.target.id === 'exportScreeningBtn') {
                this.exportScreenings();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'donorFilterScreening' || e.target.id === 'resultFilter') {
                this.filterScreenings();
            }
        });
    }

    init() {
        this.renderScreeningsTable();
    }

    loadData() {
        this.screenings = Storage.getScreenings();
        this.donors = Storage.getDonors();
    }

    renderScreeningsTable() {
        const tbody = document.getElementById('screeningsTableBody');
        if (!tbody) return;

        let filteredScreenings = [...this.screenings];

        // Apply filters
        const donorFilter = document.getElementById('donorFilterScreening')?.value;
        const resultFilter = document.getElementById('resultFilter')?.value;

        if (donorFilter) {
            filteredScreenings = filteredScreenings.filter(s => s.donorId === donorFilter);
        }

        if (resultFilter) {
            filteredScreenings = filteredScreenings.filter(s => s.result === resultFilter);
        }

        // Sort by date (newest first)
        filteredScreenings.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        if (filteredScreenings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-secondary">
                        Nenhuma triagem encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredScreenings.map(screening => {
            const donor = this.donors.find(d => d.id === screening.donorId);
            const donorName = donor ? donor.name : 'Doador não encontrado';
            const bloodType = donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '';

            return `
                <tr>
                    <td>
                        <div class="font-semibold">${Helpers.formatDate(screening.date)}</div>
                        <div class="text-sm text-secondary">${screening.time}</div>
                    </td>
                    <td class="font-semibold">${donorName}</td>
                    <td>
                        ${bloodType ? `<span class="${Helpers.getBloodTypeClass(donor.bloodType, donor.rhFactor)}">${bloodType}</span>` : ''}
                    </td>
                    <td>
                        <div class="text-sm">
                            <div>PA: ${screening.bloodPressure}</div>
                            <div>Temp: ${screening.temperature}°C</div>
                            <div>Peso: ${screening.weight}kg</div>
                        </div>
                    </td>
                    <td>${Helpers.getStatusBadge(screening.result)}</td>
                    <td>${screening.technician}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm view-screening-btn" data-id="${screening.id}">
                                👁️ Ver
                            </button>
                            <button class="btn btn-sm edit-screening-btn" data-id="${screening.id}">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-sm btn-error delete-screening-btn" data-id="${screening.id}">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showScreeningForm(screeningId = null) {
        const isEdit = screeningId !== null;
        const screening = isEdit ? this.screenings.find(s => s.id === screeningId) : null;

        if (this.donors.length === 0) {
            Helpers.showToast('Nenhum doador cadastrado. Cadastre um doador primeiro.', 'warning');
            return;
        }

        const formHTML = `
            <form id="screeningForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Doador *</label>
                        <select name="donorId" class="form-select" required ${isEdit ? 'disabled' : ''}>
                            <option value="">Selecione um doador</option>
                            ${this.donors.map(donor => `
                                <option value="${donor.id}" ${screening?.donorId === donor.id ? 'selected' : ''}>
                                    ${donor.name} - ${Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Data *</label>
                        <input type="date" name="date" class="form-input" required 
                               value="${screening?.date || Helpers.getCurrentDate()}"
                               max="${Helpers.getCurrentDate()}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Horário *</label>
                        <input type="time" name="time" class="form-input" required 
                               value="${screening?.time || Helpers.getCurrentTime()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Responsável Técnico *</label>
                        <input type="text" name="technician" class="form-input" required 
                               value="${screening?.technician || ''}" placeholder="Nome do responsável">
                    </div>
                </div>

                <!-- Vital Signs -->
                <h4 class="text-lg font-semibold mb-4 mt-6">Sinais Vitais</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Pressão Arterial *</label>
                        <input type="text" name="bloodPressure" class="form-input" required 
                               value="${screening?.bloodPressure || ''}" placeholder="120/80">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Temperatura (°C) *</label>
                        <input type="number" name="temperature" class="form-input" required 
                               value="${screening?.temperature || ''}" step="0.1" min="35" max="42"
                               placeholder="36.5">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Peso (kg) *</label>
                        <input type="number" name="weight" class="form-input" required 
                               value="${screening?.weight || ''}" step="0.1" min="40" max="200"
                               placeholder="70.0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Altura (cm)</label>
                        <input type="number" name="height" class="form-input" 
                               value="${screening?.height || ''}" min="140" max="220"
                               placeholder="170">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Frequência Cardíaca (bpm)</label>
                        <input type="number" name="heartRate" class="form-input" 
                               value="${screening?.heartRate || ''}" min="40" max="200"
                               placeholder="72">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Hemoglobina (g/dL)</label>
                        <input type="number" name="hemoglobin" class="form-input" 
                               value="${screening?.hemoglobin || ''}" step="0.1" min="8" max="20"
                               placeholder="14.5">
                    </div>
                </div>

                <!-- Health Questions -->
                <h4 class="text-lg font-semibold mb-4 mt-6">Questionário de Saúde</h4>
                
                <div class="form-group">
                    <label class="form-label">Medicamentos em uso</label>
                    <textarea name="medications" class="form-textarea" 
                              placeholder="Liste os medicamentos em uso">${screening?.medications || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Doenças ou condições médicas</label>
                    <textarea name="medicalConditions" class="form-textarea" 
                              placeholder="Descreva doenças ou condições médicas">${screening?.medicalConditions || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Última doação</label>
                    <input type="date" name="lastDonation" class="form-input" 
                           value="${screening?.lastDonation || ''}"
                           max="${Helpers.getCurrentDate()}">
                </div>

                <!-- Result -->
                <h4 class="text-lg font-semibold mb-4 mt-6">Resultado da Triagem</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Resultado *</label>
                        <select name="result" class="form-select" required>
                            <option value="">Selecione o resultado</option>
                            <option value="apto" ${screening?.result === 'apto' ? 'selected' : ''}>Apto</option>
                            <option value="inapto" ${screening?.result === 'inapto' ? 'selected' : ''}>Inapto</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea name="observations" class="form-textarea" 
                              placeholder="Observações sobre a triagem">${screening?.observations || ''}</textarea>
                </div>

                <div class="form-group" id="inaptReasonGroup" style="display: ${screening?.result === 'inapto' ? 'block' : 'none'}">
                    <label class="form-label">Motivo da Inaptidão</label>
                    <textarea name="inaptReason" class="form-textarea" 
                              placeholder="Descreva o motivo da inaptidão">${screening?.inaptReason || ''}</textarea>
                </div>
            </form>
        `;

        modal.form(
            isEdit ? 'Editar Triagem' : 'Nova Triagem',
            formHTML,
            (data, form) => {
                if (this.validateScreeningForm(data, form)) {
                    this.saveScreening(data, screeningId);
                    return true;
                }
                return false;
            }
        );

        // Add event listener for result change
        setTimeout(() => {
            const resultSelect = document.querySelector('select[name="result"]');
            const inaptReasonGroup = document.getElementById('inaptReasonGroup');
            
            if (resultSelect && inaptReasonGroup) {
                resultSelect.addEventListener('change', (e) => {
                    inaptReasonGroup.style.display = e.target.value === 'inapto' ? 'block' : 'none';
                });
            }
        }, 100);
    }

    validateScreeningForm(data, form) {
        const errors = [];

        // Validate required fields
        if (!data.donorId) errors.push('Doador é obrigatório');
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.time) errors.push('Horário é obrigatório');
        if (!data.technician?.trim()) errors.push('Responsável técnico é obrigatório');
        if (!data.bloodPressure?.trim()) errors.push('Pressão arterial é obrigatória');
        if (!data.temperature) errors.push('Temperatura é obrigatória');
        if (!data.weight) errors.push('Peso é obrigatório');
        if (!data.result) errors.push('Resultado é obrigatório');

        // Validate vital signs ranges
        if (data.temperature && (data.temperature < 35 || data.temperature > 42)) {
            errors.push('Temperatura deve estar entre 35°C e 42°C');
        }

        if (data.weight && (data.weight < 40 || data.weight > 200)) {
            errors.push('Peso deve estar entre 40kg e 200kg');
        }

        if (data.heartRate && (data.heartRate < 40 || data.heartRate > 200)) {
            errors.push('Frequência cardíaca deve estar entre 40 e 200 bpm');
        }

        if (data.hemoglobin && (data.hemoglobin < 8 || data.hemoglobin > 20)) {
            errors.push('Hemoglobina deve estar entre 8 e 20 g/dL');
        }

        // Validate blood pressure format
        if (data.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(data.bloodPressure)) {
            errors.push('Pressão arterial deve estar no formato 120/80');
        }

        // Require reason if inapt
        if (data.result === 'inapto' && !data.inaptReason?.trim()) {
            errors.push('Motivo da inaptidão é obrigatório quando o resultado é inapto');
        }

        if (errors.length > 0) {
            Helpers.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    saveScreening(data, screeningId = null) {
        const isEdit = screeningId !== null;
        
        if (isEdit) {
            // Update existing screening
            const index = this.screenings.findIndex(s => s.id === screeningId);
            if (index !== -1) {
                this.screenings[index] = { 
                    ...this.screenings[index], 
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                Helpers.showToast('Triagem atualizada com sucesso!', 'success');
            }
        } else {
            // Create new screening
            const newScreening = {
                id: Storage.generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.screenings.push(newScreening);
            Helpers.showToast('Triagem registrada com sucesso!', 'success');
        }

        // Save to storage
        Storage.setScreenings(this.screenings);
        this.renderScreeningsTable();
    }

    viewScreening(screeningId) {
        const screening = this.screenings.find(s => s.id === screeningId);
        if (!screening) return;

        const donor = this.donors.find(d => d.id === screening.donorId);
        const donorName = donor ? donor.name : 'Doador não encontrado';
        const bloodType = donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '';

        const content = `
            <div class="screening-details">
                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Informações do Doador</h4>
                    <p><strong>Nome:</strong> ${donorName}</p>
                    <p><strong>Tipo Sanguíneo:</strong> ${bloodType}</p>
                    <p><strong>Data/Hora:</strong> ${Helpers.formatDate(screening.date)} às ${screening.time}</p>
                    <p><strong>Responsável:</strong> ${screening.technician}</p>
                </div>

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Sinais Vitais</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <p><strong>Pressão Arterial:</strong> ${screening.bloodPressure}</p>
                        <p><strong>Temperatura:</strong> ${screening.temperature}°C</p>
                        <p><strong>Peso:</strong> ${screening.weight}kg</p>
                        ${screening.height ? `<p><strong>Altura:</strong> ${screening.height}cm</p>` : ''}
                        ${screening.heartRate ? `<p><strong>Freq. Cardíaca:</strong> ${screening.heartRate} bpm</p>` : ''}
                        ${screening.hemoglobin ? `<p><strong>Hemoglobina:</strong> ${screening.hemoglobin} g/dL</p>` : ''}
                    </div>
                </div>

                ${screening.medications ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Medicamentos</h4>
                        <p>${screening.medications}</p>
                    </div>
                ` : ''}

                ${screening.medicalConditions ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Condições Médicas</h4>
                        <p>${screening.medicalConditions}</p>
                    </div>
                ` : ''}

                ${screening.lastDonation ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Última Doação</h4>
                        <p>${Helpers.formatDate(screening.lastDonation)}</p>
                    </div>
                ` : ''}

                <div class="mb-4">
                    <h4 class="font-semibold text-lg mb-2">Resultado</h4>
                    <p>${Helpers.getStatusBadge(screening.result)}</p>
                    ${screening.inaptReason ? `<p class="mt-2"><strong>Motivo:</strong> ${screening.inaptReason}</p>` : ''}
                </div>

                ${screening.observations ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-lg mb-2">Observações</h4>
                        <p>${screening.observations}</p>
                    </div>
                ` : ''}
            </div>
        `;

        modal.show('Detalhes da Triagem', content);
    }

    editScreening(screeningId) {
        this.showScreeningForm(screeningId);
    }

    deleteScreening(screeningId) {
        const screening = this.screenings.find(s => s.id === screeningId);
        if (!screening) return;

        const donor = this.donors.find(d => d.id === screening.donorId);
        const donorName = donor ? donor.name : 'Doador não encontrado';

        modal.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a triagem de "${donorName}" realizada em ${Helpers.formatDate(screening.date)}?`,
            () => {
                this.screenings = this.screenings.filter(s => s.id !== screeningId);
                Storage.setScreenings(this.screenings);
                this.renderScreeningsTable();
                Helpers.showToast('Triagem excluída com sucesso!', 'success');
            }
        );
    }

    filterScreenings() {
        this.renderScreeningsTable();
    }

    exportScreenings() {
        if (this.screenings.length === 0) {
            Helpers.showToast('Nenhuma triagem para exportar', 'warning');
            return;
        }

        const exportData = this.screenings.map(screening => {
            const donor = this.donors.find(d => d.id === screening.donorId);
            return {
                Data: Helpers.formatDate(screening.date),
                Horário: screening.time,
                Doador: donor ? donor.name : 'Não encontrado',
                'Tipo Sanguíneo': donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '',
                'Pressão Arterial': screening.bloodPressure,
                'Temperatura': screening.temperature,
                'Peso': screening.weight,
                'Altura': screening.height || '',
                'Freq. Cardíaca': screening.heartRate || '',
                'Hemoglobina': screening.hemoglobin || '',
                'Resultado': screening.result,
                'Motivo Inaptidão': screening.inaptReason || '',
                'Responsável': screening.technician,
                'Observações': screening.observations || ''
            };
        });

        const filename = `triagens_${new Date().toISOString().split('T')[0]}.csv`;
        Helpers.exportToCSV(exportData, filename);
        Helpers.showToast('Dados exportados com sucesso!', 'success');
    }
}

window.Screening = Screening;