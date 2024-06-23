document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById('file-input');
    const loadFilesButton = document.getElementById('load-files');
    const clearViewerButton = document.getElementById('clear-viewer');
    const viewer = document.getElementById('book-viewer');
    const leftArrow = document.getElementById('left-arrow');
    const rightArrow = document.getElementById('right-arrow');

    let currentPage = 0;
    let pages = [];

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
                pages.push(pageDiv);
            }
            displayPages();
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
            pages.push(pre);
            displayPages();
        };
        fileReader.readAsText(file);
    }

    // Function to load multiple files
    async function loadFiles(files) {
        viewer.innerHTML = '';
        pages = [];
        currentPage = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'application/pdf') {
                await loadPDF(file);
            } else if (file.type === 'text/plain') {
                await loadTXT(file);
            }
        }
    }

    // Function to display pages
    function displayPages() {
        viewer.innerHTML = '';
        const isLandscape = window.innerWidth > window.innerHeight;
        const pagesToShow = isLandscape ? 2 : 1;
        for (let i = 0; i < pagesToShow; i++) {
            const pageIndex = currentPage + i;
            if (pageIndex < pages.length) {
                viewer.appendChild(pages[pageIndex]);
            }
        }
        updateNavArrows();
    }

    // Function to update navigation arrows visibility
    function updateNavArrows() {
        leftArrow.style.display = currentPage > 0 ? 'block' : 'none';
        rightArrow.style.display = currentPage + (window.innerWidth > window.innerHeight ? 2 : 1) < pages.length ? 'block' : 'none';
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
        pages = [];
        currentPage = 0;
    });

    leftArrow.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage -= window.innerWidth > window.innerHeight ? 2 : 1;
            displayPages();
        }
    });

    rightArrow.addEventListener('click', () => {
        if (currentPage + (window.innerWidth > window.innerHeight ? 2 : 1) < pages.length) {
            currentPage += window.innerWidth > window.innerHeight ? 2 : 1;
            displayPages();
        }
    });

    // Function to adjust layout based on orientation
    function adjustLayout() {
        displayPages();
    }

    // Adjust layout on load and resize
    adjustLayout();
    window.addEventListener('resize', adjustLayout);

    // Add mouse wheel event for navigation
    viewer.addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
            if (currentPage + (window.innerWidth > window.innerHeight ? 2 : 1) < pages.length) {
                currentPage += window.innerWidth > window.innerHeight ? 2 : 1;
                displayPages();
            }
        } else {
            if (currentPage > 0) {
                currentPage -= window.innerWidth > window.innerHeight ? 2 : 1;
                displayPages();
            }
        }
    });
});
