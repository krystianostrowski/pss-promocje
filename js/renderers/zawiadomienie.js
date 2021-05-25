window.onload = () => {
    const { ipcRenderer } = require('electron');
    const tbody = document.querySelector('tbody');
    let data;
    let date;

    ipcRenderer.send('get-data');

    ipcRenderer.on('sent-data', (event, args) => {
        data = args.data;
        date = args.date;

        RenderTable();
        ipcRenderer.send('print-to-pdf');
    });

    const RenderTable = () => {
        let row;
        let col;
        data.forEach(d => {
            row = document.createElement('tr');

            col = document.createElement('td');
            col.innerHTML = d.name + '<br><span class="code">' + d.code + "</span>";
            row.appendChild(col);

            col = document.createElement('td');
            col.innerText = d.price;
            row.appendChild(col);

            col = document.createElement('td');
            col.innerText = d.prom_price;
            row.appendChild(col);

            tbody.appendChild(row);
        });

        document.querySelector('#from').innerText = date.from;
        document.querySelector('#to').innerText = date.to;
    }
};