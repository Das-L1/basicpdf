document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById('file-input');
    const loadFilesButton = document.getElementById('load-files');
    const clearViewerButton = document.getElementById('clear-viewer');
    const viewer = document.getElementById('book-viewer');

    // Function to load a single PDF file
    async function loadPDF(file) {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const pdf = await pdfjsLib.getDocument({data: new Uint8Array(this.result)}).promise;
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const viewport = page.getViewport({ scale: 1.5 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;
                const pageDiv = document.createElement('div');
                pageDiv.className = 'pdf-page';
                pageDiv.appendChild(canvas);
                viewer.appendChild(pageDiv);
            }
        };
        fileReader.readAsArrayBuffer(file);
    }

    // Function to load a single TXT file
    async function loadTXT(file) {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const text = this.result;
            const pre = document.createElement('pre');
            pre.className = 'text-content';
            pre.textContent = text;
            viewer.appendChild(pre);
        };
        fileReader.readAsText(file);
    }

    // Function to load multiple files
    async function loadFiles(files) {
        viewer.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'application/pdf') {
                await loadPDF(file);
            } else if (file.type === 'text/plain') {
                await loadTXT(file);
            }
        }
    }

    // Event listeners
    loadFilesButton.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            loadFiles(fileInput.files);
        }
    });

    clearViewerButton.addEventListener('click', () => {
        viewer.innerHTML = '';
        fileInput.value = '';
    });
});
