/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body = new Object();

$Window.Body.Init = function(){
    $("#window_splash_copy").hide();
    $Window.Controls.Hide();
    $Window.LayerShow("window_splash");

    var _checkHeight = function(){
        $RPC.Api.GetHeight(function(res){
           if(res.result.height>1){
               clearInterval(loaderJobber);
               $Window.LayerShow("window_body");
               $Window.Controls.Show();
               $Window.Dashboard.Init();
           }
        });
    };

    console.log("$Window.Body.Init");
    loaderJobber = setInterval(_checkHeight, 500);
};

$Window.Body.Show = function(){
    $("#window_body").show();
};

$Window.Body.Hide = function(){
    $("#window_body").hide();
};