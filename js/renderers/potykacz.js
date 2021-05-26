window.onload = () => {
    const { ipcRenderer } = require('electron');
    const units = require('../../js/units');
    const tbody = document.querySelector('tbody');
    let data;
    let date;

    console.log(__dirname);

    ipcRenderer.send('get-data');

    ipcRenderer.on('sent-data', (event, args) => {
        data = args.data;
        date = args.date;

        RenderData();
        ipcRenderer.send('print-to-pdf');
    });

    const RenderData = () => {
        let tr;

        for(let i = 0; i < 5; i++)
        {
            tr = document.createElement('tr');

            let td;
            let itemName;
            let price;

            for(let j = 0; j < 2; j++)
            {
                const item = data[i * 2 + j];
                td = document.createElement('td');

                itemName = document.createElement('span');
                itemName.classList.add('product');
                itemName.innerText = item.name;
                td.appendChild(itemName);

                price = document.createElement('span');
                price.classList.add('price');

                let p = item.prom_price.split('zł');

                price.innerHTML = p[0] + '<span class="zl">zł' + p[1] + '</span>';

                console.log(item.prom_price.split('zł'));

                td.appendChild(price);

                if(item.name.getMeasure())
                {
                    let pricePerSI = document.createElement('span');
                    pricePerSI.classList.add('pricePerSI');

                    let pr = parseFloat(item.prom_price.replace(',', '.'));
                    console.log(pr);
                    let volume = item.name.getMeasure();
                    let unit = volume[0].getUnits();
                    volume = volume[0].getValue();
                    volume = units.ToSIUnits(volume, unit);

                    pr = units.calcPriceForLOrKg(volume.value, pr);

                    if(pr != false)
                    {
                        pricePerSI.innerText = `(${pr.toString().replace('.', ',')}zł/${volume.unit})`;
                        price.appendChild(pricePerSI);
                    }
                }

                if(item.name.toLowerCase().includes('piwo'))
                {
                    const span = document.createElement('span');
                    span.classList.add('ustawa');
                    span.innerText = '1/2 LITRA PIWA ZAWIERA 25 GRAMÓW CZYSTEGO ALKOHOL ETYLOWEGO. NAWET TAKA ILOŚĆ SZKODZI ZDROWIU KOBIET W CIĄŻY I JEST NEBEZPIECZNA DLA KIEROWCÓW.';
                    td.appendChild(span);
                }

                if(item.name.toLowerCase().includes('wódka'))
                {
                    const span = document.createElement('span');
                    span.classList.add('ustawa');
                    span.innerText = 'ALKOHOL SZKODZI ZDROWIU, NIE SPRZEDAJEMY ALKOHOLU OSOBOM NIETRZEŹWYM ORAZ OSOBOM DO LAT 18 ZGODNIE Z ART.15 UST.1 USTAWY Z DNIA 26.10.1982R. DZ.U. Z 2002R. NR 147 POZ.1231 ZE ZM.';
                    td.appendChild(span);
                }

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        document.querySelector('#from').innerText = date.from;
        document.querySelector('#to').innerText = date.to;
    }
};