// ========================================
// CONFIGURAÇÃO DO FIREBASE
// ========================================

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ========================================
// DADOS DO SEU PROJETO FIREBASE
// ========================================

const firebaseConfig = {

    apiKey: "AIzaSyBzuByF7V5-t5mBAzURE5UhwpALAYTIkjw",
  authDomain: "bibliotecsa.firebaseapp.com",
  databaseURL: "https://bibliotecsa-default-rtdb.firebaseio.com",
  projectId: "bibliotecsa",
  storageBucket: "bibliotecsa.firebasestorage.app",
  messagingSenderId: "4923849267",
  appId: "1:4923849267:web:a79a74977b8cfbfc420146",
  measurementId: "G-K0FFKFFEVY"

};


// ========================================
// INICIALIZAR FIREBASE
// ========================================

const app =
    initializeApp(
        firebaseConfig
    );


// ========================================
// FIRESTORE
// ========================================

const db =
    getFirestore(app);


// ========================================
// EXPORTAR BANCO DE DADOS
// ========================================

export {
    db
};
