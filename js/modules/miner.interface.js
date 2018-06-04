/**
 * Created with JetBrains PhpStorm.
 * Date: 02/26/18
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
const appSettings = require('node-app-settings')
var jsonSetting = appSettings.create('settings.json', 'JSON');
let config = jsonSetting.config;

var minerExecutive =null;
var isRunning = false;
var miner_output = [];


function init(params, onReady, onNetworkSync, onFail) {


    if(isRunning){
        if(typeof onFail=="function") onFail();
        return;
    }
    isRunning = true;

    var incomingParams = Object.assign({
        "cpuThreads" : 1,
        "walletAddress" : "",
        "poolAddress" : config.poolAddress
    }, params);

    prepareConfigs(incomingParams);

    const args = [
        "--poolconf",
        "bin/pool.txt",

        "--cpu",
        "bin/cpu.txt",

        "--config",
        "bin/config.txt",

        "--currency",
        "monero7",

        "--user",
        incomingParams.walletAddress,

        "--pass",
        "x",

        "--url",
        incomingParams.poolAddress

    ];

    if(minerExecutive != null) minerExecutive.kill('SIGKILL');
    minerExecutive = spawn(config.minerExec, args);

    minerExecutive.stdout.on('data', (data) => {
        console.log(`${data}`);
        miner_output.push(data.toString());
        if(typeof onReady=="function") onReady();
        isRunning = true;
    });

        minerExecutive.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        minerExecutive.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

    minerExecutive.stdin.on('data', function(data){
        console.log('stdin:'+data);
    });

    if(typeof onReady=="function") onReady();
}


function destroy(){
    if(minerExecutive != null) minerExecutive.kill('SIGKILL');
    isRunning = false;
    minerExecutive = null;
}

function getOutput(){
    var return_miner_output = miner_output;
    miner_output = [];
    return return_miner_output;
}

function prepareConfigs(params){


    var incomingParams = Object.assign({
        "cpuThreads" : 1,
        "walletAddress" : "",
        "poolAddress" : config.poolAddress
    }, params);


    let cpu_s = {"cpu_threads_conf" :[]};
    let pool_s = {"pool_list" :
        [
            {"pool_address" : params.poolAddress, "wallet_address" : params.walletAddress, "rig_id" : "", "pool_password" : "", "use_nicehash" : false, "use_tls" : false, "tls_fingerprint" : "", "pool_weight" : 1 },
        ],
        "currency" : "monero7"
    };


    for(var i=0; i<params.cpuThreads; i++){
        cpu_s.cpu_threads_conf.push({ "low_power_mode" : (i==0), "no_prefetch" : true, "affine_to_cpu" : i })
    }

    let cpus_s_data = JSON.stringify(cpu_s).substring(1, JSON.stringify(cpu_s).length-1) + ",";
    let pool_s_data = JSON.stringify(pool_s).substring(1, JSON.stringify(pool_s).length-1) +",";

    fs.writeFileSync('bin/cpu.txt', cpus_s_data, 'utf8');
    fs.writeFileSync('bin/pools.txt', pool_s_data, 'utf8');
    fs.writeFileSync('bin/pool.txt', pool_s_data, 'utf8')
}


module.exports.init = init;
module.exports.destroy = destroy;
module.exports.getOutput = getOutput;