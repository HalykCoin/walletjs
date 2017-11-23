/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body = new Object();

$Window.Body._getHeightInterval = null;
$Window.Body._heightIsOk = false;
$Window.Body._curentHeight = false;

$Window.Body.Init = function(){
    $("#window_splash_copy").hide();
    $("#window_splash_loader").show();
    $("#s_pin").hide();

    $Window.Controls.Hide();
    $Window.LayerShow("window_splash");

    var _checkHeight = function(){

        if(!$Window.Body._heightIsOk){
            $RPC.Api.GetHeight(function(res){
                if(res.result.height>1 && !$Window.Body._heightIsOk){

                    $Window.Body._curentHeight = res.result.height;
                    console.log("$RPC.Api.GetHeight");
                    $Window.LayerShow("window_body");
                    $Window.Controls.Show();
                    console.log('$Window.Dashboard.Init()');
                    $Window.Dashboard.Init();

                    clearInterval($Window.Body._getHeightInterval);
                    $Window.Body._getHeightInterval = null;
                    $Window.Body._heightIsOk = true;
                }
            });
        }

    };

    console.log("$Window.Body.Init");

    $Window.Body._heightIsOk = false;
    clearInterval($Window.Body._getHeightInterval);
    $Window.Body._getHeightInterval = null;
    $Window.Body._getHeightInterval = setInterval(_checkHeight, 1000);
};

$Window.Body.Show = function(){
    $("#window_body").show();
};

$Window.Body.Hide = function(){
    $("#window_body").hide();
};