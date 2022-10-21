import { getCookie, delCookie, CrepeToken } from "./SharedTypes";
// @ts-ignore
import _jwtDecode from "./jwt-decode";
// @ts-ignore
const jwtDecode = _jwtDecode as (token: string) => CrepeToken;

const discordBtn = document.querySelector<HTMLButtonElement>("#discordBtn");
const body = document.querySelector<HTMLDivElement>("#start");

discordBtn?.addEventListener("click", () => {
    // @ts-ignore - Defined in index.html
    redirectLogin();
});

const cookie = getCookie("_CMOEAUTHTOKEN");
let token;
if (cookie) token = jwtDecode(cookie);

if (token && !token.isAnonymous) {
    // User is signed in

    const p = document.createElement("p");
    p.id = "emailLabel";
    p.innerText = `Signed in as ${token.displayName ?? token.uid}. `;
    p.innerHTML += `<br>`;
    if (token.premiumLevel > 0) {
        p.innerHTML += `You are premium!`;
    } else {
        p.innerHTML += `You are not <a href="/premium" style="color: white; text-decoration: underline">premium</a>.`;
    }
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