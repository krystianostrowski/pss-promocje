const { BrowserWindow, ipcMain, app, autoUpdater, shell, Menu, globalShortcut, dialog } = require('electron');
const { version } = require('./package.json');
const path = require('path');
const os = require('os');
const fs = require('fs');
let options = require('./assets/options.json');
const { PrintLoop, AddToQueue, RemoveFromQueue, printQueue } = require('./js/PrintSystem');

let win;
let printWindow;
let bIsPrintWindowOpen = false;
let data;
let date;

const isDev = process.env.DEV ? (process.env.DEV.trim() == 'true') : false;
let dirPath = options.experimental ? options.saveLocation : path.join(os.homedir(), 'Desktop', 'weekend');
const optionsDir = path.join(__dirname, 'assets', 'options.json');

if(options.experimental)
    AddToQueue('weekendA5');

if(options.firstRun)
{
    options.firstRun = false;
    fs.writeFileSync(optionsDir, JSON.stringify(options, null, 2));
}

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

if(!isDev && !options.firstRun)
{
    autoUpdater.setFeedURL('http://krystian-ostrowski.webd.pro/update/weekend/');
    autoUpdater.checkForUpdates();
}
//#endregion

const GetSavePath = () => {
    let savePath = dialog.showOpenDialogSync(win, { properties: ['openDirectory', 'promptToCreate']});

    if(savePath != undefined)
    {
        savePath = savePath[0];
    }
    else
    {
        savePath = (dirPath == null) ? path.join(os.homedir(), 'Desktop', 'weekend') : dirPath;
    }
    
    options.saveLocation = savePath;
    fs.writeFileSync(optionsDir, JSON.stringify(options, null, 2));

    return savePath;
}

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
                            dirPath = GetSavePath();
                            options.saveLocation = dirPath;
                        }

                        AddToQueue('weekendA5');
                        win.loadFile('./html/main-window/index-experimental.html');
                    }
                    else if(!options.experimental)
                    {
                        options.saveLocation = null;

                        RemoveFromQueue('weekendA5');
                        win.loadFile('./html/main-window/index.html');
                    }

                    fs.writeFileSync(optionsDir, JSON.stringify(options, null, 2));
                    if(!isDev)
                    {
                        app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])});
                        app.exit(0);
                    }
                }
            }
        ]
    }
];

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
        win.loadFile('./html/main-window/index-experimental.html');
    else
        win.loadFile('./html/main-window/index.html');

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
        dirPath = GetSavePath();

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

            window.loadFile('./html/docs-to-print/' + printQueue[i] + '.html');
            window.openDevTools();
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
        printWindow.loadFile('./html/docs-to-print/zawiadomienie.html');

        if(isDev)
            printWindow.webContents.openDevTools({mode: 'undocked'});

        bIsPrintWindowOpen = true;

        printWindow.on('close', () => {
            win.webContents.send('saved-pdfs');
            shell.openPath(dirPath);
            bIsPrintWindowOpen = false;
        });

        /*printWindow.webContents.on('render-process-gone', async event => {
            const pdf = BrowserWindow.fromWebContents(event.sender);

            await PrintLoop(dirPath, pdf, printWindow);
        });*/
    }
});

ipcMain.on('get-data', event => {
    event.sender.send('sent-data', { data, date});
});

ipcMain.on('get-options', event => {
    event.reply('render-options', options)
})

ipcMain.on('update-options', (event, args) => {
    options = args;
    fs.writeFileSync(optionsDir, JSON.stringify(options, null, 2));
});

ipcMain.on('open-dir-dialog', (event, args) => {
    dirPath = GetSavePath();
    event.reply('update-path', dirPath);
});

ipcMain.on('upload-image', (event, arg) => {
    const file = dialog.showOpenDialogSync(win, { filters: [ { name: "Images", extensions: ['png'] } ], properties: ['openFile'] });

    event.reply('image-uploaded', {id: arg, path: file });
});

ipcMain.on('print-to-pdf', async event => {
    const pdf = BrowserWindow.fromWebContents(event.sender);

    //const pdf = printWindow.webContents;

    await PrintLoop(dirPath, pdf, printWindow);
});

autoUpdater.on('update-available', () => win.loadFile('./html/main-window/update.html'));

autoUpdater.on('update-downloaded', () => {
    win.webContents.send('downloaded-update');
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('restart-app', () => {
    app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])});
    app.exit(0);
});