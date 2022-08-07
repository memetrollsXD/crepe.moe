'use strict';
(function () {
    // Check template.ts (Server Side Rendering)
    const FILE_SIZE_LIMIT = Number("{{STATIC_MAX_FILE_MB}}") * 1024 ** 2;
    const fileDrag = document.getElementById('file-drag');
    const fileSelect = document.getElementById('file-upload');
    const uploads = document.getElementById('uploads');
    const responseElement = document.getElementById('response');

    const cancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    const response = (text) => {
        responseElement.innerHTML = text;
        responseElement.classList.remove("hidden");
    }

    const onDrag = (e) => {
        cancel(e);

        if (e.type == "drop") {
            fileDrag.className = 'modal-body file-upload';
            fileSelect.files = e.dataTransfer.files;
            onUpload(e);
        }
    }

    window.addEventListener('drop', onDrag);
    window.addEventListener('dragover', onDrag);

    const BytestoSize = (bytes) => {
        if (bytes == 0) return '0 B';
        const k = 1024,
            dm = 2,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const onUpload = (e) => {
        let file;
        if (e.target && e.target.files) {
            file = e.target.files[0];
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
        uploadSize.innerText = `${BytestoSize(file.size)}`;

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
        uploadUrl.value = 'BINGUS';
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
            document.getElementById('start').classList.add("hidden");
            // Thumbnail Preview
            document.getElementById('file-image').classList.remove("hidden");
            document.getElementById('file-image').src = URL.createObjectURL(file);
        }
        else {
            document.getElementById('file-image').classList.add("hidden");
            document.getElementById('start').classList.remove("hidden");
            document.getElementById("file-upload-form").reset();
        }
        if (file.size >= FILE_SIZE_LIMIT) {
            response(`File too big. ${BytestoSize(file.size)} > ${BytestoSize(FILE_SIZE_LIMIT)}`);
            return;
        }
        // Make a POST request with the file
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
        uploads.appendChild(upload);
        xhr.open('POST', '/upload');
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                uploadProgress.innerText = `${percentComplete.toFixed(0)}%`;
            }
        }

        xhr.onload = () => {
            if (xhr.status != 200) {
                console.error(`Error ${xhr.status}: ${xhr.statusText}, ${xhr.responseText}`);
                response(`Error ${xhr.status}: ${xhr.statusText}, ${xhr.responseText}`);
                return;
            }
            const rsp = JSON.parse(xhr.responseText);
            console.log(rsp);
            navigator.clipboard.writeText(`${rsp.data.url.short}`);
            uploadUrl.value = `${rsp.data.url.short}`;
            response(`<a href="${rsp.data.url.short}">Copied link to your clipboard!</a>`);
            document.getElementById('file-upload-form').reset();
        }
        xhr.send(formData);
    }

    if (window.File && window.FileList && window.FileReader) {
        fileDrag.addEventListener('dragover', cancel, false);
        fileDrag.addEventListener('dragleave', cancel, false);
        fileSelect.addEventListener('change', onUpload, false);
        window.addEventListener('paste', (e) => {
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
    else fileDrag.style.display = none;
})();