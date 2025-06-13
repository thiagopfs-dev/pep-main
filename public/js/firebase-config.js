// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4NTD90ys9bdPhU0RyL7t_qqOtmFqLYEM",
  authDomain: "pep-main.firebaseapp.com",
  projectId: "pep-main",
  storageBucket: "pep-main.firebasestorage.app",
  messagingSenderId: "27467041325",
  appId: "1:27467041325:web:b5b8b4b5113de11e1b06a4"
};

// Inicializa e exporta o app Firebase
export const app = initializeApp(firebaseConfig);
