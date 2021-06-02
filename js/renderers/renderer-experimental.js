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
            const file = row.querySelector('.fileUpload');

            console.log(cells);

            const obj = {
                name: cells[0].value,
                code: cells[1].value,
                price: cells[2].value,
                prom_price: cells[3].value,
                type: select.value,
                img: file.getAttribute('path')
            }

            data.push(obj);
        });
        
        let dateTime = new Date(document.querySelector('#from').value)
        let day = ("0" + dateTime.getDate() + 1).slice(-2);
        let month = `0${dateTime.getMonth() + 1}`.slice(-2);
        const from = `${day}.${month}.${dateTime.getFullYear()}`;

        dateTime = new Date(document.querySelector('#to').value);
        day = ("0" + dateTime.getDate() + 1).slice(-2);
        month = `0${dateTime.getMonth() + 1}`.slice(-2);
        const to = `${day}.${month}.${dateTime.getFullYear()}`;

        const date = {
            from: from,
            to: to
        };

        ipcRenderer.send('open-print-window', {data: data, date: date});
    };

    table.addEventListener('click', e => {
        if(e.target.classList.contains('fileUpload'))
        {
            const node = e.target;
            const fileId = node.id;

            ipcRenderer.send('upload-image', fileId);
        }
    });

    ipcRenderer.on('image-uploaded', (event, args) => {
        const id = args.id;
        const path = args.path;

        console.log(id, path);

        document.querySelector(`#${id}`).setAttribute('path', path);
        const parent = document.querySelector(`#${id}-parent`);
        let img = parent.querySelector('img');

        if(img)
        {
            img.src = path;
        }
        else
        {
            img = document.createElement('img');
            img.src = path;
            img.classList.add('td-img');
            parent.appendChild(img);
        }
    });

    saveBtn.addEventListener('click', () => SaveData());

    ipcRenderer.on('print-shortcut', () => SaveData());

    ipcRenderer.on('saved-pdfs', () => overlay.classList.remove('overlay--visible'));
}