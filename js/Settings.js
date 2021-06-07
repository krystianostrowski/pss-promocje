const path = require('path');
const os = require('os');
const fs = require('fs');

const settingsDir = path.join(os.homedir(), "Documents", "PSS-Promocje");
const settingsPath = path.join(settingsDir, 'settings.json');

const CreateSettingsFile = () => {
    const settings = {
        firstRun: true,
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
    return settings;
};

const WriteSettings = settings => {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

module.exports.ReadSettings = ReadSettings;
module.exports.WriteSettings = WriteSettings;