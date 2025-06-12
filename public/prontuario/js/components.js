// Component rendering functions
class PEPComponents {
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    static getStatusClass(status, type = 'default') {
        const statusClasses = {
            default: {
                active: 'bg-red-100 text-red-700',
                ongoing: 'bg-orange-100 text-orange-700',
                resolved: 'bg-green-100 text-green-700',
                normal: 'bg-green-100 text-green-800',
                abnormal: 'bg-yellow-100 text-yellow-800',
                critical: 'bg-red-100 text-red-800',
                completed: 'bg-blue-100 text-blue-700',
                discontinued: 'bg-gray-100 text-gray-700'
            }
        };
        return statusClasses[type][status] || 'bg-gray-100 text-gray-700';
    }

    static getStatusText(status) {
        const statusTexts = {
            active: 'Ativo',
            ongoing: 'Em andamento',
            resolved: 'Resolvido',
            normal: 'Normal',
            abnormal: 'Alterado',
            critical: 'Crítico',
            completed: 'Concluído',
            discontinued: 'Descontinuado'
        };
        return statusTexts[status] || status;
    }

    static renderOverview() {
        const { patient, prescriptions, labResults, medicalHistory } = mockData;
        const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
        const normalLabs = labResults.filter(l => l.status === 'normal').length;
        const ongoingConditions = medicalHistory.filter(h => h.status === 'ongoing').length;

        return `
            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-start space-x-6">
                        <div class="w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                            ${patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">${patient.name}</h2>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">Idade:</span>
                                    <p class="font-medium">${patient.age} anos</p>
                                </div>
                                <div>
                                    <span class="text-gray-500">Gênero:</span>
                                    <p class="font-medium">${patient.gender}</p>
                                </div>
                                <div>
                                    <span class="text-gray-500">Tipo Sanguíneo:</span>
                                    <p class="font-medium">${patient.bloodType}</p>
                                </div>
                                <div>
                                    <span class="text-gray-500">ID Paciente:</span>
                                    <p class="font-medium">${patient.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="phone" class="w-5 h-5 mr-2 text-sky-600"></i>
                            Informações de Contato
                        </h3>
                        <div class="space-y-3">
                            <div class="flex items-center text-sm">
                                <i data-lucide="phone" class="w-4 h-4 mr-3 text-gray-400"></i>
                                <span>${patient.phone}</span>
                            </div>
                            <div class="flex items-center text-sm">
                                <i data-lucide="mail" class="w-4 h-4 mr-3 text-gray-400"></i>
                                <span>${patient.email}</span>
                            </div>
                            <div class="flex items-start text-sm">
                                <i data-lucide="map-pin" class="w-4 h-4 mr-3 text-gray-400 mt-0.5"></i>
                                <span>${patient.address}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="alert-circle" class="w-5 h-5 mr-2 text-red-500"></i>
                            Alergias e Contato de Emergência
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <span class="text-sm text-gray-500">Alergias:</span>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    ${patient.allergies.map(allergy => 
                                        `<span class="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">${allergy}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div>
                                <span class="text-sm text-gray-500">Contato de Emergência:</span>
                                <p class="text-sm font-medium">${patient.emergencyContact.name} (${patient.emergencyContact.relationship})</p>
                                <p class="text-sm text-gray-600">${patient.emergencyContact.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumo Recente</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="text-center p-4 bg-sky-50 rounded-lg border border-sky-100">
                            <div class="text-2xl font-bold text-sky-600">${activePrescriptions}</div>
                            <div class="text-sm text-gray-600">Medicamentos Ativos</div>
                        </div>
                        <div class="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                            <div class="text-2xl font-bold text-green-600">${normalLabs}</div>
                            <div class="text-sm text-gray-600">Exames Normais</div>
                        </div>
                        <div class="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <div class="text-2xl font-bold text-orange-600">${ongoingConditions}</div>
                            <div class="text-sm text-gray-600">Condições Ativas</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderHistory() {
        const { medicalHistory } = mockData;
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Histórico Médico</h2>
                    <button class="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Novo Registro</span>
                    </button>
                </div>

                <div class="space-y-4">
                    ${medicalHistory.map(record => `
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-3 h-3 rounded-full ${
                                        record.status === 'active' ? 'bg-red-500' :
                                        record.status === 'ongoing' ? 'bg-orange-500' : 'bg-green-500'
                                    }"></div>
                                    <h3 class="text-lg font-semibold text-gray-900">${record.type}</h3>
                                </div>
                                <div class="text-sm text-gray-500">${this.formatDate(record.date)}</div>
                            </div>
                            <p class="text-gray-700 mb-3">${record.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">${record.doctor}</span>
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(record.status)}">
                                    ${this.getStatusText(record.status)}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static renderPrescriptions() {
        const { prescriptions } = mockData;
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Prescrições Médicas</h2>
                    <button class="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Nova Prescrição</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${prescriptions.map(prescription => `
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">${prescription.medication}</h3>
                                    <p class="text-gray-600">${prescription.dosage} - ${prescription.frequency}</p>
                                </div>
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(prescription.status)}">
                                    ${this.getStatusText(prescription.status)}
                                </span>
                            </div>
                            <div class="space-y-2 text-sm text-gray-600">
                                <div class="flex justify-between">
                                    <span>Início:</span>
                                    <span>${this.formatDate(prescription.startDate)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Término:</span>
                                    <span>${this.formatDate(prescription.endDate)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Prescrito por:</span>
                                    <span>${prescription.prescribedBy}</span>
                                </div>
                            </div>
                            <div class="flex space-x-2 mt-4">
                                <button class="flex items-center space-x-1 text-sky-600 hover:text-sky-700 text-sm">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    <span>Editar</span>
                                </button>
                                <button class="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm">
                                    <i data-lucide="download" class="w-4 h-4"></i>
                                    <span>Baixar</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static renderLabs() {
        const { labResults } = mockData;
        
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Resultados de Exames</h2>
                    <button class="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Novo Exame</span>
                    </button>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exame</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referência</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${labResults.map(result => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${result.test}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            ${result.result}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${result.reference}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${this.formatDate(result.date)}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getStatusClass(result.status)}">
                                                ${this.getStatusText(result.status)}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button class="text-sky-600 hover:text-sky-900 mr-3">
                                                <i data-lucide="eye" class="w-4 h-4"></i>
                                            </button>
                                            <button class="text-gray-600 hover:text-gray-900">
                                                <i data-lucide="download" class="w-4 h-4"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    static renderPlaceholder(title) {
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">${title}</h2>
                <p class="text-gray-600">Seção em desenvolvimento...</p>
            </div>
        `;
    }
}