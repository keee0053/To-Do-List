import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuMEWFCmMVkAV7OjiL_6mHreTit3CrG3g",
    authDomain: "todolist-project-24fb4.firebaseapp.com",
    projectId: "todolist-project-24fb4",
    storageBucket: "todolist-project-24fb4.firebasestorage.app",
    messagingSenderId: "951509501259",
    appId: "1:951509501259:web:857f3e4df32408f0b614ce"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");

onAuthStateChanged(auth, function (user) {
    if (user) {
        location.href = "index.html";
    }
});

function hasValidInput() {
    return emailInput.reportValidity() && passwordInput.reportValidity();
}

loginButton.addEventListener("click", async function () {
    if (!hasValidInput()) {
        return;
    }

    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
});

signupButton.addEventListener("click", async function () {
    if (!hasValidInput()) {
        return;
    }

    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
});
