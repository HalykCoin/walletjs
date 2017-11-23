/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body.History = new Object();

$Window.Body.History.Init = function(){
    console.log("$Window.Body.History.Init");
    $Window.Body.History.Update();
};

$Window.Body.History.transfers = new Array();
$Window.Body.History.timeFormat = "DD-MM-YYYY HH:mm:ss";

$Window.Body.History._lastTransactionInTime = 0;

$Window.Body.History.Update = function(){
    //$Window.Body.History.transfers = [];

    $RPC.Api.GetHeight(function(res){
        if(res.result.height>1){
            $Window.Body._curentHeight = res.result.height;

            for(var i=$Window.Body._curentHeight+10; i>0; i=i-1000){
                var current_height = i;
                var target = ((current_height-1000)<0)? 0 : current_height-1000;
                //console.log("History for "+ target + " " + current_height);
                $RPC.Api.GetTransfers(true,true,true,true,true, target, current_height, function(res){
                    var transfers = $Window.Body.History.ExtractTransfers(res);
                    for(var i in transfers){
                        if(transfers[i].status == 'in' || transfers[i].status == 'pool'){
                            if($Window.Body.History._lastTransactionInTime < transfers[i].timestamp)
                                $Window.Body.History._lastTransactionInTime = transfers[i].timestamp;
                        }
                    }
                    $Window.Body.History.TransfersConcat(transfers);

                    $Window.Body.History.transfers.sort(function(a, b){
                        var keyA = a.timestamp,
                            keyB = b.timestamp;
                        // Compare the 2 dates
                        if(keyA < keyB) return -1;
                        if(keyA > keyB) return 1;
                        return 0;
                    });

                    $Window.Body.History.DrawTable();
                });
            }
        }
    });


    //windows_page_history_list
};


$Window.Body.History.TransfersConcat = function(transfers){
    if(transfers.length>0){
        for(var i in transfers){
            var in_list = false;
            for(var j in $Window.Body.History.transfers){
                if($Window.Body.History.transfers[j].txid == transfers[i].txid){

                    if($Window.Body.History.transfers[j].status == transfers[i].status ){
                        in_list = true;
                    } else {
                        $Window.Body.History.transfers[j] = transfers[i];
                    }

                    break;
                }
            }

            if(!in_list){
                $Window.Body.History.transfers.push(transfers[i]);
            }
        }
    }

};


$Window.Body.History.BackgroundUpdate = function(){
    $RPC.Api.GetTransfers(true,true,true,true,true, $Window.Body._curentHeight-100, $Window.Body._curentHeight+100, function(res){
        var transfers = $Window.Body.History.ExtractTransfers(res);

        for(var i in transfers){
            if(transfers[i].status == 'in' || transfers[i].status == 'pool'){
                if($Window.Body.History._lastTransactionInTime < transfers[i].timestamp){
                    $Window.Body.History._lastTransactionInTime = transfers[i].timestamp;

                    $Window.Notify.Add(
                        Mustache.render($Window.GetVar('incoming'), {"Amount": transfers[i].amountReadable}),
                        'in', 0, function(){
                            $Window.Dashboard.Navigation.Show('history');
                        } );
                }
            }
        }
    });
    //windows_page_history_list
};


$Window.Body.History.ExtractTransfers = function(res){
    var transfers = [];
    if(typeof res.result.in =='array' || typeof res.result.in =='object'){
        for(var i in res.result.in){
            transfers.push($Window.Body.History.ExtractTransfer(res.result.in[i], 'in'));
        }
    }

    if(typeof res.result.out =='array' || typeof res.result.out =='object'){
        for(var i in res.result.out){
            transfers.push($Window.Body.History.ExtractTransfer(res.result.out[i], 'out'));
        }
    }

    if(typeof res.result.pending =='array' || typeof res.result.pending =='object'){
        for(var i in res.result.pending){
            transfers.push($Window.Body.History.ExtractTransfer(res.result.pending[i], 'pending'));
        }
    }

    if(typeof res.result.pool =='array' || typeof res.result.pool =='object'){
        for(var i in res.result.pool){
            transfers.push($Window.Body.History.ExtractTransfer(res.result.pool[i], 'pool'));
        }
    }

    return transfers;
};

$Window.Body.History.ExtractTransfer = function(tr, status){
    var formatTime = moment.unix(tr.timestamp).format($Window.Body.History.timeFormat);
    var txidshort = tr.txid.substring(0, 4) + '..' + tr.txid.substring(tr.txid.length-4);
    var amountReadable = ( parseFloat(tr.amount)/1000000000000 ).toFixed(9);
    var feeReadable = parseFloat(tr.fee)/1000000000000;

    var transfer = Object.assign(
        {   "status":status,
            "formatTime":formatTime,
            "txidshort": txidshort,
            "amountReadable":amountReadable,
            "feeReadable":feeReadable},
        tr);
    return transfer;
};

$Window.Body.History.DrawTable = function(){
    $('#windows_page_history_list').html('');
    if($Window.Body.History.transfers.length>0){
        var template  = $("#js_template_transfer").html();
        for(var i in $Window.Body.History.transfers){
            if($( "#transfer_"+$Window.Body.History.transfers[i].txid ).length || false){
                //Temporary solution
                //console.log("Raw exists");
                //console.log($Window.Body.History.transfers[i]);
                if(!$( "#transfer_"+$Window.Body.History.transfers[i].txid).hasClass(
                    'wwl-transfer-'+$Window.Body.History.transfers[i].status ) ){

                    console.log("Change class");
                    $( "#transfer_"+$Window.Body.History.transfers[i].txid).attr("class",
                    'wwl-transfer wwl-transfer-'+$Window.Body.History.transfers[i].status);
                }

            } else {
                var transfer = Mustache.render(template, $Window.Body.History.transfers[i]);
                $('#windows_page_history_list').prepend(transfer);

                $('#transfer_a_info_'+$Window.Body.History.transfers[i].txid).unbind();
                $('#transfer_a_info_'+$Window.Body.History.transfers[i].txid).click(function(e){
                    e.preventDefault();
                    var txid = $(this).attr("data-tx");
                    $("#transfer_info_"+txid).toggle();
                });
            }
        }
    }

};

