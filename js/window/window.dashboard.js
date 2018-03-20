/**
 * Created with JetBrains PhpStorm.
 * Date: 11/16/17
 * Time: 5:13 PM
 * To change this template use File | Settings | File Templates.
 */

$Window.Dashboard = new Object();

$Window.Dashboard._update_interval = null;

$Window.Dashboard.Init = function(){
    $Window.Dashboard.Show();
    $Window.Dashboard.UpdateBalance();
    $Window.Dashboard.Navigation.Init();

    clearInterval($Window.Dashboard._update_interval);
    $Window.Dashboard._update_interval = setInterval(function(){
        $Window.Dashboard.UpdateBalance();
        $Window.Body.History.BackgroundUpdate();
    }, 10000);
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

            var balance = (parseFloat(resp.result.unlocked_balance)/100000000000);
            var unlocked_balance = parseFloat((resp.result.balance)/          100000000000);

            if (balance> 1000){
                balance = balance.toFixed(8);
            }

            $('#window_dashboard_unlocked').html(balance + '<span> HLC</span>');
            $('#window_dashboard_balance').html( unlocked_balance+ '<span> HLC</span>');
        });
};

$Window.Dashboard.Navigation = new Object();
$Window.Dashboard.Navigation.Init = function(){
    $("#window-dashboard_navigation").find("a").unbind();
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

    if(option=="receive"){
        $Window.Body.Recieive.Init();
    }

    if(option=="send"){
        $Window.Body.Send.Init();
    }

    if(option=="mining"){
        $Window.Body.Mining.Init();
    }

    $("#window-dashboard_navigation").find("a").removeClass("wwl-current");
    $("#window-dashboard_navigation").find("a[data-nav='"+option+"']").addClass("wwl-current");

    $('#window_body').find('.wwl-page-layout').hide();
    $('#window_page_'+option).show();
};