// @ts-check

const token = `{{token}}`;
const COOKIE = "_CMOEAUTHTOKEN";

console.log(token)

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function delCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

if (getCookie(COOKIE)) {
    // Cookie already exists, link accounts instead
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${window.location.origin}/linkAccount`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        oldToken: getCookie(COOKIE),
        newToken: token
    }));
    xhr.onload = () => {
        delCookie(COOKIE);
        window.location.reload();
    }
} else {
    setCookie(COOKIE, token, 365);
    window.location.href = '/auth';
}