/**
 * Created with JetBrains PhpStorm.
 * Date: 11/21/17
 * Time: 5:52 PM
 * To change this template use File | Settings | File Templates.
 */



$Window.variables = [
    {name: "mining_started", "value":"Процесс майнинга был успешно запущен"},
    {name: "mining_start_error", "value":"Ошибка запуска добычи денег. Возможно, что процесс уже запущен"},
    {name: "mining_stop", "value":"Процесс добычи остановлен"},
    {name: "send_success", "value":"Транзакция была успешно помщена в очередь. -{{Amount}}HLC"},
    {name: "send_error", "value":"Ошибка отпраки денег. {{Message}}"},
    {name: "incoming", "value":"Входящая транзакция. +{{Amount}}HLC"},
    {name: "clipboard", "value":"Данные скопированы в буфер обмена"}
];



$Window.GetVar = function(name, _default){
   if($Window.variables.length>0){
        for(var i=0; i<$Window.variables.length; i++){
            if($Window.variables[i].name == name)
                return $Window.variables[i].value;
        }
   }
    return _default;
};