window.onload = () => {
    require('../../js/Titlebar')(document);
    const { ipcRenderer } = require('electron')
    const $ = require('jquery');
    require('bootstrap');
    
    document.querySelector('#acceptBtn').addEventListener('click', () => {
        ipcRenderer.send('license-accepted');
    });

    document.querySelector('#cancelBtn').addEventListener('click', () => {
        ipcRenderer.send('license-rejected');
    })
}