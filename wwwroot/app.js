

const API_BASE = '/api/files';
const folderType = 'directory';
const emptyText = 'This folder is empty.';
const addDownloadVisualFeedback = true;

const state = {
    currentPath: new URLSearchParams(window.location.search).get('path') || '',
    isSearchMode: false,
    searchText: null,
    files: []
};

let searchTimeout;



const getDate = (lastModified) => {
    const date = lastModified ? new Date(lastModified) : '';    // convert UTC ISO string to local time
    const formattedDate =                                       // convert date to human readable format
        date.toLocaleString('en-US', {
            month: 'numeric',               // 3
            day: 'numeric',                 // 6
            year: 'numeric',                // 2026
            hour: 'numeric',                // 01
            minute: '2-digit',              // 45
            hour12: true                    // AM/PM
        });

    return formattedDate
};

const getSize = (size) => {
    const KB = 1024;
    const MB = 1024 ** 2;
    const GB = 1024 ** 3;
    const TB = 1024 ** 4;
    const PB = 1024 ** 5;
    let formattedSize = '';

    // convert size to human readable format
    if (size === null) formattedSize = '';
    else if (size < KB) formattedSize = `${size} B`;
    else if (size < MB) formattedSize = `${(size / KB).toFixed(2)} KB`;
    else if (size < GB) formattedSize = `${(size / MB).toFixed(2)} MB`;
    else if (size < TB) formattedSize = `${(size / GB).toFixed(2)} GB`;
    else if (size < PB) formattedSize = `${(size / TB).toFixed(2)} TB`;
    else formattedSize = `${(size / PB).toFixed(2)} PB`;

    return formattedSize;
};

const getFormatType = (item) => {
    const formattedType =
        item?.type === folderType ? 'File folder' :
            item?.extension ?? '';

    return formattedType;
};

const getFullFileName = (item) => item ? `${item.name}.${item.extension}` : '';

const getHeader = (isSearchMode) => {
    const header = `
        <div class="file-row header-row">
            <div class="col-name">Name</div>
            ${isSearchMode ? `<div class="col-location">Location</div>` : ''}
            <div class="col-date">Date Modified</div>
            <div class="col-type">Type</div>
            <div class="col-size">Size</div>
            <div class="col-action"></div>
        </div>
    `;
    return header;
};

const setSearchInfo = () => {
    const folderParts = state.currentPath.split('/');
    const currentFolder = folderParts[folderParts.length - 1] || 'home';
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = `Search ${currentFolder}`;
};

const setUploadButton = (isSearchMode) => {
    // set the upload button state, disable it in search mode since uploading in search results doesn't make sense and can cause bugs, enable it otherwise
    const uploadLabel = document.querySelector('label[for="uploadInput"]');
    if (isSearchMode) {
        uploadLabel.classList.add('disabled');
    } else {
        uploadLabel.classList.remove('disabled');
    }
}

const initApp = () => {
    const params = new URLSearchParams(window.location.search);
    const urlPath = params.get('path') || '';
    const urlSearch = params.get('search') || null;

    // FIX
    // Attach the initial URL data to the current history state
    // This ensures that when the user comes back to the start page the e.state isn't null
    history.replaceState({ path: urlPath, searchText: urlSearch }, '', window.location.href);

    if (urlSearch) {
        document.getElementById('searchInput').value = urlSearch;
    }

    loadData(urlPath, urlSearch, false);                                                // load initial data, false to not update history since this is the initial load
};

const uploadFile = async (file, path) => {
    const disableUpload = false;                                                        // disable the upload button during upload to prevent multiple uploads, can be enabled if needed
    if (disableUpload) setUploadButton(true);

    try {

        const formData = new FormData();
        formData.append('file', file);

        const apiUrl = `${API_BASE}/upload?path=${encodeURIComponent(state.currentPath)}`;
        console.log(`Uploading `, { fileName: file.name, apiUrl, currentPath: state.currentPath });

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData // the browser automatically sets Content-Type to multipart/form-data
        });

        if (response.ok) {
            // note, the user has uploaded a file and now the UI will update
            // this might seem like a flicker or nuance to the user
            // this can be improved by adding the file to the UI right away
            // that requires more state management and error handling
            // I chose to keep it simple and just reload the folder after upload, which is the source of truth for the folder contents
            console.log('Upload successful');
            loadData(state.currentPath, null, false);                                   // uploadFile
        } else {
            const error = await response.text();
            alert(`${error}`);
        }
    } catch (err) {
        console.error('Upload error:', err);
        alert('An error occurred during upload.');
    }

    setUploadButton(false);
};

const downloadFile = async (fileName, icon) => {
    const path = state.currentPath ? `${state.currentPath}/${fileName}` : fileName;
    const downloadUrl = `${API_BASE}/download?path=${encodeURIComponent(path)}`;

    icon.style.opacity = '0.5';                                                         // add download visual feedback
    icon.innerText = 'sync';                                                            // change icon to indicate download in progress

    // construct the URL and trigger the browser download
    // The most efficient way to trigger a download from a GET endpoint without leaving the page is to use window.location.assign.
    // The download endpoint returns a file, the browser will handle the download dialog automatically.
    // I can use a more complex fetch and Blob conversion in JavaScript, but the download works nice.
    window.location.assign(downloadUrl);

    setTimeout(() => {
        icon.style.opacity = '1';
        icon.innerText = 'file_download';                                               // reset the icon back after a delay
    }, 1000);
};

const deleteFile = async (path) => {
    try {
        const res = await fetch(`${API_BASE}/delete?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            await loadData(state.currentPath, state.searchText, false);                 // deleteFile
        } else {
            alert('Failed to delete file.');
        }
    } catch (err) {
        console.error('Delete error:', err);
    }
};

const loadData = async (path = '', searchText = null, updateHistory = true) => {
    const isSearchMode = searchText?.trim().length > 0;
    const pathName = window.location.pathname;                                          // this is the base path of the app, without query parameters, e.g. '?path=pictures%2Fother'
    const encodedPath = encodeURIComponent(path);

    let historyUrl = path.length ? `?path=${encodedPath}` : pathName;
    let apiUrl = `${API_BASE}/list?path=${encodedPath}`;
    let data = null;

    if (isSearchMode) {
        const separator = historyUrl.includes('?') ? '&' : '?';
        historyUrl += `${separator}search=${encodeURIComponent(searchText.trim())}`;
        apiUrl += `&search=${encodeURIComponent(searchText.trim())}`;
    }

    if (updateHistory) {
        history.pushState({ path, searchText }, '', historyUrl);
    }

    setUploadButton(isSearchMode);

    // clear the search textbox if the user clicks on a breadcrumb or other actions, excluding search
    if (!isSearchMode && document.getElementById('searchInput').value !== '') {
        document.getElementById('searchInput').value = '';
    }

    try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
            return alert('Error loading folder');
        }

        data = await res.json();

    } catch (err) {
        console.error(err);
    }

    state.currentPath = path;
    state.isSearchMode = isSearchMode;
    state.searchText = searchText;
    state.files = data;

    console.log('loadData', { path, pathName, encodedPath, historyUrl, apiUrl, updateHistory, state: state, searchText });

    setSearchInfo();
    render(data, path); // data | {} for testing
};


const drawList = (data) => {
    const hasItems = data?.items?.length;
    const container = document.getElementById('fileList');
    const noItemsRow = `<div class="empty">${emptyText}</div>`;

    const rows = hasItems ? data.items.map((item, index) => {
        const date = getDate(item.lastModified);
        const type = getFormatType(item);
        const size = getSize(item.size);
        const isFolder = item.type === folderType;
        const rowClass = isFolder ? 'file-row folder' : 'file-row';
        const fullFileName = getFullFileName(item);

        const downloadBtn = !isFolder
            ? `<span class="material-icons btn-download" data-name="${fullFileName}">file_download</span>`
            : '';

        const row = `
            <div class="${rowClass}"
                    data-name="${item.name}" 
                    data-type="${item.type}"
                    data-path="${item.path}">
                <div class="col-name">${item.name}</div>
                ${state.isSearchMode ? `<div class="col-location">${item.path}</div>` : ''}
                <div class="col-date">${date}</div>
                <div class="col-type">${type}</div>
                <div class="col-size">${size}</div>
                <div class="col-action">${downloadBtn}</div>
            </div>
        `;

        return row;
    }) : [];

    const headerHtml = getHeader(state.isSearchMode);
    const rowsHtml = rows.join('');
    const listHtl = [headerHtml, rowsHtml].join('');
    const noItemsHtml = [headerHtml, noItemsRow].join('');
    const listHtml = hasItems ? listHtl : noItemsHtml;

    container.innerHTML = listHtml;

    return listHtml;
};

const drawSummary = (data) => {
    const { folderCount = 0, fileCount = 0, totalSizeBytes = 0 } = data || {};
    const container = document.getElementById('summary');
    const hasItems = data?.items?.length;
    const totalSize = getSize(totalSizeBytes);
    const hasNoSummary = folderCount === 0 && fileCount === 0;
    const folderText = folderCount === 1 ? 'folder' : 'folders';
    const fileText = fileCount === 1 ? 'file' : 'files';
    const totalSizeHtml = totalSizeBytes > 0 ? `<span>${totalSize}</span>` : '';
    const summaryHtml = `
        <span>${folderCount} ${folderText}</span>
        <span>${fileCount} ${fileText}</span>
        ${totalSizeHtml}
    `;

    container.innerHTML = !hasNoSummary ? summaryHtml : '';

    return summaryHtml;
};

const drawBreadcrumb = (path) => {
    const container = document.getElementById('breadcrumb');
    const parts = path ? path.split('/') : [];
    const isRoot = parts.length === 0;
    const rootName = isRoot ? '...' : '...';                                            // root | home | .. | ••• | ···
    const seperatorName = '/';                                                          // > | / | · | › | ▸ | 〉| → | ► | -

    let breadcrumbHtml = `<span class="breadcrumb-item" onclick="loadData('')">${rootName}</span>`; // WARNING, the hard coded function name can change and cause a bug
    let breadCrumb = '';

    // create breadcrumb items for each part of the path
    parts.forEach((part, index) => {
        breadCrumb += index === 0 ? part : `/${part}`;
        breadcrumbHtml += `
            <span class="separator">${seperatorName}</span>
            <span class="breadcrumb-item" onclick="loadData('${breadCrumb}')">
                ${part}
            </span>
        `;                                                                              // WARNING, the hard coded function name can change and cause a bug
    });

    container.innerHTML = breadcrumbHtml;

    return breadcrumbHtml;
};

const render = (data, path) => {
    const hasItems = data?.items?.length;

    drawBreadcrumb(path);
    drawList(data);
    drawSummary(data);

    console.log('render', { hasItems, data, path });
};



// handle file upload action
document.getElementById('uploadInput').addEventListener('change', async (e) => {
    if (state.isSearchMode || !e.target.files[0]) return;                               // return if in search mode or no file selected
    const file = e.target.files[0];
    const path = state.currentPath;
    console.log('uploadInput', { isSearchMode: state.isSearchMode, file, path });
    await uploadFile(file, path);
    e.target.value = '';                                                                // clear the input so the same file can be uploaded again, fixes input bug where selecting the same file doesn't trigger change event
});

// handle file list actions - downloading files, navigating into folders
document.getElementById('fileList').addEventListener('click', (e) => {
    const row = e.target.closest('.file-row');                                          // find the closest parent element with class 'file-row' (the row they clicked on)
    const isDownloadAction = e.target.classList.contains('btn-download');               // the user clicked on the download button
    const isNavigationAction = !isDownloadAction && row?.dataset.type === folderType;   // the user clicked on a row and it is a folder
    const isDeleteAction = e.target.classList.contains('btn-delete');                   // the user clicked on the delete button

    if (isDownloadAction) {
        e.stopPropagation();
        const icon = e.target;
        const fileName = e.target.dataset.name;
        console.log('click', { data: row.dataset, fileName });
        downloadFile(fileName, icon);
    }

    if (isNavigationAction) {
        const folderPath = row.dataset.path;
        console.log('onNavigation', { data: row.dataset, folderPath });
        loadData(folderPath, null, true);
    }

    if (isDeleteAction) {
        const path = e.target.dataset.path;
        const name = row.dataset.name;

        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteFile(path);
        }
    }
});

// handle navigation actions - back, forward, etc.
window.addEventListener('popstate', (e) => {
    const { path, searchText } = e.state || { path: '', searchText: null };             // handle first page load with null or empty values
    document.getElementById('searchInput').value = searchText || '';                    // update the search box with the historical state
    console.log('popstate navigation', { path, searchText });
    loadData(path, searchText, false);                                                  // load the data without pushing a new history entry to avoid bad states
});

// handle the search action
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchText = e.target.value;
    console.log("Search", { searchText, path: state.currentPath });

    clearTimeout(searchTimeout);

    if (!searchText.trim()) {
        loadData(state.currentPath, null, true);
        return;
    }

    // use debounce pattern for search input to prevent unecessary loadData
    searchTimeout = setTimeout(() => {
        console.log(`Debounce "${searchText}"`);
        loadData(state.currentPath, searchText);                                        // search action
    }, 400);
});

initApp();                                                                              // start app