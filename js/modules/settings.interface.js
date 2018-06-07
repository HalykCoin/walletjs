/**
 * Created with JetBrains PhpStorm.
 * Date: 11/18/17
 * Time: 4:22 PM
 * To change this template use File | Settings | File Templates.
 */

const fs = require('fs')
var currentAppPath = "";

const _setting_default ={
    "wallet_name" : "",
    "wallet_password" : "",
    "languages_available" : ["en", "ru", "es", "sv", "fr", "kk"],
    "language_current" : "en"
};

module.exports.init = function(appPath){
    initFileSystem(appPath);
    currentAppPath = appPath;
};

module.exports.getSetting = function(){
    var contents = fs.readFileSync(currentAppPath+'/settings.json').toString();
    var settings = JSON.parse(contents);
    return settings;
};

module.exports.setSetting = function(settings){
    var current_settings = module.exports.getSetting();
    if(current_settings==''){
        settings = Object.assign({},_setting_default, settings);
    } else {
        settings = Object.assign({},current_settings, settings);
    }

    fs.writeFileSync(currentAppPath+'/settings.json', JSON.stringify(settings));

    console.log("Settings file has been updated: "+JSON.stringify(settings));

    return true;
};

function initFileSystem(appPath){
    if (fs.existsSync(appPath)) {
        //Initialization of settings.json
        try{
            fs.accessSync(appPath+'/settings.json', fs.R_OK | fs.W_OK)
            console.log("Settings file exists");
        }catch(e){
            fs.mkdir(appPath);
            fs.writeFileSync(appPath+'/settings.json', JSON.stringify(_setting_default));
            console.log("Create new settings file");
        }
    } else {
        fs.mkdir(appPath);
        fs.writeFileSync(appPath+'/settings.json', JSON.stringify(_setting_default));
        console.log("Create new settings file");
    }
}
