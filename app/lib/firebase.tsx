// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGn_8iumyisftfCBbwCpXN3IcUxgtriTA",
  authDomain: "bromaia.firebaseapp.com",
  projectId: "bromaia",
  storageBucket: "bromaia.firebasestorage.app",
  messagingSenderId: "801749216357",
  appId: "1:801749216357:web:494ef682438c7992c7ea8c",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
