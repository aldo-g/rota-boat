import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEyqEfnw7GnhpPtlP1zQXpWjXf44ajFBI",
  authDomain: "rota-boat.firebaseapp.com",
  projectId: "rota-boat",
  storageBucket: "rota-boat.firebasestorage.app",
  messagingSenderId: "569454206381",
  appId: "1:569454206381:web:5165b0ecdaeb3d4fcad524",
  measurementId: "G-XHX36WMQCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore instance as the default export
export default db;
