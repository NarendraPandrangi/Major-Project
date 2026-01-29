import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcXVkkN62tTlmQJCYQVeRfjPb2jltd8eQ",
    authDomain: "major-5d82e.firebaseapp.com",
    projectId: "major-5d82e",
    storageBucket: "major-5d82e.firebasestorage.app",
    messagingSenderId: "81722562563",
    appId: "1:81722562563:web:be4c71d32071480e539636",
    measurementId: "G-5FYZSHN843"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export {
    auth,
    analytics,
    googleProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile
};

export default app;
