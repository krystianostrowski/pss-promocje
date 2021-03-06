const { BrowserWindow, ipcMain, app, autoUpdater, shell, Menu, globalShortcut, dialog } = require('electron');
const { version, author } = require('./package.json');
const options = require('./assets/options.json');
const path = require('path');
const os = require('os');
const fs = require('fs');

let win;
let printWindow;
let bIsPrintWindowOpen = false;
const printQueue = ['zawiadomienie', 'miesny', 'weekendA4', 'potykacz', 'potykaczS4'];
let queueIndex = 0;
let data;
let date;

const isDev = process.env.DEV ? (process.env.DEV.trim() == 'true') : false;
const dirPath = path.join(os.homedir(), 'Desktop', 'weekend');

if(options.experimental && !printQueue.includes('weekendA5'))
    printQueue.push('weekendA5');

//#region squirrel/updater
const handleSquirrelEvent = () => {
    if(process.env.length === 1)
        return false;

    const ChildProcess = require('child_process');
    const squirrelEvents = process.argv[1];

    const appDir = path.resolve(process.execPath, '..');
    const rootAtomDir = path.resolve(appDir, '..');
    const updateDotExe = path.resolve(path.join(rootAtomDir, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = (command, args) => {
        let spawnedProcess;

        try
        {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true });
        }
        catch(error)
        {
            return console.log(error);
        }

        return spawnedProcess;
    }

    const spawnUpdate = args => {
        return spawn(updateDotExe, args);
    }

    switch(squirrelEvents)
    {
        case '--squirrel-install':
        case '--squirrel-updated':
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
};

if(handleSquirrelEvent())
    return;

if(!isDev)
{
    autoUpdater.setFeedURL('http://krystian-ostrowski.webd.pro/update/weekend/');
    autoUpdater.checkForUpdates();
}
//#endregion

const menuTemplate = [
    {
        label: "Dev-Options",
        submenu: [
            {
                id: 1,
                label: 'Enable experimental features',
                type: 'checkbox',
                checked: options.experimental,
                click: () => {
                    options.experimental = menu.getMenuItemById(1).checked;

                    if(options.experimental)
                    {
                        if(options.saveLocation == null)
                        {
                            if(win)
                                dialog.showOpenDialogSync(win, {});
                        }

                        if(!printQueue.includes('weekendA5'))
                        {
                            printQueue.push('weekendA5');
                            win.loadFile('./html/index-experimental.html');
                        }
                    }
                    else if(!options.experimental)
                    {
                        options.saveLocation = null;

                        if(printQueue.includes('weekendA5'))
                        {
                            printQueue.splice(-1, 1);
                            win.loadFile('./html/index.html');
                        }
                    }

                    fs.writeFileSync('./assets/options.json', JSON.stringify(options, null, 2));
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

const RegisterShortcuts = () => {
    if(isDev)
    {
        globalShortcut.register('F5', () => {
            win.reload();
        });
    
        globalShortcut.register('F6', () => {
            win.openDevTools();
        });
    }
    
    globalShortcut.register('CmdOrCtrl+P', () => {
        win.webContents.send('print-shortcut');
    });
};

const CreateWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: true,
        darkTheme: true,
        title: `Promocja weekendowa v${version}`,
        autoHideMenuBar: false,
        webPreferences: {
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    if(options.experimental)
        win.loadFile('./html/index-experimental.html');
    else
        win.loadFile('./html/index.html');

    if(isDev)
        win.webContents.openDevTools({mode: 'undocked'});

    win.on('closed', () => {
        if(bIsPrintWindowOpen)
            printWindow.close();
    });
};

app.whenReady().then(() => {
    CreateWindow();
    RegisterShortcuts();

    if(options.saveLocation == null && options.experimental)
        dialog.showOpenDialogSync(win, {});

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length == 0)
            CreateWindow();
    });

    app.on('will-quit', () => globalShortcut.unregisterAll());

    app.on('window-all-closed', () => {
        if(process.platform !== 'darwin')
            app.quit();
    });    
});

ipcMain.on('open-print-window', (event, args) => {
    data = args.data;
    date = args.date;

    //TODO: Redo print events to remove bugs with displaying windows in dev mode
    /*if(isDev)
        for(let i = 0; i < printQueue.length; i++)
        {
            const window = new BrowserWindow({
                width: 800,
                height: 400,
                webPreferences: {
                    devTools: true,
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });

            window.loadFile('./html/' + printQueue[i] + '.html');
        }*/

    if(!bIsPrintWindowOpen)
    {
        printWindow = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: true,
            webPreferences: {
                devTools: true,
                nodeIntegration: true,
                contextIsolation: false
            }
        });
    
        printWindow.hide();
        printWindow.loadFile('./html/zawiadomienie.html');

        if(isDev)
            printWindow.webContents.openDevTools({mode: 'undocked'});

        bIsPrintWindowOpen = true;
    }
});

ipcMain.on('get-data', event => {
    event.sender.send('sent-data', {data: data, date: date});
})

ipcMain.on('print-to-pdf', event => {
    const pdf = BrowserWindow.fromWebContents(event.sender);

    Print(printQueue[queueIndex], pdf).then(saved => {
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
            printWindow.loadFile(`./html/${printQueue[queueIndex]}.html`);
        }
    });
});

autoUpdater.on('update-available', () => win.loadFile('./html/update.html'));
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    win.webContents.send('downloaded-update');
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

const OpenPrintWindow = data => {

};

const Print = async (fileName, data) => {
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
        fs.mkdirSync(dirPath);
    
    let date = new Date();
    let day = ("0" + date.getDate()).slice(-2);
    let month = `0${date.getMonth() + 1}`.slice(-2);
    let year = date.getFullYear();
    /*let hour = ("0" + date.getHours()).slice(-2);
    let min = ("0" + date.getMinutes()).slice(-2);
    let sec = ("0" + date.getSeconds()).slice(-2);*/

    date = `${year}-${month}-${day}`;

    const dir = path.join(dirPath, date);

    if(!fs.existsSync(dir))
        fs.mkdirSync(dir);

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