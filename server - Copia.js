// Importa os módulos necessários: express para o servidor e path para lidar com caminhos de arquivos.
const express = require('express');
const path = require('path');

// Cria uma instância do aplicativo Express.
const app = express();
// Define a porta em que o servidor irá rodar.
const PORT = 3000;

// Middleware para permitir que o servidor entenda JSON no corpo das requisições.
app.use(express.json());
// Middleware para permitir que o servidor entenda dados de formulários (URL-encoded).
app.use(express.urlencoded({ extended: true }));

// Configura o servidor para servir arquivos estáticos (como HTML, CSS, imagens) a partir da pasta 'public'.
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS DA APLICAÇÃO ---

// Rota principal para a "Central de Cadastros"
// Envia o arquivo cadastro-hub.html quando o usuário acessa /cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-hub.html'));
});

// Rota para o formulário de CADASTRO DE USUÁRIO
app.get('/cadastro/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-usuario.html'));
});

// Rotas para as outras seções (temporariamente levam para uma página genérica)
app.get('/cadastro/paciente', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-paciente.html'));
});
app.get('/cadastro/plano', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-plano.html'));
});
app.get('/cadastro/fornecedor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro-fornecedor.html'));
});


// Rota que RECEBE os dados (via método POST) do formulário de cadastro de USUÁRIO
app.post('/registrar', (req, res) => {
    // Pega os dados enviados no corpo da requisição.
    const dadosDoFormulario = req.body;
    
    // Imprime os dados recebidos no console do servidor para depuração.
    console.log('--- DADOS DE CADASTRO DE USUÁRIO RECEBIDOS ---');
    console.log(dadosDoFormulario);
    console.log('-------------------------------------------');

    // Envia uma resposta de sucesso para o navegador do usuário.
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Cadastro de Usuário recebido com sucesso!</h1>
            <p>Os dados foram impressos no terminal do seu servidor Node.js.</p>
            <a href="/cadastro" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #0077b6; color: white; text-decoration: none; border-radius: 5px;">Voltar para a Central de Cadastros</a>
        </div>
    `);
});

// Inicia o servidor e o faz "escutar" por requisições na porta definida.
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso!`);
    console.log(`👉 Acesse em seu navegador: http://localhost:${PORT}/cadastro`); // Adicionado /cadastro para ir direto à página principal
});