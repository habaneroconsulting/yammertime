/*! feed.js | Yammertime */

var Yt = Yt || {};
Yt.Feed = Yt.Feed || {};

(function(module, window, document, undefined) {

    // Namespaces
    var util = Yt.Util;

    module.getOrCreateTopicId = function (topicName, success, error) {
        yam.platform.request({
            url: 'topics.json',
            type: 'POST',
            data: 'name=' + topicName,
            dataType: 'json',
            success: success,
            error: error
        });
    };


    module.loadGroups = function (success) {
        // Load group options
        yam.platform.request({
            url: 'groups.json',
            type: 'GET',
            dataType: 'json',
            data: {
                mine: '1'
            },
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadMessages = function (apiUrl, success) {
        yam.platform.request({
            url: apiUrl,
            type: 'GET',
            dataType: 'json',
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadNetworks = function (success) {
        // Load network options
        yam.platform.request({
            url: 'networks/current.json',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.loadTokens = function (config) {
        yam.platform.request({
            url: 'oauth/tokens.json',
            type: 'GET',
            dataType: 'json',
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