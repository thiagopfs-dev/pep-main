<<<<<<< HEAD
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para entender dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura o servidor para usar a pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ATUALIZADAS ---

// Rota principal para a "Central de Cadastros"
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-hub.html'));
});

// Rota para o formulário de CADASTRO DE USUÁRIO (o que já tínhamos)
app.get('/cadastro/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-usuario.html'));
});

// Rotas para as outras seções (todas levam para a página provisória)
app.get('/cadastro/paciente', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});
app.get('/cadastro/plano', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});
app.get('/cadastro/fornecedor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});


// Rota para RECEBER os dados do formulário de cadastro de USUÁRIO (sem alteração)
app.post('/registrar', (req, res) => {
    const dadosDoFormulario = req.body;
    console.log('--- DADOS DE CADASTRO DE USUÁRIO RECEBIDOS ---');
    console.log(dadosDoFormulario);
    console.log('-------------------------------------------');

    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Cadastro de Usuário recebido com sucesso!</h1>
            <p>Os dados foram impressos no terminal do seu servidor Node.js.</p>
            <a href="/cadastro" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0077b6; color: white; text-decoration: none; border-radius: 5px;">Voltar para a Central de Cadastros</a>
        </div>
    `);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso!`);
    console.log(`👉 Acesse em seu navegador: http://localhost:${PORT}`);
=======
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para entender dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura o servidor para usar a pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS ATUALIZADAS ---

// Rota principal para a "Central de Cadastros"
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-hub.html'));
});

// Rota para o formulário de CADASTRO DE USUÁRIO (o que já tínhamos)
app.get('/cadastro/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-usuario.html'));
});

// Rotas para as outras seções (todas levam para a página provisória)
app.get('/cadastro/paciente', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});
app.get('/cadastro/plano', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});
app.get('/cadastro/fornecedor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
});


// Rota para RECEBER os dados do formulário de cadastro de USUÁRIO (sem alteração)
app.post('/registrar', (req, res) => {
    const dadosDoFormulario = req.body;
    console.log('--- DADOS DE CADASTRO DE USUÁRIO RECEBIDOS ---');
    console.log(dadosDoFormulario);
    console.log('-------------------------------------------');

    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Cadastro de Usuário recebido com sucesso!</h1>
            <p>Os dados foram impressos no terminal do seu servidor Node.js.</p>
            <a href="/cadastro" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0077b6; color: white; text-decoration: none; border-radius: 5px;">Voltar para a Central de Cadastros</a>
        </div>
    `);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso!`);
    console.log(`👉 Acesse em seu navegador: http://localhost:${PORT}`);
>>>>>>> 113808c67fcbc121d0369b8098fe550b8c45199e
});