/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Body.Recieive = new Object();

$Window.Body.Recieive.address = '';
$Window.Body.Recieive.Init = function(){

    $RPC.Api.GetAddress(function(res){
        $Window.Body.Recieive.address = res.result.address;
        
        var chunks_array = res.result.address.match(/.{1,4}/g);
        var chunks = '';
        for(var i in chunks_array){
            chunks += chunks_array[i] + ' ';
        }

        $('#window_page_receive_address').html(chunks);
        $Window.Body.Recieive.UpdateQR();
    });

    $("#window_page_recieve_id, #window_page_recieve_amount").unbind();
    $("#window_page_recieve_id, #window_page_recieve_amount").on("keyup change", function(){
        $Window.Body.Recieive.UpdateQR();
    });

    $('#window_page_receive_id_generate').click(function(e){
        e.preventDefault();
        $('#window_page_receive_id').val(_getPaymentId())
        $Window.Body.Recieive.UpdateQR();
    });

    $('#window_page_receive_id_clear').click(function(e){
        e.preventDefault();
        $('#window_page_receive_id').val('')
        $Window.Body.Recieive.UpdateQR();
    });

};

$Window.Body.Recieive.UpdateQR = function(){
    var qrExport =  $Window.Body.Recieive.address;

    if($('#window_page_receive_id').val().length == 64){
        qrExport += ":"+ $('#window_page_receive_id').val();
    }

    if($('#window_page_receive_amount').val() != ""){
        var amount = parseFloat($('#window_page_receive_amount').val());
        if(amount>0)
            qrExport += ":"+amount*1000000000000;
    }

    setQRCode('window_page_receive_qr', qrExport);
};

