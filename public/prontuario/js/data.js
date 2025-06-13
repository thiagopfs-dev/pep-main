// Mock data for the PEP System
const mockData = {
    patient: {
        id: 'P001',
        name: 'Maria Silva Santos',
        age: 45,
        gender: 'Feminino',
        phone: '(11) 98765-4321',
        email: 'maria.santos@email.com',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        bloodType: 'O+',
        allergies: ['Penicilina', 'Frutos do mar'],
        emergencyContact: {
            name: 'João Santos',
            phone: '(11) 99876-5432',
            relationship: 'Cônjuge'
        }
    },

    medicalHistory: [
        {
            id: 'MH001',
            date: '2024-01-15',
            type: 'Consulta Cardiológica',
            description: 'Hipertensão arterial controlada. Paciente apresenta pressão arterial dentro dos parâmetros normais.',
            doctor: 'Dr. Carlos Oliveira',
            status: 'ongoing'
        },
        {
            id: 'MH002',
            date: '2024-01-10',
            type: 'Exame Laboratorial',
            description: 'Hemograma completo e perfil lipídico realizados. Resultados dentro da normalidade.',
            doctor: 'Dra. Ana Costa',
            status: 'resolved'
        },
        {
            id: 'MH003',
            date: '2023-12-20',
            type: 'Consulta Endocrinológica',
            description: 'Diabetes tipo 2 diagnosticada. Iniciado tratamento com metformina.',
            doctor: 'Dr. Roberto Lima',
            status: 'ongoing'
        }
    ],

    prescriptions: [
        {
            id: 'RX001',
            medication: 'Losartana 50mg',
            dosage: '1 comprimido',
            frequency: '1x ao dia',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            prescribedBy: 'Dr. Carlos Oliveira',
            status: 'active'
        },
        {
            id: 'RX002',
            medication: 'Metformina 850mg',
            dosage: '1 comprimido',
            frequency: '2x ao dia',
            startDate: '2023-12-20',
            endDate: '2024-06-20',
            prescribedBy: 'Dr. Roberto Lima',
            status: 'active'
        },
        {
            id: 'RX003',
            medication: 'Ácido Acetilsalicílico 100mg',
            dosage: '1 comprimido',
            frequency: '1x ao dia',
            startDate: '2024-01-15',
            endDate: '2024-07-15',
            prescribedBy: 'Dr. Carlos Oliveira',
            status: 'active'
        }
    ],

    labResults: [
        {
            id: 'LAB001',
            test: 'Glicemia em jejum',
            result: '95 mg/dL',
            reference: '70-100 mg/dL',
            date: '2024-01-10',
            status: 'normal'
        },
        {
            id: 'LAB002',
            test: 'Colesterol Total',
            result: '180 mg/dL',
            reference: '<200 mg/dL',
            date: '2024-01-10',
            status: 'normal'
        },
        {
            id: 'LAB003',
            test: 'Hemoglobina A1c',
            result: '6.8%',
            reference: '<7.0%',
            date: '2024-01-10',
            status: 'normal'
        },
        {
            id: 'LAB004',
            test: 'Creatinina',
            result: '1.2 mg/dL',
            reference: '0.6-1.2 mg/dL',
            date: '2024-01-10',
            status: 'normal'
        }
    ]
};

// Menu items configuration
const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: 'user' },
    { id: 'history', label: 'Histórico Médico', icon: 'heart' },
    { id: 'prescriptions', label: 'Prescrições', icon: 'pill' },
    { id: 'labs', label: 'Exames', icon: 'activity' },
    { id: 'appointments', label: 'Consultas', icon: 'calendar' },
    { id: 'documents', label: 'Documentos', icon: 'file-text' }
];