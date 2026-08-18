// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


// ==========================================
// CONFIGURAÇÃO DO SEU FIREBASE
// ==========================================

const firebaseConfig = {

    apiKey: "COLE_SUA_API_KEY_AQUI",

    authDomain: "SEU-PROJETO.firebaseapp.com",

    projectId: "SEU-PROJETO",

    storageBucket: "SEU-PROJETO.firebasestorage.app",

    messagingSenderId: "SEU_MESSAGING_SENDER_ID",

    appId: "SEU_APP_ID"

};


// ==========================================
// INICIALIZAÇÃO
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// FIRESTORE
// ==========================================

const db = getFirestore(app);


// Exporta para o script.js

export { db };
