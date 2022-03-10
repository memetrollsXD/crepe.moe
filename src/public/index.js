(function () {
    const fileDrag = document.getElementById('file-drag');
    const fileSelect = document.getElementById('file-upload');
    const progressBar = document.getElementById('file-progress');
    const form = document.getElementById('file-upload-form');
    const onDrag = (e) => {
        e.stopPropagation();
        e.preventDefault();

        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    const onUpload = (e) => {
        // Checking
        const file = e.target.files[0];
        onDrag(e);

        if ((/\.(?=gif|jpg|png|jpeg)/gi).test(file.name)) {
            document.getElementById('start').classList.add("hidden");
            document.getElementById('response').classList.remove("hidden");
            document.getElementById('notimage').classList.add("hidden");
            // Thumbnail Preview
            document.getElementById('file-image').classList.remove("hidden");
            document.getElementById('file-image').src = URL.createObjectURL(file);
        }
        else {
            document.getElementById('file-image').classList.add("hidden");
            document.getElementById('notimage').classList.remove("hidden");
            document.getElementById('start').classList.remove("hidden");
            document.getElementById('response').classList.add("hidden");
            document.getElementById("file-upload-form").reset();
        }
        if (file.size >= 100 * 1024 ** 2) {
            console.log(`File too big. ${file.size} > ${100 * 1024 ** 2}`);
            return;
        }
        // Make a POST request with the file
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload');
        xhr.onload = () => {
            if (xhr.status != 200) {
                console.error(`Error ${xhr.status}: ${xhr.statusText}, ${xhr.responseText}`);
                return;
            }
            console.log(xhr.responseText);
            navigator.clipboard.writeText(`https://crepe.moe/${xhr.responseText.split('.')[0]}`);
            document.getElementById('response').innerHTML = `<a href="https://crepe.moe/${xhr.responseText.split('.')[0]}">Copied link to your clipboard!</a>`;
            document.getElementById('response').classList.remove("hidden");
            document.getElementById('file-upload-form').reset();
        }
        xhr.send(formData);
    }

    if (window.File && window.FileList && window.FileReader) {
        fileDrag.addEventListener('dragover', onDrag, false);
        fileDrag.addEventListener('dragleave', onDrag, false);
        fileDrag.addEventListener('drop', onUpload, false);
        fileSelect.addEventListener('change', onUpload, false);
        window.addEventListener('paste', (e) => {
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