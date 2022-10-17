// @ts-check

const token = `{{token}}`;

console.log(token)

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

setCookie('_CMOEAUTHTOKEN', token, 365);

window.location.href = '/auth';