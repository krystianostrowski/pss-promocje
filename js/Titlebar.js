module.exports = function() {
    const { ipcRenderer } = require('electron');
    const ElectronTitlebarWindows = require('electron-titlebar-windows');

    const titlebarOptions = {
        draggable: true,
        darkMode: true,
        backgroundColor: '#1b1e22'
    }
    
    const titlebar = new ElectronTitlebarWindows(titlebarOptions); 

    titlebar.on('close', () => ipcRenderer.send('titlebar-close'))
    titlebar.on('maximize', () => ipcRenderer.send('titlebar-maximize'))
    titlebar.on('fullscreen', () => ipcRenderer.send('titlebar-maximize'))
    titlebar.on('minimize', () => ipcRenderer.send('titlebar-minimize'))

    const titlebarContainer = document.createElement('div');
    titlebarContainer.style.position = "fixed";
    titlebarContainer.style.width = "100%";
    titlebarContainer.style.zIndex = 9999;
    document.body.prepend(titlebarContainer);

    const container = document.querySelector('.container-fluid')
    container.style.maxHeight = "100vh";
    container.style.overflowY = "auto";
    document.body.style.overflowY = 'hidden';


    titlebar.appendTo(titlebarContainer);
}
