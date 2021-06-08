window.onload = () => {
    const { ipcRenderer } = require('electron');

    if(location.hash == '#print')
        ipcRenderer.send('print-to-pdf');
};