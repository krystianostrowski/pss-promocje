const path = require('path');
const fs = require('fs');

const printQueue = ['zawiadomienie', 'miesny', 'weekendA4', 'potykacz', 'potykaczS4'];
let queueIndex = 0;

const AddToQueue = el => {
    if(!printQueue.includes(el))
        printQueue.push(el);
};

const ClearQueue = () => {
    printQueue.splice(0, printQueue.length);
};

const RemoveFromQueue = el => {
    if(printQueue.includes(el))
    {
        const index = printQueue.indexOf(el);
        printQueue.splice(index, 1);
    }
};

const PrintLoop = async (dirPath, pdf, printWindow) => {
    await Print(printQueue[queueIndex], pdf, dirPath).then(async saved => {
        if(saved && queueIndex == printQueue.length - 1)
        {
            queueIndex = 0;
            printWindow.close();
        }
        else
        {
            queueIndex++;
            await printWindow.loadFile(`./html/docs-to-print/${printQueue[queueIndex]}.html`, { hash: 'print' });
        }
    }).catch(() => {
        queueIndex = 0;
        printWindow.close();
    });
};

const Print = async (fileName, data, dirPath, win) => {
    let options = {};

    switch(fileName)
    {
        case 'zawiadomienie':
        case 'weekendA5':
            options = {
                pageSize: 'A4',
                landscape: false
            };
            break;

        case 'miesny':
        case 'potykacz':
            options = {
                pageSize: 'A3',
                landscape: false,
            };
            break;

        case 'weekendA4':
            options = {
                pageSize: 'A4',
                landscape: true,
            };
            break;

        case 'potykaczS4':
            options = {
                pageSize: 'A3',
                landscape: true,
            };
            break;
    }

    if(!fs.existsSync(dirPath))
            fs.mkdirSync(dirPath).catch(err => {
                return Promise.reject(err);
            });
    
    let date = new Date();
    let day = ("0" + date.getDate()).slice(-2);
    let month = `0${date.getMonth() + 1}`.slice(-2);
    let year = date.getFullYear();

    date = `${year}-${month}-${day}`;

    const dir = path.join(dirPath, date);

    if(!fs.existsSync(dir))
        fs.mkdirSync(dir).catch(err => {
            return Promise.reject(err);
        });

    const pdfPath = path.join(dir, `${fileName}.pdf`);
    await data.webContents.printToPDF(options).then(data => {
        fs.writeFile(pdfPath, data, err => {
            if(err)
                console.log(err.message);

            console.log(`Saved file: ${fileName}`);
        });
    });
 
    return await Promise.resolve(true);
};

module.exports.PrintLoop = PrintLoop;
module.exports.AddToQueue = AddToQueue;
module.exports.RemoveFromQueue = RemoveFromQueue;
module.exports.ClearQueue = ClearQueue;

//TODO: Remove
module.exports.printQueue = printQueue;

/*Print(printQueue[queueIndex], pdf).then(saved => {
        if(saved && queueIndex == printQueue.length - 1)
        {
            printWindow.close();
            bIsPrintWindowOpen = false;
            queueIndex = 0;
            win.webContents.send('saved-pdfs');
            shell.openPath(dirPath);
        }
        else
        {
            queueIndex++;
            printWindow.loadFile(`./html/docs-to-print/${printQueue[queueIndex]}.html`);
        }
    });*/

   /* function loaded(){

    }

    if(img.complete)
        loaded();
    else
        img.addEventListener('load');*/