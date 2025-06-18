// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGn_8iumyisftfCBbwCpXN3IcUxgtriTA",
  authDomain: "bromaia.firebaseapp.com",
  projectId: "bromaia",
  storageBucket: "bromaia.firebasestorage.app",
  messagingSenderId: "801749216357",
  appId: "1:801749216357:web:494ef682438c7992c7ea8c",
};

// ✅ Evita inicialización múltiple (importante en desarrollo)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
