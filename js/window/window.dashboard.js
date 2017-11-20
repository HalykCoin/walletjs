/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Dashboard = new Object();

$Window.Dashboard.Init = function(){
    $Window.Dashboard.Show();
    $Window.Dashboard.UpdateBalance();
    $Window.Dashboard.Navigation.Init();
};

$Window.Dashboard.Show = function(){
    $('#window_dashboard').show();
};

$Window.Dashboard.Hide = function(){
    $('#window_dashboard').hide();
};

$Window.Dashboard.UpdateBalance = function(){
    $('#window_dashboard_unlocked').text();

        $RPC.Api.GetBalance(function(resp){
            $('#window_dashboard_unlocked').text(parseFloat(resp.result.unlocked_balance)/1000000000000);
            $('#window_dashboard_balance').text(parseFloat(resp.result.balance)/1000000000000);
        });
};

$Window.Dashboard.Navigation = new Object();
$Window.Dashboard.Navigation.Init = function(){
    $("#window-dashboard_navigation").find("a").on('click', function(e){
        e.preventDefault();
        var option = $(this).attr('data-nav');

        $Window.Dashboard.Navigation.Show(option);
    });

    $Window.Dashboard.Navigation.Show('history');
};

$Window.Dashboard.Navigation.Show = function(option){

    if(option=="history"){
        $Window.Body.History.Init();
    }

    $("#window-dashboard_navigation").find("a").removeClass("wwl-current");
    $("#window-dashboard_navigation").find("a[data-nav='"+option+"']").addClass("wwl-current");

    $('#window_body').find('.wwl-page-layout').hide();
    $('#window_page_'+option).show();
};