/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body.Send = new Object();

$Window.Body.Send.Init = function(){

    $("#window_page_send_button").unbind();
    $("#window_page_send_button").click(function(){

        var address = $("#window_page_send_address").val();
        address = address.replace(/\s/g, "");

        var payment_id = $('#window_page_send_id').val();
        var amount = parseInt(parseFloat($('#window_page_send_amount').val()) * 1000000000000);
        var securityLevel = 1;

        if(amount==0){
            $('#window_page_send_amount').focus();
            return false;
        }

        if(address.length != 95){
            $('#window_page_send_address').focus();
            return false;
        }

        if(payment_id.length!=0 && payment_id.length!=64 && payment_id!='0000000000000000'){
            $('#window_page_send_id').focus();
            return false;
        }

        $("#window_page_send_button").attr("disabled", "disabled");
        $RPC.Api.Transfer(amount, address, payment_id, securityLevel, function(e){
            $Window.Dashboard.UpdateBalance();
            $('#window_page_send_amount').val('');
            $("#window_page_send_address").val('');
            $("#window_page_send_button").removeAttribute("disabled");
        });

    });

    $('#window_page_send_id_generate').unbind();
    $('#window_page_send_id_generate').click(function(e){
        e.preventDefault();
        $('#window_page_send_id').val(_getPaymentId());
    });

    $('#window_page_send_id_clear').unbind();
    $('#window_page_send_id_clear').click(function(e){
        e.preventDefault();
        $('#window_page_send_id').val('');
    });

};


