window.onload = () => {
    const { ipcRenderer } = require('electron');
    const $ = require('jquery');
    require('bootstrap');

    const path = document.querySelector('#path');

    let options;

    ipcRenderer.send('get-options');

    ipcRenderer.on('render-options', (event, args) => {
        options = args;

        path.value = options.saveLocation;
    });

    ipcRenderer.on('update-path', (event, args) => {
        path.value = args;
        options.saveLocation = args;
    });

    document.querySelector('#dirDialog').addEventListener('click', () => {
        ipcRenderer.send('open-dir-dialog');
    });

    document.querySelector('#saveBtn').addEventListener('click', () => {
        ipcRenderer.send('update-options', options);
    });
};