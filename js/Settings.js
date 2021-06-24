const path = require('path');
const os = require('os');
const fs = require('fs');

const settingsDir = path.join(os.homedir(), "Documents", "PSS-Promocje");
const settingsPath = path.join(settingsDir, 'settings.json');

const CreateSettingsFile = () => {
    const settings = {
        firstRun: true,
        licenseAccepted: false,
        experimental: false,
        saveLocation: null,
        background: null,
        saveWithBG: false
    };

    if(!fs.existsSync(settingsDir))
        fs.mkdirSync(settingsDir);

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

const ReadSettings = () => {
    if(!fs.existsSync(settingsPath))
        CreateSettingsFile();

    let settings = fs.readFileSync(settingsPath);
    settings = JSON.parse(settings);

    settings = ValidateSettings(settings);
    
    return settings;
};

const ValidateSettings = settings => {
    if(settings.firstRun == undefined)
        settings.firstRun = true;

    if(settings.licenseAccepted == undefined)
        settings.licenseAccepted = false;

    if(settings.experimental == undefined)
        settings.experimental = false;

    if(settings.saveLocation == undefined)
        settings.saveLocation = null;

    if(settings.background == undefined)
        settings.background = null;

    if(settings.saveWithBG == undefined)
        settings.saveWithBG = false;

    WriteSettings(settings);

    return settings;
}

const UpdateSettings = () => {
    const settings = ReadSettings();

    settings.firstRun = true;
    settings.licenseAccepted = false;
    settings.experimental = false;

    WriteSettings(settings);
};

const WriteSettings = settings => {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

module.exports.ReadSettings = ReadSettings;
module.exports.WriteSettings = WriteSettings;
module.exports.UpdateSettings = UpdateSettings;