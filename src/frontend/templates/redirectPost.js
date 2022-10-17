const getParam = (name) => { var _a; return decodeURIComponent((_a = (new URLSearchParams(window.location.hash.replace("#", "?"))).get(name)) !== null && _a !== void 0 ? _a : ""); };
const [token_type, access_token, expires_in, scope] = ["token_type", "access_token", "expires_in", "scope"].map(x => getParam(x));

function setInnerHTML(elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes)
            .forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

const xhr = new XMLHttpRequest();
xhr.open("POST", window.location.href);
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onload = () => {
    setInnerHTML(document.body, xhr.responseText);
}

xhr.send(JSON.stringify({ token_type, access_token, expires_in, scope }));