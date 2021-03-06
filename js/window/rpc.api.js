/**
 * Created with JetBrains PhpStorm.
 * Date: 11/15/17
 * Time: 5:20 PM
 * To change this template use File | Settings | File Templates.
 */


$RPC = new Object();
$RPC.Api = new Object();


function _getRandomPort(n) {
    var charSet = '0123456789';
    var randomString = '66';
    for (var i = 0; i < n; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function _getPaymentId() {
    return generateHexString(64);
}

function generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
        ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0,length);
}

$RPC.Api.GetBalance = function(onSuccess, onError){
    const postData = {"method":"getbalance"};
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

// $RPC.Api.GetTransfers(true,true,true,true,true);
$RPC.Api.GetTransfers = function(t_it, t_out, t_pending, t_failed, t_pool, t_min, t_max, onSuccess, onError){
    const postData = {"method":"get_transfers",
        "params":{
            "in":t_it,
            "out":t_out,
            "pending":t_pending,
            "failed":t_failed,
            "pool":t_pool}
        };

    if(t_min!=0){
        postData.params.min_height = t_min;
        postData.params.filter_by_height = true;
    }

    if(t_max!=0){
        postData.params.max_height = t_max;
        postData.params.filter_by_height = true;
    }

    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

//$RPC.Api.Transfer(5000000000000, '43xoo18sieLXp3h1bDvhpCZV5CPvwDgBuh54jWns8oqyUHsAf4GfzcqWqJ2Ykf7vMv4G7u1YB7RXh9CLjf7nTdySFMkhVJK', '', 1)
$RPC.Api.Transfer = function(amount, address, paymentId, mixIn, onSuccess, onError){

    amount = parseInt(amount);
    paymentId = (paymentId=='')?  "0000000000000000" : paymentId;
    mixIn = (mixIn<7)? 7 : mixIn;
    var fee = 1800000000;

    var postData = {"method":"transfer_split",
        "params":{
            "destinations": [{"amount": amount,
                "address" : address}],
            "mixin" : mixIn,
            "priority":0,
            "unlock_time":0,
            "fee":fee
        }
    };

    if(address.length == 95){
        postData.params.payment_id =paymentId;
    }

    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.Save = function(range, onSuccess, onError){
    const postData = {"method":"store",
        "params":{}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

// $RPC.Api.GetAdressBook([1,2,3])
$RPC.Api.GetAdressBook = function(range, onSuccess, onError){
    const postData = {"method":"get_address_book",
        "params":{entries:range}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};


$RPC.Api.AddAdressBook = function(address, payment_id, description, onSuccess, onError){
    const postData = {"method":"add_address_book",
        "params":{
            address:address,
            payment_id:payment_id,
            description:description
        }
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.DeletedressBook = function(index, onSuccess, onError){
    const postData = {"method":"add_address_book",
        "params":{
            index:index
        }
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.GetAddress = function(onSuccess, onError){
    const postData = {"method":"getaddress",
        "params":{ }
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

//$RPC.Api.WalletCreate('mytestpassword', '0000')
$RPC.Api.WalletCreate = function(password, pin, onSuccess, onError){
    const postData = {"method":"create_wallet",
        "params":{
            "filename":'',
            "password":password,
            "pin" : pin,
            "language":"English"}
    };

    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

//$RPC.Api.WalletOpen('default')
$RPC.Api.WalletOpen = function(filename, password, pin, onSuccess, onError){
    const postData = {"method":"open_wallet",
        "params":{
            "filename":filename,
            "password":password,
            "pin" : pin,
            "language":"English"}
    };

    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.ShowKey = function( onSuccess, onError){
    const postData = {"method":"query_key",
        "params":{
            "key_type":"mnemonic"}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.RescanSpent = function( onSuccess, onError){
    const postData = {"method":"rescan_spent",
        "params":{}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.GetHeight = function( onSuccess, onError){
    const postData = {"method":"getheight",
        "params":{}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.StartMining = function(threads, onSuccess, onError){
    const postData = {"method":"start_mining",
        "params":{"threads_count":parseInt(threads),"do_background_mining":false,"ignore_battery":true}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};

$RPC.Api.StopMining = function(onSuccess, onError){
    const postData = {"method":"stop_mining",
        "params":{}
    };
    $RPC.Api.rpcWalletSend(postData, onSuccess, onError);
};


//RPC API core methods
$RPC.Api.rpcWalletSend = function(args, callback, onError){
    var msg_id = +_getRandomPort(34);
    ipcRenderer.send('async', {
        "action" : "rpc-wallet",
        "body" : args,
        "msg_id" : msg_id
    });

    ipcRenderer.on('async-reply-'+msg_id, (event, arg) => {
        console.log(arg);
    if(typeof arg.error =='object'){
        if(typeof onError=="function") onError(arg.error.code, arg.error.message);
    } else {
        if(typeof callback=="function") callback(arg);
    }

});
};

$RPC.Api.rpcDeamonConsoleSend = function(args, callback){
    var msg_id = +_getRandomPort(34);
    ipcRenderer.send('async', {
        "action" : "rpc-deamon-console-sync",
        "body" : args,
        "msg_id" : msg_id
    });

    ipcRenderer.on('async-reply-'+msg_id, (event, arg) => {
        if(typeof callback=="function") callback(arg);
});
};

$RPC.Api.rpcMainConsoleSend = function(args, callback){
    var msg_id = +_getRandomPort(34);
    ipcRenderer.send('async', {
        "action" : "main-action",
        "body" : args,
        "msg_id" : msg_id
    });

    ipcRenderer.on('async-reply-'+msg_id, (event, arg) => {
        if(typeof callback=="function") callback(arg);
});
};

$RPC.Api.mainProcessSend = function(args, callback, onError){
    var msg_id = +_getRandomPort(34);
    ipcRenderer.send('async', {
        "action" : "main-action",
        "body" : args,
        "msg_id" : msg_id
    });

    ipcRenderer.on('async-reply-'+msg_id, (event, arg) => {
        //console.log(arg);
    if(typeof arg.error =='object'){
        if(typeof onError=="function") onError(arg.error.code, arg.error.message);
    } else {
        if(typeof callback=="function") callback(arg);
    }

});
};

