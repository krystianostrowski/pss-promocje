window.onload = () => {
    const { ipcRenderer } = require('electron');
    const $ = require('jquery');
    const bootstrap = require('bootstrap');

    const path = document.querySelector('#path');

    const saveToast = document.querySelector('#savedToast');
    const saveAndRestartToast = document.querySelector('#saveAndRestartToast');
    const experimentalCheckbox = document.querySelector('#experimentalCheckbox');

    let options;
    let experimentalStateOnLoad;

    ipcRenderer.send('get-options');

    ipcRenderer.on('render-options', (event, args) => {
        options = args;

        path.value = options.saveLocation;
        experimentalCheckbox.checked = args.experimental;

        experimentalStateOnLoad = args.experimental;
    });

    ipcRenderer.on('update-path', (event, args) => {
        path.value = args;
        options.saveLocation = args;
    });

    document.querySelector('#dirDialog').addEventListener('click', () => {
        ipcRenderer.send('open-dir-dialog');
    });

    experimentalCheckbox.addEventListener('click', e => {
        options.experimental = e.target.checked;
    });

    document.querySelector('#saveBtn').addEventListener('click', () => {
        ipcRenderer.send('update-options', options);

        if(experimentalStateOnLoad != experimentalCheckbox.checked)
            new bootstrap.Toast(saveAndRestartToast).show();
        else
            new bootstrap.Toast(saveToast).show();
    });

    document.querySelector('#restartBtn').addEventListener('click', () => {
        ipcRenderer.send('restart-app');
    });
};