window.onload = () => {
    const { ipcRenderer } = require('electron');

    ipcRenderer.on('downloaded-update', () => {
        const button = document.createElement('button');
        button.innerText = "Zainstaluj";
        button.classList.add('btn-dwnld');
        button.addEventListener('click', () => {
            ipcRenderer.send('install-update');
        });
        
        document.querySelector('h1').innerText = "Aktualizacja pobrana i gotowa do zainstalowania."

        document.querySelector('.container').appendChild(button);
    });
}