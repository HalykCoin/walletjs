/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body.Mining = new Object();

$Window.Body.Mining._updateInterval = null;
$Window.Body.Mining.Init = function(){
    $Window.Body.Recieive.Init();
    $("#windows_mining_threads").attr("disabled", "disabled");
    $RPC.Api.mainProcessSend({"method":"get_cpu"}, function(res){
        if(res.length>0){
            $("#windows_mining_threads").html('');
            for(var i in res){
                var html = '<option value="'+  (parseInt(i)+1) +'">'+ (parseInt(i)+1) +'</option>';
                $("#windows_mining_threads").append(html);
                $("#windows_mining_threads").val(parseInt(i)+1);
            }
        }
        $("#windows_mining_threads").removeAttr("disabled");
    });

    $('#window_mining_start').unbind();
    $('#window_mining_start').click(function(e){
        e.preventDefault();
        $Window.Body.Mining.LogFlush();
        $Window.Body.Mining.ShowProcess();
        var threads = parseInt($("#windows_mining_threads option:selected").val());

        if($("#window_mining_is_pool").is(":checked")){
            var mining_pool_address = $("#window_mining_pool_address").val();
            $RPC.Api.mainProcessSend({
                "method":"miner",
                "action":"start",
                "cpuThreads":threads,
                "walletAddress":$Window.Body.Recieive.address,
                "poolAddress":mining_pool_address}, function(res){


                $Window.Notify.Add($Window.GetVar('mining_started'), 'ok', 10000);

                clearInterval($Window.Body.Mining._updateInterval);
                $Window.Body.Mining._updateInterval = setInterval(function(){
                    $RPC.Api.mainProcessSend({
                        "method":"miner",
                        "action":"status"}, function(res){

                        if(typeof res == "object" || typeof res == "array"){
                            if(res.length>0){
                                for(var i=0; i<res.length; i++){
                                    $Window.Body.Mining.LogAppend(res[i]);
                                }
                            }
                        }

                    });
                }, 10000);

            });
        } else {
            $RPC.Api.StartMining(threads, function(){
                    $Window.Notify.Add($Window.GetVar('mining_started'), 'ok', 10000);
                },
                function(){
                    $Window.Notify.Add($Window.GetVar('mining_start_error'), 'error', 10000);
                });
        }
    });

    $('#window_mining_stop').unbind();
    $('#window_mining_stop').click(function(e){
        e.preventDefault();
        $Window.Body.Mining.ShowStart();
        clearInterval($Window.Body.Mining._updateInterval);
        $RPC.Api.StopMining(function(){
            $Window.Notify.Add($Window.GetVar('mining_stop'), 'ok', 10000);
        });
        $RPC.Api.mainProcessSend({
            "method":"get_cpu",
            "action":"stop"}, function(res){
            $Window.Notify.Add($Window.GetVar('mining_stop'), 'ok', 10000);
        });

        $RPC.Api.mainProcessSend({
            "method":"miner",
            "action":"stop"}, function(res){
            $Window.Notify.Add($Window.GetVar('mining_started'), 'ok', 10000);
        });
    });

    $("#window_mining_is_pool").click(function(){
        $("#window_mining_is_pool_settings").toggle();
    });


};

$Window.Body.Mining.LogAppend = function(data){
    $("#window_mining_log").show();
    $("#window_mining_log").prepend("<div>"+data+"</div>");
};

$Window.Body.Mining.LogFlush = function(){
    $("#window_mining_log").html("");
};

$Window.Body.Mining.ShowStart = function(){
    $("#window_mining_setting").show();
    $("#window_mining_start").show();
    $("#window_mining_stop").hide();
    $("#window_mining_log").hide();
};

$Window.Body.Mining.ShowProcess= function(){
    $("#window_mining_setting").hide();
    $("#window_mining_start").hide();
    $("#window_mining_stop").show();
    $("#window_mining_log").show();
    $Window.Body.Mining.LogAppend("Loading...");
};


