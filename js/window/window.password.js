/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Password = new Object();
/*
Здесь должен быть успокаювающий текст. Объяснение правил сложности пароля и информация о том, что для
авторизации будет использоваться пин-код
<div id="window_password_check_lower">Строчные буквы</div>
<div id="window_password_check_upper">Заглавные буквы</div>
<div id="window_password_check_numeral">Число</div>
<div id="window_password_check_length">Пароль должен соостоять минимум из 6-ти символов</div>
</div>


<div class="wwl-row">
    <div class="wwl-field">Пароль:</div>
    <div class="wwl-input-container">
        <input class="wwl-input" id="window_password_plain" type="password">
        </div>
    </div>
    <div class="wwl-row">
        <div class="wwl-field">Подтверждение пароля:</div>
        <div class="wwl-input-container">
            <input class="wwl-input" id="window_password_plain_repeat" type="password">
            </div>
        </div>
        <a href="#" id="window_password_create" class="wwl-button-primary"> */

$Window.Password.password = '';
$Window.Password.valid = false;
$Window.Password.Init = function(){

    $Window.LayerShow('window_new_wallet_password');

    $("#window_password_plain").focus();
    $("#window_password_create").click(function(){
        $Window.Password.Validate();

        if($Window.Password.valid){
            $Window.Password.password = $("#window_password_plain").val();
            $Window.Pin.Init();
        }else {
            $("#window_password_plain").focus();
        }
    });

    $("#window_password_plain, #window_password_plain_repeat").on("keyup change", function(){
        $Window.Password.Validate();
    });
};


$Window.Password.Validate = function(){
    $("#window_password_plain").each(function () {
        $Window.Password.valid =  true;

        if($("#window_password_plain").val() != $("#window_password_plain_repeat").val()){
            $Window.Password.valid = false;
            $('#window_password_check_match').addClass("windows-password-fail");
            $('#window_password_check_match').removeClass("windows-password-passed");
        } else {
            $('#window_password_check_match').removeClass("windows-password-fail");
            $('#window_password_check_match').addClass("windows-password-passed");
        }

        if(this.value.length < 8) {
            $Window.Password.valid = false;
            $('#window_password_check_length').addClass("windows-password-fail");
            $('#window_password_check_length').removeClass("windows-password-passed");
        } else {
            $('#window_password_check_length').removeClass("windows-password-fail");
            $('#window_password_check_length').addClass("windows-password-passed");
        }

        if(!/[a-z]/.test(this.value)){
            $Window.Password.valid = false;
            $('#window_password_check_lower').addClass("windows-password-fail");
            $('#window_password_check_lower').removeClass("windows-password-passed");
        } else {
            $('#window_password_check_lower').removeClass("windows-password-fail");
            $('#window_password_check_lower').addClass("windows-password-passed");
        }

        if(!/[A-Z]/.test(this.value)){
            $Window.Password.valid = false;
            $('#window_password_check_upper').addClass("windows-password-fail");
            $('#window_password_check_upper').removeClass("windows-password-passed");
        } else {
            $('#window_password_check_upper').removeClass("windows-password-fail");
            $('#window_password_check_upper').addClass("windows-password-passed");
        }

        if(!/[0-9]/.test(this.value)){
            $Window.Password.valid = false;
            $('#window_password_check_numeral').addClass("windows-password-fail");
            $('#window_password_check_numeral').removeClass("windows-password-passed");
        } else {
            $('#window_password_check_numeral').removeClass("windows-password-fail");
            $('#window_password_check_numeral').addClass("windows-password-passed");
        }



    });
};
