'use strict';
// @ts-ignore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
// @ts-ignore
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-analytics.js";
import { CrepeToken, getCookie } from "./SharedTypes"; 
// @ts-ignore
import _jwtDecode from "./jwt-decode";
// @ts-ignore
const jwtDecode = _jwtDecode as (token: string) => CrepeToken;

const adminButtons = document.querySelector<HTMLDivElement>(".admin-buttons")!;
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
const analytics = getAnalytics(app);

logEvent(analytics, "file_view", {
    id: window.location.pathname.split("/")[1]
});

const cookie = getCookie("_CMOEAUTHTOKEN");
let token: CrepeToken | null = null;
if (cookie) token = jwtDecode(cookie);

if (token) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User

    // Display / hide admin icons based on user id
    const ownerUid = document.head.querySelector<HTMLMetaElement>("meta[property='cmoe:ownerid']")?.content;

    if (ownerUid && token.uid === ownerUid) {
        adminButtons.style.display = "block";
    }

    // Add event listeners to admin icons
    // const dmcaReq = document.querySelector<HTMLAnchorElement>(".dmca-req")!;
    const editReq = document.querySelector<HTMLAnchorElement>(".edit-req")!;
    const deleteReq = document.querySelector<HTMLAnchorElement>(".delete-req")!;
    // dmcaReq.addEventListener("click", onDMCAReq);
    editReq.addEventListener("click", onEditReq);
    deleteReq.addEventListener("click", onDeleteReq);
} else {
    adminButtons.remove();
}


// function onDMCAReq(e: MouseEvent) {
//     e.preventDefault();
//     showModal([{ label: "Reason", type: TextType.TextArea }], {
//         label: null, buttons: [{
//             label: "Submit", callback: (e: MouseEvent) => {
//                 const parent = (<HTMLButtonElement>e.target).parentElement?.parentElement?.parentElement;
//                 let reason = "";
//                 parent?.childNodes.forEach(c => {
//                     c.childNodes.forEach((c2: any) => {
//                         if (c2.value) reason = c2.value;
//                     });
//                 });

//                 XHR({
//                     type: ActionType.DMCA,
//                     token: currentUser!.accessToken,
//                     data: { reason }
//                 });

//                 window.location.reload();
//             }
//         }]
//     });
// }

function onEditReq(e: MouseEvent) {
    e.preventDefault();
    showModal([{ label: "Title", type: TextType.TextField }], {
        label: null, buttons: [{
            label: "Submit", callback: async (e: MouseEvent) => {
                const parent = (<HTMLButtonElement>e.target).parentElement?.parentElement?.parentElement;
                let title = "";
                parent?.childNodes.forEach(c => {
                    c.childNodes.forEach((c2: any) => {
                        if (c2.value) title = c2.value;
                    });
                });

                XHR({
                    type: ActionType.Edit,
                    token: cookie!,
                    data: { title }
                });
                window.location.reload();
            }
        }]
    });
}

function onDeleteReq(e: MouseEvent) {
    e.preventDefault();
    showModal([], {
        label: "Are you sure you want to delete this upload?", buttons: [
            {
                label: "Delete", callback: async (e: MouseEvent) => {
                    XHR({
                        type: ActionType.Delete,
                        token: cookie!,
                        data: {}
                    });
                    window.location.reload();
                },
                color: "#c13133"
            },
            {
                label: "Cancel", callback: (e: MouseEvent) => {
                    (<HTMLButtonElement>e.target).parentElement?.parentElement?.parentElement?.parentElement?.remove();
                }
            }]
    });
}

enum TextType {
    TextField = 0,
    TextArea = 1
}

function showModal(textFields: { label: string, type: TextType }[] = [], buttonFields: { label: string | null, buttons: { label: string, callback: (e: MouseEvent) => void, color?: string }[] } = { label: "", buttons: [] }) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    textFields.forEach(f => {
        const label = document.createElement("label");
        label.innerText = f.label;
        const input = document.createElement(f.type ? "textarea" : "input");
        // input.type = "text";
        label.appendChild(input);
        modalContent.appendChild(label);
    });

    const buttonLabel = document.createElement("label");
    buttonLabel.innerText = buttonFields.label ?? "";
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonFields.buttons.forEach(b => {
        const button = document.createElement("button");
        button.innerText = b.label;
        button.addEventListener("click", b.callback);
        if (b.color) {
            button.style.backgroundColor = b.color;
        }
        buttonContainer.appendChild(button);
    });

    buttonLabel.appendChild(buttonContainer);
    modalContent.appendChild(buttonLabel);
    modal.appendChild(modalContent);

    // If clicked outside of modal, close it
    modal.addEventListener("click", e => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// showModal([{ label: "TextField", type: TextType.TextArea }, { label: "TextInput", type: TextType.TextField }], { label: "Buttons", buttons: [{ label: "Delete", callback: (e) => { console.log(e); }, color: "#c13133" }, { label: "Cancel", callback: (e) => { console.log(e); } }] });

enum ActionType {
    Delete = 0,
    Edit = 1,
    DMCA = 2
}

interface AdminReq {
    type: ActionType,
    token: string,
    id?: string,
    data: any
}

function XHR(data: AdminReq) {
    data.id = window.location.pathname.split("/")[1];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${window.location.origin}/admin`, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    // console.log(data);
    return xhr.send(JSON.stringify(data));
}