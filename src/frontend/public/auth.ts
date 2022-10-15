'use strict';
// @ts-ignore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
// @ts-ignore
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { AuthState } from "./SharedTypes";

const discordBtn = document.querySelector<HTMLButtonElement>("#discordBtn");
const body = document.querySelector<HTMLDivElement>("#start");

discordBtn?.addEventListener("click", () => {
    // @ts-ignore - Defined in index.html
    redirectLogin();
});

const firebaseConfig = {
    apiKey: "AIzaSyDoSUHACvuXdv5h7NAXcW3DB-tL4kpIElI",
    authDomain: "crepemoe.firebaseapp.com",
    projectId: "crepemoe",
    storageBucket: "crepemoe.appspot.com",
    messagingSenderId: "894429155894",
    appId: "1:894429155894:web:750822821515130abdbe97",
    measurementId: "G-PF95GTBX0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.onAuthStateChanged((u: AuthState) => {
    if (u) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        
        const p = document.createElement("p");
        p.id = "emailLabel";
        p.innerText = `Signed in as ${u.displayName ?? u.email}. `;
        const a = document.createElement("a");
        a.href = "#";
        a.innerText = "Sign out";
        a.classList.add(`normalLink`);
        a.addEventListener("click", () => {
            signOut(auth);
        });

        p.innerHTML += "<br><br>";
        p.appendChild(a);
        body?.appendChild(p);
    } else {
        if (discordBtn) discordBtn.style.display = "block";
        const emailLabel = document.querySelector<HTMLParagraphElement>("#emailLabel");
        if (emailLabel) emailLabel.remove();
    }
});