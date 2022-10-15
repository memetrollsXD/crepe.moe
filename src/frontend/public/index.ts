'use strict';
// @ts-ignore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
// @ts-ignore
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-analytics.js";
// @ts-ignore
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";
import { AuthState } from "./SharedTypes";

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
const auth = getAuth(app);
let currentUser: AuthState | null = null;

auth.onAuthStateChanged((u: AuthState) => {
    if (u) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        currentUser = u;
        console.log(u);
        if (!u.isAnonymous) document.querySelector<HTMLAnchorElement>("#loginBtn")!.innerText = "Account";
    } else {
        // User is signed out
        // Log in anonymously
        signInAnonymously(auth);
    }
});

// Check template.ts (Server Side Rendering)
const FILE_SIZE_LIMIT = Number("{{STATIC_MAX_FILE_MB}}") * 1024 ** 2;
const fileDrag = document.querySelector<HTMLLabelElement>('#file-drag')!;
const fileSelect = document.querySelector<HTMLInputElement>('#file-upload')!;
const uploads = document.querySelector<HTMLDivElement>('#uploads')!;
const responseElement = document.querySelector<HTMLDivElement>('#response')!;
const fileForm = document.querySelector<HTMLFormElement>("#file-upload-form")!;

function cancelEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
}

function showResponse(t: string) {
    responseElement.innerHTML = t;
    responseElement.classList.remove("hidden");
}

function onDrag(e: DragEvent) {
    cancelEvent(e);

    if (e.type == "drop") {
        fileDrag.className = 'modal-body file-upload';
        fileSelect.files = e.dataTransfer?.files || null;
        onUpload(e);
    }
}

window.addEventListener('drop', onDrag);
window.addEventListener('dragover', onDrag);

function toSize(bytes: number) {
    if (bytes == 0) return '0 B';
    const k = 1024,
        dm = 2,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function onUpload(e: any) { // Fuck this i'm not finding the type
    const target = <HTMLInputElement>e.target;
    let file: File | null = null;
    if (target && target.files) {
        file = target.files[0];
    } else if (e.dataTransfer && e.dataTransfer.files) {
        file = e.dataTransfer.files[0];
    } else if (e.files) {
        file = e.files[0];
    }
    if (!file) return;

    // Create new upload
    const upload = document.createElement('div');
    upload.className = 'upload';

    const uploadMeta = document.createElement('div');
    uploadMeta.className = 'upload-meta';

    const uploadName = document.createElement('b');
    uploadName.className = 'upload-name';
    uploadName.innerText = file.name;

    const uploadProgress = document.createElement('span');
    uploadProgress.className = 'upload-size upload-progress';
    uploadProgress.innerText = '0%';

    const uploadSize = document.createElement('span');
    uploadSize.className = 'upload-size';
    uploadSize.innerText = `${toSize(file.size)}`;

    uploadMeta.appendChild(uploadName);
    uploadMeta.appendChild(uploadProgress);
    uploadMeta.appendChild(uploadSize);
    upload.appendChild(uploadMeta);
    upload.appendChild(document.createElement('br'));

    const metaU = document.createElement('div');
    metaU.className = 'upload-meta';

    const uploadUrl = document.createElement('input');
    uploadUrl.className = 'upload-url';
    uploadUrl.type = 'text';
    uploadUrl.value = 'Uploading...';
    uploadUrl.readOnly = true;
    uploadUrl.addEventListener('click', () => {
        navigator.clipboard.writeText(uploadUrl.value);
        uploadUrl.select();
    });

    const copyBtn = document.createElement('button');
    const copyIcon = document.createElement('i');
    copyIcon.className = 'fa fa-copy';
    copyBtn.className = 'copy-btn'; // No FA icon copium, else event listener wont work
    copyBtn.innerText = ''
    copyBtn.appendChild(copyIcon);

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(uploadUrl.value);
        uploadUrl.select();
    });

    metaU.appendChild(uploadUrl);
    metaU.appendChild(copyBtn);
    upload.appendChild(metaU);


    if ((/\.(?=gif|jpg|png|jpeg)/gi).test(file.name)) {
        document.getElementById('start')?.classList.add("hidden");
        // Thumbnail Preview
        document.getElementById('file-image')?.classList.remove("hidden");
        document.querySelector<HTMLImageElement>('#file-image')!.src = URL.createObjectURL(file);
    }
    else {
        document.getElementById('file-image')?.classList.add("hidden");
        document.getElementById('start')?.classList.remove("hidden");
        fileForm.reset();
    }
    if (file.size >= FILE_SIZE_LIMIT) {
        showResponse(`File too big. ${toSize(file.size)} > ${toSize(FILE_SIZE_LIMIT)}`);
        return;
    }
    // Make a POST request with the file
    const formData = new FormData();
    formData.append('file', file);
    if (currentUser) {
        formData.append('uid', currentUser.uid);
        formData.append('token', currentUser.accessToken);
    }
    const xhr = new XMLHttpRequest();
    uploads.appendChild(upload);
    xhr.open('POST', '/upload');

    xhr.upload.addEventListener("progress", (e) => {
        const percentComplete = (e.loaded / e.total) * 100;
        uploadProgress.innerText = `${percentComplete.toFixed(0)}%`;
    });

    xhr.onload = () => {
        // Successful upload
        logEvent(analytics, 'upload', {
            ext: file?.name.split(".").pop(),
            size: file?.size,
            status: xhr.status,
            ownerUid: currentUser?.uid,
        });
        if (xhr.status != 200) {
            console.error(`Error ${xhr.status}: ${xhr.statusText}, ${xhr.responseText}`);
            showResponse(`Error ${xhr.status}: ${xhr.statusText}, ${xhr.responseText}`);
            return;
        }
        const rsp = JSON.parse(xhr.responseText) as {
            success: boolean;
            message: string;
            timestamp: number;
            data: {
                url: {
                    full: string;
                    short: string;
                    cdn: string;
                    id: string;
                },
                meta: {
                    name: string;
                    size: number;
                    encoding: string;
                    tempFilePath: string;
                    truncated: boolean;
                    mimetype: string;
                    md5: string;
                }
            }
        };
        console.log(rsp);
        const url = `${window.location.origin}/${rsp.data.url.id}`;
        navigator.clipboard.writeText(url);
        uploadUrl.value = url;
        showResponse(`<a href="${url}">Copied link to your clipboard!</a>`);
        fileForm.reset();
    }
    xhr.send(formData);
}

if (window.File && window.FileList && window.FileReader) {
    fileDrag.addEventListener('dragover', cancelEvent, false);
    fileDrag.addEventListener('dragleave', cancelEvent, false);
    fileSelect.addEventListener('change', onUpload, false);
    window.addEventListener('paste', (e: any) => { // AaAaAaAaAaAAaa
        const pastedText = e.clipboardData.getData('text/plain');
        if (pastedText) {
            const blob = new Blob([pastedText], { type: 'text/plain' });
            const file = new File([blob], 'message.txt', { type: 'text/plain' });
            onUpload({ target: { files: [file] }, stopPropagation: () => { }, preventDefault: () => { } });
            return;
        }

        if (e.clipboardData.files.length == 0) return;

        onUpload({
            target: {
                files: e.clipboardData.files
            },
            stopPropagation: () => { },
            preventDefault: () => { }
        });
    });
}

else fileDrag.style.display = "none";