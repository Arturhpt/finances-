// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ADICIONE SEUS DADOS DO FIREBASE AQUI
// O aplicativo exibirá um alerta visual se esses valores padrão não forem alterados.
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Verifica se as credenciais padrão do Firebase foram alteradas
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== "SUA_API_KEY" && 
         firebaseConfig.projectId !== "SEU_PROJECT_ID";
};

let app;
let auth;
let db;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar o Firebase:", error);
  }
} else {
  console.warn(
    "Firebase não configurado. Por favor, adicione suas credenciais no arquivo js/firebase-config.js."
  );
}

export { auth, db };
