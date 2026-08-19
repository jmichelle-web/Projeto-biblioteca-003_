// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// ==========================================
// CONFIGURAÇÃO DO SEU PROJETO FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJETO.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};


// ==========================================
// INICIALIZAÇÃO
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Firebase conectado com sucesso!");


// ==========================================
// REFERÊNCIAS DAS COLEÇÕES
// ==========================================

const alunosRef = collection(db, "alunos");
const livrosRef = collection(db, "livros");
const emprestimosRef = collection(db, "emprestimos");
