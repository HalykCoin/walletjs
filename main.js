const electron = require('electron')
const {ipcRenderer} = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const http = require('http')
const rpc = require('./js/modules/rpc.interface.js')
const miner = require('./js/modules/miner.interface.js')
//const db = require('./js/modules/database.interface.js')
const settings = require('./js/modules/settings.interface.js')
const os = require('os');
const {Menu} = require('electron')
const DEBUG = true;
const APP_FOLDER = app.getPath("home")+ "/.walletjs";

var {ipcMain} = electron;
var defaultWallet = "default";
var sync = {"sync_current":0, "sync_target":0 , "ready" : false};

console.log("Folder path:"+app.getPath("documents"));

//**********SETTINGS  INITIALIZATION********************

settings.init(APP_FOLDER);
var settingsObj = settings.getSetting();
console.log(settingsObj);

//**********DATABASE  INITIALIZATION********************
//db.initDb(APP_FOLDER, function(){
//    console.log("Database inited");
//});


//**********RPC DEMON INITIALIZATION********************
rpc.init(APP_FOLDER, settings, function(){

    //When demon is ready
    console.log("RPC deamon is ready");
    sync.ready = true;

}, function(sync_current, sync_targert){
    //When deamon is in the synchronization process

    sync.sync_current =  sync_current;
    sync.sync_target =  sync_targert;
    sync.ready =  false;

}, function(){
    console.log("An unknown error occurred during RPC initialization");
});


var contextMenu = Menu.buildFromTemplate([

    { label: 'Show App', click:  function(){
        mainWindow.show();
    } },
    { label: 'Quit', click:  function(){
        application.isQuiting = true;
        application.quit();

    } }
]);



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 1100, height: 700 ,
      frame: false, resizable: false,
      title: "Halykcoin",
      icon: path.join(__dirname, 'images/icons/hlc-icon-128.png')})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
      require('./js/modules/rpc.interface.js').destroy();
    mainWindow = null
  })
}

electron.app.on('browser-window-created',function(e,window) {
   if(!DEBUG) window.setMenu(null);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

  require('./js/modules/rpc.interface.js').destroy();
  if (process.platform !== 'darwin') {
    app.quit()
  }

})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



//RPC listener
ipcMain.on('async', (event, arg) => {
    if(typeof(arg.action) != "undefined"){
        if(arg.action == "rpc-wallet" && typeof arg.body =="object"){
            rpc.request(arg.body, function(resp){

                var responce = null;
                try {

                    console.log("responce:");
                    console.log(resp);

                    responce =JSON.parse(resp);
                    responce['request'] = arg.body;
                }
                catch (e) {

                    event.sender.send('async-reply-'+arg.msg_id, {"error":{"message":"JSON parse error"}});
                }

                console.log(responce);
                event.sender.send('async-reply-'+arg.msg_id, responce);
            }, function(m){
                event.sender.send('async-reply-'+arg.msg_id, m);
            });
        }

        if(arg.action == "rpc-deamon-console-sync" && typeof arg.body =="object"){
            //console.log(sync);
            event.sender.send('async-reply-'+arg.msg_id, sync);
        }

        if(arg.action == "main-action" && typeof arg.body =="object"){
            if(arg.body.method == 'get_settings'){
                event.sender.send('async-reply-'+arg.msg_id, settings.getSetting());
            }

            if(arg.body.method == 'get_cpu'){
                event.sender.send('async-reply-'+arg.msg_id, os.cpus() );
            }

            if(arg.body.method == 'miner'){
                if(typeof arg.body.action!="undefined"){
                    if(arg.body.action == 'start'){
                        miner.init({
                            "cpuThreads" : arg.body.cpuThreads,
                            "walletAddress" : arg.body.walletAddress,
                            "poolAddress" : arg.body.poolAddress
                        }, function(){
                            event.sender.send('async-reply-'+arg.msg_id, true );
                        }, function(){
                            event.sender.send('async-reply-'+arg.msg_id, 'working' );
                        }, function(){
                            event.sender.send('async-reply-'+arg.msg_id, false );
                        });
                    }
                    if(arg.body.action == 'stop'){
                        miner.destroy();
                    }

                    if(arg.body.action == 'status'){
                        var miner_output = miner.getOutput();
                        event.sender.send('async-reply-'+arg.msg_id, miner_output );
                    }
                }

            }
        }
    }
});