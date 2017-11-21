/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 11:39 PM
 * To change this template use File | Settings | File Templates.
 */


var {ipcRenderer, remote} = require('electron');

var main = remote.require("./main.js");
var loaderJobber = null;

$(document).ready(function(){
    $Window.Init();
    $Window.Loader.Init();
    $Window.Notify.Init();

    $("#wallet_create_submit").click(function(){
        var wallet_name = $('#wallet_create_name').val();
        $RPC.Api.WalletCreate(wallet_name, "")

    });

    //Show synchronization process
    ipcRenderer.on('async-synchronization', (event, arg) => {
        console.log(arg);
});

});


$Window = new Object();
$Window.settings = new Object();
$Window.settings.news_feed = 'ru.halykcoin.org';

$Window.Init = function(){
    $('#window_close').click(function (e) {
        var window = remote.getCurrentWindow();
        window.close();
    });

    $('#window_minimize').click(function (e) {
        var window = remote.getCurrentWindow();
        window.minimize();
    });

    $('body').on('click', 'a', function (event) {
        var clipboard_data = $(this).attr("data-clipboard");
        if (typeof(clipboard_data) != "undefined") {
            const {clipboard} = require('electron');
            clipboard.writeText(clipboard_data);
            $Window.Notify.Add($Window.GetVar('clipboard'), 'ok', 1000);
        }
    });

};

$Window.LayerShow = function(layer_name){
    $('.layout').hide();
    $('#'+layer_name).show();
};

$Window.Controls = new Object();

$Window.Controls.Show = function(){
    $('#window_controls').show();
    $('#window_header').show();
    console.log('$Window.Controls.Show');
};

$Window.Controls.Hide = function(){
    $('#window_controls').hide();
    $('#window_header').hide();
};


