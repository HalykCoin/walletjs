/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Pin = new Object();

$Window.Pin.pin = '';
$Window.Pin.valid = false;
$Window.Pin.Init = function(){

    $Window.LayerShow('window_new_wallet_pin');

    $("#window_pin_plain").focus();
    $("#window_pin_create").click(function(){
        $Window.Pin.Validate();

        if($Window.Pin.valid){
            $Window.Pin.pin = $("#window_pin_plain").val();

            $("#window_pin_create").attr("disabled", "disabled")
            $RPC.Api.WalletCreate($Window.Password.password, $Window.Pin.pin, function(res){
                location.reload();
            }, function(){
                $("#window_pin_create").removeAttr("disabled");
            });

        }else {
            $("#window_pin_plain").focus();
        }
    });

    $("#window_pin_plain, #window_pin_plain_repeat").on("keyup change", function(){
        $Window.Pin.Validate();
    });
};


$Window.Pin.Validate = function(){
    $("#window_pin_plain").each(function () {
        $Window.Pin.valid =  true;

        if($("#window_pin_plain").val() != $("#window_pin_plain_repeat").val()){
            $Window.Pin.valid = false;
            $('#window_pin_check_match').addClass("windows-password-fail");
            $('#window_pin_check_match').removeClass("windows-password-passed");
        } else {
            $('#window_pin_check_match').removeClass("windows-password-fail");
            $('#window_pin_check_match').addClass("windows-password-passed");
        }

        if(this.value.length != 4) {
            $Window.Pin.valid = false;
            $('#window_pin_check_length').addClass("windows-password-fail");
            $('#window_pin_check_length').removeClass("windows-password-passed");
        } else {
            $('#window_pin_check_length').removeClass("windows-password-fail");
            $('#window_pin_check_length').addClass("windows-password-passed");
        }

        if(!/^\d+$/.test(this.value)){
            $Window.Password.valid = false;
            $('#window_pin_check_numeral').addClass("windows-password-fail");
            $('#window_pin_check_numeral').removeClass("windows-password-passed");
        } else {
            $('#window_pin_check_numeral').removeClass("windows-password-fail");
            $('#window_pin_check_numeral').addClass("windows-password-passed");
        }

    });
};

$Window.Pin.Auth = new Object();
$Window.Pin.pos = 0;
$Window.Pin.pin = '';
$Window.Pin.Auth.Init = function(){

    $Window.Pin.Auth.InitFields();
    $Window.LayerShow("window_splash");
    $("#window_splash_loader").hide();
    $("#window_splash_copy").hide();
    $("#s_pin").show();

    $("body").unbind("keypress.pinCode");
    $("body").bind("keypress.pinCode", function(e){
        if (e.which !== 0) {
            $("#s_pin_"+($Window.Pin.pos+1)).val('*');
            $Window.Pin.pin += String.fromCharCode(e.which);

            if($Window.Pin.pos==3){
                $RPC.Api.WalletOpen('', '', $Window.Pin.pin, function(res){
                    if(typeof res.error == 'object'){
                        $Window.Pin.pin = '';
                        $Window.Pin.pos =  0;
                        $Window.Pin.Auth.InitFields();

                    } else {
                        $Window.Pin.pin = '';
                        $Window.Pin.pos =  0;
                        $Window.Body.Init();
                    }

                }, function(res){
                    $Window.Pin.pin = '';
                    $Window.Pin.pos =  0;
                    $Window.Pin.Auth.InitFields();
                });
            }

            $Window.Pin.pos++;
        }
    });

};

$Window.Pin.Auth.InitFields = function(){
    $("#s_pin_1").val(''); $("#s_pin_2").val('');
    $("#s_pin_3").val(''); $("#s_pin_4").val('');
};
