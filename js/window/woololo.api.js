/**
 * Created with JetBrains PhpStorm.
 * Date: 5/27/15
 * Time: 3:16 AM
 * To change this template use File | Settings | File Templates.
 */
var application = new Object();
application.api = new Object();

application.api.core = new Object();
application.api.woopages = new Object();
application.api.store = new Object();
application.api.adunit = new Object();
application.api.url = "https://api.woololo.com";

application.api.query = function(app, module, action, data, onSuccess, onFailure){

    var r_data = data;

    /*
    var s_data = $.extend( {
        app_install_id : application.session.install_id,
        app_version : application.settings.version,
        app_language : application.settings.localization.language,
        app_conn_type : navigator.connection.type,
        app_node : application.settings.name,
        app_os : device.platform,
        app_device_name : device.name,
        app_device_uuid : device.uuid
    }, r_data); */


    jQuery.ajax({
        type: "POST",
        url: application.api.url + "/api20/resource/"+app+"/"+module+"."+action+"",
        crossDomain: true,
        async: true,
        data: r_data,
        success: function(data){
            var result = Object();
            if(IsJsonString(data) ){
                result = {
                    success : true,
                    data :JSONParse(data)
                };
                if(typeof (r_data) =="object"){
                    result.request = r_data;
                }

                if(typeof onSuccess =="function")  onSuccess(result);

            } else {
                result = {
                    success : false,
                    data :null
                };
                if(typeof onFailure =="function")  onFailure(result);
            }
        },
        error: onFailure
    });
}

application.api.cachedQuery = function(app, module, action, data, cacheExpired, onSuccess, errorCallback){
    application.api.query(app, module, action, data, onSuccess, errorCallback);
};

application.api.checkToken = function(token, onSuccess, onFailure){
    application.api.query(
        "woololo", "me", "info",
        {access_token:application.session.token},
        onSuccess,
        onFailure
    );
};


application.api.core.getNode = function(node_name, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "node", "get",
        {node_name:node_name},
        720,
        onSuccess,
        onFailure
    );
};

application.api.core.getNodeTest = function(node_name, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "node", "get",
        {node_name:node_name},
        1,
        onSuccess,
        onFailure
    );
};

application.api.core.getFeed = function(node_name, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "node", "feed.get",
        {node_name:node_name},
        60,
        onSuccess,
        onFailure
    );
};

application.api.core.getUserFeed = function(onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "userfeed", "get",
        {},
        1,
        onSuccess,
        onFailure
    );
};

application.api.core.getUserFeedPrevious = function(post_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "userfeed", "get",
        {post_key:post_key},
        (post_key=="")? 1 : 720,
        onSuccess,
        onFailure
    );
};

application.api.core.getUserFeedPostData = function(post_key, news_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "userfeed", "dataget",
        {post_key:post_key, news_key:news_key},
        2880,
        onSuccess,
        onFailure
    );
};

application.api.core.getPage = function(page_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "page", "get",
        {page_key:page_key},
        2880,
        onSuccess,
        onFailure
    );
};

application.api.core.getPageMeta = function(page_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "page", "metaget",
        {page_key:page_key},
        2880,
        onSuccess,
        onFailure
    );
};

application.api.woopages.getComments = function(page_key, comment_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woopages", "comments", "get",
        {page_key:page_key, comment_key:comment_key},
        10,
        onSuccess,
        onFailure
    );
};

application.api.woopages.getFreshComments = function(page_key, comment_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woopages", "comments", "get",
        {page_key:page_key, comment_key:comment_key},
        0,
        onSuccess,
        onFailure
    );
};

application.api.woopages.deleteComment = function(comment_key, onSuccess, onFailure){
    application.api.cachedQuery(
        "woopages", "comment", "delete",
        {comment_key:comment_key},
        0,
        onSuccess,
        onFailure
    );
};

application.api.woopages.addComment = function(page_key, comment_text, comment_language, comment_mark, onSuccess, onFailure){
    application.api.cachedQuery(
        "woopages", "comment", "add",
        {
            page_key:page_key,
            comment_text : comment_text,
            comment_language : comment_language,
            comment_mark : comment_mark
        },
        0,
        onSuccess,
        onFailure
    );
};

application.api.woopages.rateComment = function(comment_key, rate_mark, onSuccess, onFailure){
    application.api.cachedQuery(
        "woopages", "comment", "delete",
        {
            comment_key:comment_key,
            rate_mark:rate_mark},
        0,
        onSuccess,
        onFailure
    );
};

application.api.store.getItems = function(store_language, onSuccess, onFailure){
    application.api.cachedQuery(
        "store", "items", "get",
        {store_language:store_language},
        0.001,
        onSuccess,
        onFailure
    );
};

application.api.store.getRecommendations = function(store_language, limit, onSuccess, onFailure){
    application.api.cachedQuery(
        "store", "recommendations", "get",
        {store_language:store_language, limit:limit},
        0.02,
        onSuccess,
        onFailure
    );
};

application.api.store.getSubscriptions = function(onSuccess, onFailure){
    application.api.cachedQuery(
        "store", "subscriptions", "get",
        {},
        0.05,
        onSuccess,
        onFailure
    );
};

application.api.store.getSettings = function(onSuccess, onFailure){
    application.api.cachedQuery(
        "store", "settings", "get",
        {},
        48,
        onSuccess,
        onFailure
    );
};

application.api.store.subscribe = function(site_id, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "site", "subscribe",
        {site_id:site_id},
        0,
        onSuccess,
        onFailure
    );
};

application.api.store.unsubscribe = function(subscription_id, onSuccess, onFailure){
    application.api.cachedQuery(
        "woololo", "site", "unsubscribe",
        {subscription_id:subscription_id},
        0,
        onSuccess,
        onFailure
    );
};


application.api.core.flushCache = function(onSuccess, onFailure){
    application.database.apiCache.flushCache(
        onSuccess,
        onFailure
    );
};

application.api.adunit.getUnits = function(page_id, onSuccess, onFailure){
    application.api.cachedQuery(
        "adunit", "unit", "get",
        {node_name:application.settings.name, page_id:page_id, secret_key:application.settings.ad.secretKey},
        0,
        onSuccess,
        onFailure
    );
};



function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function JSONParse(jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }

    return {"status":"error", "error":"JSON Parse Error", jsonerror : true};
}