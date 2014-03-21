/*! feed.js | Yammertime */

var Yt = Yt || {};
Yt.Feed = Yt.Feed || {};

(function(module, window, document, undefined) {

    // Namespaces
    var util = Yt.Util;

    module.getOrCreateTopicId = function (topicName, success, error) {
        yam.request({
            url: '/api/v1/topics',
            type: 'POST',
            data: 'name=' + topicName,
            success: success,
            error: error
        });
    };


    module.loadGroups = function (success) {
        // Load group options
        yam.request({
            url: '/api/v1/groups?mine=1',
            type: 'GET',
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadMessages = function (apiUrl, success) {
        yam.request({
            url: apiUrl,
            type: 'GET',
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadNetworks = function (success) {
        // Load network options
        yam.request({
            url: '/api/v1/networks/current',
            type: 'GET',
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadTokens = function (config) {
        yam.request({
            url: '/api/v1/oauth/tokens',
            type: 'GET',
            success: function (msg) {
                $.each(msg, function(index, item) {
                    if (!config.accessTokens[item.network_permalink]) {
                        config.accessTokens[item.network_permalink] = item;
                    }
                });
            },
            error: util.requestErrorHandler
        });
    };

})(Yt.Feed, window, document, undefined);