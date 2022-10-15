// @ts-check
// @ts-ignore
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';
// @ts-ignore
import { getAuth, signInWithCustomToken, OAuthProvider, linkWithCredential, signInWithCredential } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js';

const firebaseConfig = JSON.parse(`{{FIREBASE_CONFIG}}`); // Valid JSON

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

auth.onAuthStateChanged(async u => {
    if (u) {
        // User is signed in
        // TODO: Link anonymous account with Discord account
        // I give UP on this my braincells are DEAD

        signInWithCustomToken(auth, "{{TOKEN}}").then(() => {
            next();
        });
    } else {
        // User is signed out
        // Sign in with custom token

        signInWithCustomToken(auth, "{{TOKEN}}").then(() => {
            next();
        });
    }
});

function next() {
    window.location.href = "/auth";
}

function XHR(path, params) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${window.location.origin}/${path}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(JSON.stringify(params));
    });
}