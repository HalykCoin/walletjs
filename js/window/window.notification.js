/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 11:39 PM
 * To change this template use File | Settings | File Templates.
 */


$Window.Notify = new Object();

$Window.Notify.notifications = [];
$Window.Notify._current = '';

$Window.Notify.Init = function(){
    setInterval(function(){
        $Window.Notify.Show();
    }, 100);

    $('#windows_notification_cancel').unbind();
    $('#windows_notification_cancel').click(function(){
        $Window.Notify.Hide();
    });
};

$Window.Notify.Add = function(message, type, timeout, callBack){
    var notification = {
        id : _getPaymentId(),
        message: message,
        type: type,
        timeout :0
    };

    if(typeof timeout !="undefined"){}
        if(parseInt(timeout)>0)
            notification.timeout = timeout;

    if(typeof callBack !="undefined")
        notification.callBack = callBack;

    $Window.Notify.notifications.push(notification);
};

$Window.Notify.Hide = function(){
    $( "#windows_notification" ).fadeOut( "slow", function() {
        $Window.Notify.notifications.pop();
        $( "#windows_notification" ).hide();
    });
};

$Window.Notify._notificationTimer = null;
$Window.Notify.Show = function(){

    if($Window.Notify.notifications.length>0){
        var notification = $Window.Notify.notifications[$Window.Notify.notifications.length-1];

        if($Window.Notify._current == notification.id)
            return;

        $Window.Notify._current = notification.id;

        $("#windows_notification_message").html(notification.message);
        $("#windows_notification_icon").attr('class', 'wwl-notification-icon wwl-notification-icon-'+notification.type);

            if(notification.timeout>0){
                clearTimeout($Window.Notify._notificationTimer);

                console.log("Notification expires in "+notification.timeout+ "ms");
                $Window.Notify._notificationTimer = setTimeout(function(){
                    $Window.Notify.Hide();
                    console.log("Notification has been expired");
                }, notification.timeout);
            }


        $("#windows_notification").unbind();
        if(typeof notification.callBack == "function"){
            $("#windows_notification").click(notification.callBack);
        } else {
            $("#windows_notification").click(function(){
                $Window.Notify.Hide();
                $(this).unbind();
            });
        }

        $("#windows_notification").show();

    } else {
        $("#windows_notification").hide();
    }

};


