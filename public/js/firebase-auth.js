// firebase-auth.js
import { app } from './firebase-config.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Inicializa o módulo de autenticação
const auth = getAuth(app);

// Função para criar novo usuário
export async function cadastrarUsuario(email, senha) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao cadastrar:", error.message);
    throw error;
  }
}

// Função para login
export async function loginUsuario(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
    throw error;
  }
}

// Função para logout
export async function logoutUsuario() {
  try {
    await signOut(auth);
    console.log("Logout realizado com sucesso");
  } catch (error) {
    console.error("Erro ao fazer logout:", error.message);
    throw error;
  }
}
