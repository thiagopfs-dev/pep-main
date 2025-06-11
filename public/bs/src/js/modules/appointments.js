/**
 * Appointments module
 */

class Appointments {
    constructor() {
        this.appointments = [];
        this.donors = [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.bindEvents();
        this.loadData();
    }

    render() {
        return `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold">Agendamento de Doações</h1>
                    <button class="btn btn-primary" id="addAppointmentBtn">
                        ➕ Novo Agendamento
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Calendar -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Calendário de Agendamentos</h3>
                        </div>
                        <div class="card-body">
                            <div class="calendar" id="appointmentCalendar"></div>
                        </div>
                    </div>

                    <!-- Appointments List -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Agendamentos</h3>
                            <div class="flex gap-2">
                                <select class="form-select" id="statusFilter">
                                    <option value="">Todos os status</option>
                                    <option value="confirmado">Confirmado</option>
                                    <option value="pendente">Pendente</option>
                                    <option value="concluido">Concluído</option>
                                    <option value="ausente">Ausente</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="appointmentsList"></div>
                        </div>
                    </div>
                </div>

                <!-- Today's Appointments -->
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">Agendamentos de Hoje</h3>
                    </div>
                    <div class="card-body">
                        <div id="todayAppointments"></div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addAppointmentBtn') {
                this.showAppointmentForm();
            } else if (e.target.classList.contains('edit-appointment-btn')) {
                this.editAppointment(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-appointment-btn')) {
                this.deleteAppointment(e.target.dataset.id);
            } else if (e.target.classList.contains('complete-appointment-btn')) {
                this.completeAppointment(e.target.dataset.id);
            } else if (e.target.classList.contains('calendar-nav')) {
                this.navigateCalendar(e.target.dataset.direction);
            } else if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('other-month')) {
                this.selectDate(e.target.dataset.date);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'statusFilter') {
                this.filterAppointments(e.target.value);
            }
        });
    }

    init() {
        this.renderCalendar();
        this.renderAppointmentsList();
        this.renderTodayAppointments();
    }

    loadData() {
        this.appointments = Storage.getAppointments();
        this.donors = Storage.getDonors();
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('appointmentCalendar');
        if (!calendarContainer) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav" data-direction="prev">‹</button>
                <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
                <button class="calendar-nav" data-direction="next">›</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Dom</div>
                <div class="calendar-day-header">Seg</div>
                <div class="calendar-day-header">Ter</div>
                <div class="calendar-day-header">Qua</div>
                <div class="calendar-day-header">Qui</div>
                <div class="calendar-day-header">Sex</div>
                <div class="calendar-day-header">Sáb</div>
                ${this.generateCalendarDays(startDate, lastDay)}
            </div>
        `;
    }

    generateCalendarDays(startDate, lastDay) {
        const days = [];
        const today = new Date();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dateStr = date.toISOString().split('T')[0];
            const dayAppointments = this.appointments.filter(apt => apt.date === dateStr);
            
            let classes = ['calendar-day'];
            
            if (date.getMonth() !== currentMonth) {
                classes.push('other-month');
            }
            
            if (date.toDateString() === today.toDateString()) {
                classes.push('today');
            }
            
            if (this.selectedDate === dateStr) {
                classes.push('selected');
            }
            
            if (dayAppointments.length > 0) {
                classes.push('has-appointments');
            }

            days.push(`
                <div class="${classes.join(' ')}" data-date="${dateStr}">
                    ${date.getDate()}
                    ${dayAppointments.length > 0 ? `<small>${dayAppointments.length}</small>` : ''}
                </div>
            `);
        }

        return days.join('');
    }

    navigateCalendar(direction) {
        if (direction === 'prev') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        this.renderCalendar();
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.renderCalendar();
        this.renderAppointmentsList();
    }

    renderAppointmentsList() {
        const container = document.getElementById('appointmentsList');
        if (!container) return;

        let appointments = [...this.appointments];
        
        // Filter by selected date
        if (this.selectedDate) {
            appointments = appointments.filter(apt => apt.date === this.selectedDate);
        }

        // Filter by status
        const statusFilter = document.getElementById('statusFilter')?.value;
        if (statusFilter) {
            appointments = appointments.filter(apt => apt.status === statusFilter);
        }

        // Sort by date and time
        appointments.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum agendamento encontrado</p>
                    ${this.selectedDate ? `<p class="text-sm">para ${Helpers.formatDate(this.selectedDate)}</p>` : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(appointment => {
            const donor = this.donors.find(d => d.id === appointment.donorId);
            const donorName = donor ? donor.name : 'Doador não encontrado';
            const bloodType = donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '';
            
            return `
                <div class="appointment-item border-b border-gray-200 last:border-b-0 p-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h4 class="font-semibold">${donorName}</h4>
                                ${bloodType ? `<span class="${Helpers.getBloodTypeClass(donor.bloodType, donor.rhFactor)}">${bloodType}</span>` : ''}
                            </div>
                            <div class="text-sm text-secondary mb-1">
                                📅 ${Helpers.formatDate(appointment.date)} às ${appointment.time}
                            </div>
                            ${appointment.notes ? `<div class="text-sm text-secondary">📝 ${appointment.notes}</div>` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            ${Helpers.getStatusBadge(appointment.status)}
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button class="btn btn-sm edit-appointment-btn" data-id="${appointment.id}">
                            ✏️ Editar
                        </button>
                        ${appointment.status === 'confirmado' ? `
                            <button class="btn btn-sm btn-success complete-appointment-btn" data-id="${appointment.id}">
                                ✅ Concluir
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-error delete-appointment-btn" data-id="${appointment.id}">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTodayAppointments() {
        const container = document.getElementById('todayAppointments');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments
            .filter(apt => apt.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));

        if (todayAppointments.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum agendamento para hoje</div>';
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${todayAppointments.map(appointment => {
                    const donor = this.donors.find(d => d.id === appointment.donorId);
                    const donorName = donor ? donor.name : 'Doador não encontrado';
                    const bloodType = donor ? Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor) : '';
                    
                    return `
                        <div class="appointment-card border border-gray-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-semibold">${donorName}</h4>
                                ${Helpers.getStatusBadge(appointment.status)}
                            </div>
                            <div class="text-sm text-secondary mb-2">
                                🕐 ${appointment.time}
                            </div>
                            ${bloodType ? `
                                <div class="mb-2">
                                    <span class="${Helpers.getBloodTypeClass(donor.bloodType, donor.rhFactor)}">${bloodType}</span>
                                </div>
                            ` : ''}
                            ${appointment.notes ? `<div class="text-sm text-secondary">📝 ${appointment.notes}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showAppointmentForm(appointmentId = null) {
        const isEdit = appointmentId !== null;
        const appointment = isEdit ? this.appointments.find(a => a.id === appointmentId) : null;

        if (this.donors.length === 0) {
            Helpers.showToast('Nenhum doador cadastrado. Cadastre um doador primeiro.', 'warning');
            return;
        }

        const formHTML = `
            <form id="appointmentForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Doador *</label>
                        <select name="donorId" class="form-select" required>
                            <option value="">Selecione um doador</option>
                            ${this.donors.map(donor => `
                                <option value="${donor.id}" ${appointment?.donorId === donor.id ? 'selected' : ''}>
                                    ${donor.name} - ${Helpers.getBloodTypeDisplay(donor.bloodType, donor.rhFactor)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data *</label>
                        <input type="date" name="date" class="form-input" required 
                               value="${appointment?.date || this.selectedDate || Helpers.getCurrentDate()}"
                               min="${Helpers.getCurrentDate()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Horário *</label>
                        <select name="time" class="form-select" required>
                            <option value="">Selecione o horário</option>
                            ${this.generateTimeSlots().map(time => `
                                <option value="${time}" ${appointment?.time === time ? 'selected' : ''}>
                                    ${time}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-select">
                        <option value="pendente" ${appointment?.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmado" ${appointment?.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="concluido" ${appointment?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        <option value="ausente" ${appointment?.status === 'ausente' ? 'selected' : ''}>Ausente</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Observações</label>
                    <textarea name="notes" class="form-textarea" 
                              placeholder="Observações sobre o agendamento">${appointment?.notes || ''}</textarea>
                </div>
            </form>
        `;

        modal.form(
            isEdit ? 'Editar Agendamento' : 'Novo Agendamento',
            formHTML,
            (data, form) => {
                if (this.validateAppointmentForm(data, form, appointmentId)) {
                    this.saveAppointment(data, appointmentId);
                    return true;
                }
                return false;
            }
        );
    }

    generateTimeSlots() {
        const slots = [];
        for (let hour = 7; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeStr);
            }
        }
        return slots;
    }

    validateAppointmentForm(data, form, appointmentId = null) {
        const errors = [];

        // Validate required fields
        if (!data.donorId) errors.push('Doador é obrigatório');
        if (!data.date) errors.push('Data é obrigatória');
        if (!data.time) errors.push('Horário é obrigatório');

        // Check if date is not in the past
        if (data.date && data.date < Helpers.getCurrentDate()) {
            errors.push('Data não pode ser no passado');
        }

        // Check for conflicting appointments
        const conflictingAppointment = this.appointments.find(apt => 
            apt.date === data.date && 
            apt.time === data.time && 
            apt.id !== appointmentId
        );
        
        if (conflictingAppointment) {
            errors.push('Já existe um agendamento neste horário');
        }

        // Check if donor has an appointment on the same day
        const donorAppointment = this.appointments.find(apt => 
            apt.date === data.date && 
            apt.donorId === data.donorId && 
            apt.id !== appointmentId
        );
        
        if (donorAppointment) {
            errors.push('Este doador já tem um agendamento nesta data');
        }

        if (errors.length > 0) {
            Helpers.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    saveAppointment(data, appointmentId = null) {
        const isEdit = appointmentId !== null;
        
        if (isEdit) {
            // Update existing appointment
            const index = this.appointments.findIndex(a => a.id === appointmentId);
            if (index !== -1) {
                this.appointments[index] = { 
                    ...this.appointments[index], 
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                Helpers.showToast('Agendamento atualizado com sucesso!', 'success');
            }
        } else {
            // Create new appointment
            const newAppointment = {
                id: Storage.generateId(),
                ...data,
                status: data.status || 'pendente',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.appointments.push(newAppointment);
            Helpers.showToast('Agendamento criado com sucesso!', 'success');
        }

        // Save to storage
        Storage.setAppointments(this.appointments);
        this.renderCalendar();
        this.renderAppointmentsList();
        this.renderTodayAppointments();
    }

    editAppointment(appointmentId) {
        this.showAppointmentForm(appointmentId);
    }

    deleteAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        const donor = this.donors.find(d => d.id === appointment.donorId);
        const donorName = donor ? donor.name : 'Doador não encontrado';

        modal.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o agendamento de "${donorName}" em ${Helpers.formatDate(appointment.date)}?`,
            () => {
                this.appointments = this.appointments.filter(a => a.id !== appointmentId);
                Storage.setAppointments(this.appointments);
                this.renderCalendar();
                this.renderAppointmentsList();
                this.renderTodayAppointments();
                Helpers.showToast('Agendamento excluído com sucesso!', 'success');
            }
        );
    }

    completeAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        // Update status to completed
        appointment.status = 'concluido';
        appointment.completedAt = new Date().toISOString();
        
        Storage.setAppointments(this.appointments);
        this.renderAppointmentsList();
        this.renderTodayAppointments();
        
        Helpers.showToast('Agendamento marcado como concluído!', 'success');
    }

    filterAppointments(status) {
        this.renderAppointmentsList();
    }
}

window.Appointments = Appointments;