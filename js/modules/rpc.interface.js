/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 8:48 PM
 * To change this template use File | Settings | File Templates.
 */
const DEV = false;
var settings = null;
var colors = require('colors/safe')
const http = require('http');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const crypto = require('crypto');
const fs = require('fs')
var encryptionMethod = 'aes-256-ctr';

var rpcDeamonPort = 19237;
var rpcServer =null;
var blockchainServer;
var rpcServerIsReady = false;

var blockchainServerExec = './server/build/release/bin/halykcoind';
var rpcServerExec = './server/build/release/bin/halykcoin-wallet-rpc';

const os = require('os');
if(os.platform() == 'win32'){
    blockchainServerExec = './server/halykcoind';
    rpcServerExec = './server/halykcoin-wallet-rpc';
}

const _defaultRpcHeaders = {"jsonrpc":"2.0", "id":"0"};

function _getRandomPort() {
    var charSet = '0123456789';
    var randomString = '6';
    for (var i = 0; i < 3; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function _geenerateWalletName() {
    var charSet = 'AQEYUIOJ0123456789';
    var randomString = '';
    for (var i = 0; i < 32; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

const rpcPort = _getRandomPort();

console.log("Current RPC deamon port is: "+rpcPort);


$interface = new Object();
$interface.createWallet = function(params, onSuccess, onError){
    var method="create_wallet";

    var _default_params = {
        "filename":"default",
        "password":"",
        "language":"English"
    };

    var request = Object.assign(_default_params, _defaultRpcHeaders, params);

    request(request, onSuccess, onError);
};



function init(appFolder, incommingSettings, onReady, onNetworkSync, onFail) {

    settings = incommingSettings;

    //settings.init(appFolder);
    initFileSystem(appFolder);

    currentSettings = settings.getSetting();

    const args = [
        "--wallet-dir="+appFolder+"/wallets",
        "--rpc-bind-ip=127.0.0.1",
        "--rpc-bind-port="+rpcPort,
        "--disable-rpc-login"
    ];
    //./build/release/bin/monero-wallet-rpc --wallet-file=test --rpc-bind-ip 127.0.0.1 --rpc-bind-port 18082 --disable-rpc-login

    var nodeArgs = [];
    if(DEV) nodeArgs.push("--add-priority-node=192.168.1.200");

    blockchainServer = spawn(blockchainServerExec, nodeArgs);


    blockchainServer.stdout.on('data', (data) => {
        var blockchainServerOutput = `${data}`;

        var syncProcess = /Synced\s([0-9]{1,50})\/([0-9]{1,50})/gi;
        var found = syncProcess.exec(blockchainServerOutput);

        if(found && typeof found[1] != "undefined" && found[2] != "undefined" ){
            if(typeof onNetworkSync == "function") onNetworkSync( parseInt(found[1]), parseInt(found[2]));
        }

        if(blockchainServerOutput.search("You may now start monero-wallet-cli.")>0 || blockchainServerOutput.search("You may now start halykcoin-wallet-cli.")>0 ){
            console.log(`${data}`);

            rpcServer = spawn(rpcServerExec, args);

            rpcServer.stdout.on('data', (data) => {
                var rpcServerOutput = `${data}`;

                if(rpcServerOutput.search("Starting wallet rpc server")>0){
                    rpcServerIsReady = true;
                    console.log(`${data}`);

                    if(typeof onReady=="function") onReady();
                }
            });

            rpcServer.stderr.on('data', (data) => {
                                console.log(`stderr: ${data}`);
                        });

            rpcServer.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        }

        if(blockchainServerOutput.search("The daemon will start synchronizing with the network")>0){
            console.log(`${data}`);
            //if(typeof onNetworkSync=="function") onNetworkSync();
        }

        if(blockchainServerOutput.search("ERROR")>0){
            console.log(`${data}`);
            if(typeof onFail=="function") onFail();
        }


    });

    blockchainServer.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

    blockchainServer.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
}


function destroy(){
    stopHalykcoinDeamon(function(){
        console.log("Halykcoin deamon is shouted down");
        if(rpcServer != null) rpcServer.kill('SIGKILL');
        process.exit();
    }, function(){
        console.log("Can't stop the deamon in normal way. Trying to kill the process");
        if(rpcServer != null) rpcServer.kill('SIGKILL');
        if(blockchainServer != null) blockchainServer.kill('SIGKILL');
        process.exit();
    });
}

function stopHalykcoinDeamon(onSuccess, onError){
    var options = {
        host: '127.0.0.1',
        port: rpcDeamonPort,
        path: '/stop_daemon',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        if(typeof onSuccess=="function") res.on('data', onSuccess);
    });

    if(typeof onError=="function") req.on('error', onError);

    req.end();
}

function stopRpcWalletDeamon(onSuccess,onError){
    request({"method":"stop_wallet"}, onSuccess, onError);
}

function request(request, onSuccess, onError){
    if(!rpcServerIsReady){
        if(typeof onError=="function")  onError({"m":"RPC server is not ready"});
        return;
    }

    if(request.method == 'open_wallet'){
        if(typeof request.params.pin =="string"){

            if(request.params.filename ==''){
                request.params.filename = currentSettings.wallet_name;
            }

            request.params.password = decrypt(currentSettings.wallet_password, request.params.pin)
        } else {
            if(typeof onError=="function") req.on('error', onError);
        }
    }

    if(request.method == 'create_wallet'){
        if(typeof request.params.pin =="string"){
            currentSettings.wallet_password =  encrypt(request.params.password, request.params.pin);
            if(request.params.filename ==''){
                request.params.filename = _geenerateWalletName();
                currentSettings.wallet_name = request.params.filename;
            }

            settings.setSetting(currentSettings);
            console.log("New wallet has been generated. Wallet name: "+request.params.filename+ " Wallet password: "+
                currentSettings.wallet_password);
        }  else {
            if(typeof onError=="function") req.on('error', onError);
        }
    }

    Object.assign( _defaultRpcHeaders, request);

    const postData = JSON.stringify(request);

    var options = {
        host: '127.0.0.1',
        port: rpcPort,
        path: '/json_rpc',
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        if(typeof onSuccess=="function") res.on('data', onSuccess);
    });

    if(typeof onError=="function") req.on('error', onError);

    console.log("Post data:"+colors.green(postData));
    req.write(postData);
    req.end();
}

function initFileSystem(appPath){
    if (fs.existsSync(appPath)) {
        if (!fs.existsSync(appPath+"/wallets")) {
            fs.mkdir(appPath+"/wallets");
        }

    } else {
        fs.mkdir(appPath);
        fs.mkdir(appPath+"/wallets");
        console.log("Create wallet folder");
    }
}

function encrypt(password_plain, pin){
    var cipher = crypto.createCipher(encryptionMethod, pin)
    var crypted = cipher.update(password_plain,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(password_encrypted, pin){
    var decipher = crypto.createDecipher(encryptionMethod, pin)
    var dec = decipher.update(password_encrypted,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


module.exports.init = init;
module.exports.request = request;
module.exports.interface = $interface;
module.exports.destroy = destroy;