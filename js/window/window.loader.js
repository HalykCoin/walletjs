/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 11:39 PM
 * To change this template use File | Settings | File Templates.
 */
let shell = require('electron').shell;

$Window.Loader = new Object();

$Window.Loader.Splash = new Object();
$Window.Loader.Splash.Hide = function(){
    $("#window_splash").hide();
};

$Window.Loader.Hide = function(){
    $("#window_loader").hide();
};

$Window.Loader.Init = function(){

    $Window.Loader.Slider.Init();

    var checkSync = function(){
        $RPC.Api.rpcDeamonConsoleSend({"action" : "rpc-deamon-sync"}, $Window.Loader.update)
    };

    loaderJobber = setInterval(checkSync, 1000);
};

$Window.Loader.Slider = new Object();
$Window.Loader.Slider.Init = function(){
    application.api.core.getFeed($Window.settings.news_feed, function(req){
        $("#loader-news").show();
        var template = $("#js_template_news").html();
        console.log(req);
        var rendered = Mustache.render(template, req.data);
        $("#loader-news").html(rendered);


        $('.wwl-news-link').bind('click', function(e){
            e.preventDefault();
            shell.openExternal($(this).attr('href'));
        });

        $('#loader-news').unslider({
           // animation: 'fade',
            autoplay: true,
            arrows: false,
            infinite: true,
            delay: 9000
        });
    });
};

$Window.Loader._progress = 1;
$Window.Loader.update = function(args){

    if(!args.ready){
        if(parseInt(args.sync_target) >0){
            $Window.Controls.Show();
            $Window.LayerShow("window_loader");
            $Window.Loader.Show();
            $("#wallet_loading_process_current").text(args.sync_current);
            $("#wallet_loading_process_targert").text(args.sync_target);

            var per_cent = Math.round( ( parseFloat(args.sync_current) /parseFloat(args.sync_target))*100);
            $("#wallet_loading_process_bar").css("width", per_cent+ '%');
        }
        console.log( parseInt(args.sync_target) );

    } else {
        clearInterval(loaderJobber);

        $RPC.Api.rpcMainConsoleSend({method:"get_settings"}, function(res){
            console.log(res);
            if(res.wallet_name == ""){
                $Window.LayerShow("window_new_wallet_password");
                $Window.Password.Init();
                $Window.Controls.Show();
            } else {
                $Window.Pin.Auth.Init();
                //$Window.Controls.Show();
            }
        });
    }
};

$Window.Loader.Show = function(){
    $("#wallet_loading_process").show();
    $("#window_loader").show();
};

$Window.Loader.Hide = function(){
    $("#window_loader").hide();
};


