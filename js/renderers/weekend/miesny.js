window.onload = () => {
    const { ipcRenderer } = require('electron');
    const container = document.querySelector('.container');
    let data;
    let date;

    ipcRenderer.send('get-data');

    ipcRenderer.on('sent-data', (event, args) => {
        data = args.data;
        date = args.date;

        RenderData();

        if(location.hash == '#print')
            ipcRenderer.send('print-to-pdf');
    });

    const RenderData = () => {
        data.forEach(d => {
            if(d.type == 'miesny')
            {
                const page = document.createElement('div');
                page.classList.add('page');

                const title = document.createElement('span');
                title.innerText = 'weekendowe hity cenowe';
                title.classList.add('title');
                page.appendChild(title);

                const product = document.createElement('span');
                product.innerText = d.name;
                product.classList.add('product');

                if(d.name.length > 13 && d.name.length < 25)
                    product.classList.add('product-font-md');
                
                if(d.name.length >= 25)
                    product.classList.add('product-font-sm');

                page.appendChild(product);

                const price = document.createElement('span');
                const unit = d.prom_price.match(new RegExp(/zł\/[a-z A-Z]*/));
                const p = d.prom_price.split(',');
                price.innerHTML = (p.length == 2) ? `${p[0]}<sup>${p[1].replace(unit, '')}</sup><span class="p-unit">${unit}</span>` : p[0].replace(unit, '');
                price.classList.add('price');
                page.appendChild(price);

                const time = document.createElement('time');
                time.innerText = `Ofertwa ważna od ${date.from} do ${date.to} lub do wyczerpania zapasów.`;
                time.classList.add('time');
                page.appendChild(time);

                container.appendChild(page);
            }   
        });

        /*document.querySelector('#from').innerText = date.from;
        document.querySelector('#to').innerText = date.to;*/
    }
};