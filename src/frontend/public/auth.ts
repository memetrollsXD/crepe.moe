// @ts-ignore
import _jwtDecode from "./jwt-decode";
// @ts-ignore
const jwtDecode = _jwtDecode as (token: string) => { uid: string, displayName: string };

const discordBtn = document.querySelector<HTMLButtonElement>("#discordBtn");
const body = document.querySelector<HTMLDivElement>("#start");

discordBtn?.addEventListener("click", () => {
    // @ts-ignore - Defined in index.html
    redirectLogin();
});

function getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function delCookie(name: string) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const cookie = getCookie("_CMOEAUTHTOKEN");
let token;
if (cookie) token = jwtDecode(cookie);

if (token) {
    // User is signed in

    const p = document.createElement("p");
    p.id = "emailLabel";
    p.innerText = `Signed in as ${token.displayName ?? token.uid}. `;
    const a = document.createElement("a");
    a.href = "#";
    a.innerText = "Sign out";
    a.classList.add(`normalLink`);
    a.addEventListener("click", () => {
        delCookie("_CMOEAUTHTOKEN");
        window.location.reload();
    });

    p.innerHTML += "<br><br>";
    p.appendChild(a);
    body?.appendChild(p);
} else {
    if (discordBtn) discordBtn.style.display = "block";
    const emailLabel = document.querySelector<HTMLParagraphElement>("#emailLabel");
    if (emailLabel) emailLabel.remove();
}