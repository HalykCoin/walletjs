/**
 * Created with JetBrains PhpStorm.
 * Date: 11/7/17
 * Time: 11:39 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Lock = new Object();

$Window.Lock.Init = function(){
   $('#window_lock').unbind();
   $('#window_lock').click(function(){
       $Window.Lock.Init.Lock();
   });
};

$Window.Lock.Init.Lock = function(){
    $Window.Pin.Auth.Init();
    $Window.Controls.Show();
};

