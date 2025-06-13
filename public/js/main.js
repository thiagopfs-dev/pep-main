import { cadastrarUsuario, loginUsuario, logoutUsuario } from './firebase-auth.js';

// Exemplo de uso
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const user = await loginUsuario(email, senha);
    alert(`Bem-vindo, ${user.email}`);
  } catch (error) {
    alert("Falha no login: " + error.message);
  }
});
