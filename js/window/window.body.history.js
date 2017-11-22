/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body.History = new Object();

$Window.Body.History.Init = function(){
    $Window.Body.History.Update();
};

$Window.Body.History.transfers = [];
$Window.Body.History.timeFormat = "DD-MM-YYYY HH:mm:ss";

$Window.Body.History._lastTransactionInTime = 0;

$Window.Body.History.Update = function(){
    $RPC.Api.GetTransfers(true,true,true,true,true, function(res){
        $Window.Body.History.transfers = [];

        $Window.Body.History.ExtractTransfers(res);
        $Window.Body.History.DrawTable();

        for(var i in $Window.Body.History.transfers){
            if($Window.Body.History.transfers[i].status == 'in' || $Window.Body.History.transfers[i].status == 'pool'){
                if($Window.Body.History._lastTransactionInTime < $Window.Body.History.transfers[i].timestamp)
                    $Window.Body.History._lastTransactionInTime = $Window.Body.History.transfers[i].timestamp;
            }
        }
    });
    //windows_page_history_list
};

$Window.Body.History.BackgroundUpdate = function(){
    $RPC.Api.GetTransfers(true,true,true,true,true, function(res){
        $Window.Body.History.transfers = [];
        $Window.Body.History.ExtractTransfers(res);

        for(var i in $Window.Body.History.transfers){
            if($Window.Body.History.transfers[i].status == 'in' || $Window.Body.History.transfers[i].status == 'pool'){
                if($Window.Body.History._lastTransactionInTime < $Window.Body.History.transfers[i].timestamp){
                    $Window.Body.History._lastTransactionInTime = $Window.Body.History.transfers[i].timestamp;

                    $Window.Notify.Add(
                        Mustache.render($Window.GetVar('incoming'), {"Amount": $Window.Body.History.transfers[i].amountReadable}),
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
    if(typeof res.result.in =='array' || typeof res.result.in =='object'){
        for(var i in res.result.in){
            $Window.Body.History.transfers.push($Window.Body.History.ExtractTransfer(res.result.in[i], 'in'));
        }
    }

    if(typeof res.result.out =='array' || typeof res.result.out =='object'){
        for(var i in res.result.out){
            $Window.Body.History.transfers.push($Window.Body.History.ExtractTransfer(res.result.out[i], 'out'));
        }
    }

    if(typeof res.result.pending =='array' || typeof res.result.pending =='object'){
        for(var i in res.result.pending){
            $Window.Body.History.transfers.push($Window.Body.History.ExtractTransfer(res.result.pending[i], 'pending'));
        }
    }

    if(typeof res.result.pool =='array' || typeof res.result.pool =='object'){
        for(var i in res.result.pool){
            $Window.Body.History.transfers.push($Window.Body.History.ExtractTransfer(res.result.pool[i], 'pool'));
        }
    }

    $Window.Body.History.transfers.sort(function(a, b){
        var keyA = a.timestamp,
            keyB = b.timestamp;
        // Compare the 2 dates
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
    });

};

$Window.Body.History.ExtractTransfer = function(tr, status){
    var formatTime = moment.unix(tr.timestamp).format($Window.Body.History.timeFormat);
    var txidshort = tr.txid.substring(0, 4) + '..' + tr.txid.substring(tr.txid.length-4);
    var amountReadable = parseFloat(tr.amount)/1000000000000;
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
};

