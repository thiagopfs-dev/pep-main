import React, { useState } from 'react';
import './Login.css'; // Nosso CSS super aprimorado

// Um componente simples para ícones (poderia ser mais elaborado com SVGs ou Font Awesome)
const Icon = ({ children }) => <span className="input-icon">{children}</span>;

// A prop onLoginSuccess já está sendo recebida corretamente aqui
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Tentativa de login com:');
    console.log('Usuário:', username);
    console.log('Senha:', password);

    // Passo 5: Modificação principal acontece aqui
    // Aqui, você faria a validação real do usuário e senha no futuro.
    // Por enquanto, vamos simular que qualquer coisa é válida se os campos estiverem preenchidos.
    if (username.trim() && password.trim()) { // Verifica se os campos não estão vazios (trim remove espaços em branco)
      console.log('Login simulado bem-sucedido para:', username);
      onLoginSuccess(username); // Chama a função onLoginSuccess passada pelo App.js, enviando o nome de usuário
    } else {
      alert('Por favor, preencha os campos de usuário e senha.');
    }
    // Não é mais necessário limpar os campos (setUsername, setPassword) ou dar o alert de boas-vindas aqui,
    // pois a navegação para a próxima tela cuidará da "saída" deste componente.
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container-card">
        <div className="login-header">
          <div className="erp-logo">
            PEP<span className="erp-logo-plus">+</span>
          </div>
          <p className="erp-subtitle">Sistemas de Saúde</p>
          {/* <p className="welcome-message">Bem-vindo(a) de volta!</p> */}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Acesso Seguro</h2>
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <div className="input-wrapper">
              <Icon>👤</Icon> {/* Ícone de usuário (Unicode) */}
              <input
                type="text"
                id="username"
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <Icon>🔒</Icon> {/* Ícone de cadeado (Unicode) */}
              <input
                type="password"
                id="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              Lembrar-me
            </label>
            <a href="#forgot-password" className="forgot-password-link">Esqueceu a senha?</a>
          </div>

          <button type="submit" className="login-button">
            Entrar no Sistema
          </button>
        </form>
        <div className="login-footer-text">
          © {new Date().getFullYear()} PEP+ Sistemas de Saúde. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}

export default Login;