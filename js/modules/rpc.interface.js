/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 8:48 PM
 * To change this template use File | Settings | File Templates.
 */

const http = require('http');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

var rpcDeamonPort = 19237;
var rpcServer =null;
var blockchainServer;
var rpcServerIsReady = false;

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



function init(appFolder, onReady, onNetworkSync, onFail) {
    //exec('killall -9 monero-wallet-rpc');

    const args = [
        "--wallet-dir="+appFolder,
        "--rpc-bind-ip=127.0.0.1",
        "--rpc-bind-port="+rpcPort,
        "--disable-rpc-login"
    ];
    //./build/release/bin/monero-wallet-rpc --wallet-file=test --rpc-bind-ip 127.0.0.1 --rpc-bind-port 18082 --disable-rpc-login
    blockchainServer = spawn('./server/build/release/bin/monerod');


    blockchainServer.stdout.on('data', (data) => {
        var blockchainServerOutput = `${data}`;

        var syncProcess = /Synced\s([0-9]{1,50})\/([0-9]{1,50})/gi;
        var found = syncProcess.exec(blockchainServerOutput);

        if(found && typeof found[1] != "undefined" && found[2] != "undefined" ){
            if(typeof onNetworkSync == "function") onNetworkSync( parseInt(found[1]), parseInt(found[2]));
        }

        if(blockchainServerOutput.search("You may now start monero-wallet-cli.")>0){
            console.log(`${data}`);

            rpcServer = spawn('./server/build/release/bin/monero-wallet-rpc', args);

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
    //console.log("Sending SIGHUP signal to the deamon");

    stopHalykcoinDeamon(function(){
        console.log("Halykcoin deamon is shouted down");
        rpcServer.kill('SIGKILL');
        process.exit();
    }, function(){
        console.log("Can't stop the deamon in normal way. Trying to kill the process");
        rpcServer.kill('SIGKILL');
        blockchainServer.kill('SIGKILL');
        process.exit();
    });


    //blockchainServer.stdin.write("exit");
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

   // req.write(postData);
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

    console.log("Post data:"+postData);
    req.write(postData);
    req.end();
}



module.exports.init = init;
module.exports.request = request;
module.exports.interface = $interface;
module.exports.destroy = destroy;