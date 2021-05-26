window.onload = () => {
    const { ipcRenderer } = require('electron');
    const $ = require('jquery');
    require('bootstrap');

    const saveBtn = document.querySelector('#saveBtn');
    const table = document.querySelector('tbody');
    const overlay = document.querySelector('.overlay');

    const SaveData = () => {
        overlay.classList.add('overlay--visible');

        const data = [];

        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td input');
            const select = row.querySelector('select');

            console.log(cells);

            const obj = {
                name: cells[0].value,
                code: cells[1].value,
                price: cells[2].value,
                prom_price: cells[3].value,
                type: select.value,
                img: cells[4].mozFullPath
            }

            console.log(cells[4].src);

            data.push(obj);
        });
        
        let dateTime = new Date(document.querySelector('#from').value)
        let day = dateTime.getDate() + 1;
        let month = dateTime.getMonth() + 1;

        day = day < 10 ? "0" + day : day;
        month = month < 10 ? "0" + month : month;
        const from = `${day}.${month}.${dateTime.getFullYear()}`;

        dateTime = new Date(document.querySelector('#to').value);
        day = dateTime.getDate() + 1;
        day = day < 10 ? "0" + day : day;
        month = dateTime.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        const to = `${day}.${month}.${dateTime.getFullYear()}`;

        const date = {
            from: from,
            to: to
        };

        ipcRenderer.send('open-print-window', {data: data, date: date});
    };

    saveBtn.addEventListener('click', () => SaveData());

    ipcRenderer.on('print-shortcut', () => SaveData());

    ipcRenderer.on('saved-pdfs', () => overlay.classList.remove('overlay--visible'));
}