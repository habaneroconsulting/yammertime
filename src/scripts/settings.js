/*! settings.js | Yammertime */

var Yt = Yt || {};
Yt.Settings = Yt.Settings || {};

(function(module) {

    // Namespaces
    var constants = Yt.Constants;

    var settingKeys = constants.settingKeys;

    // Read a page's GET URL variables and return them as an associative array.
    function getUrlVars() {
        var vars = [],
            hash;

        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        return vars;
    }


    module.setDefaults = function () {
        // Get default settings
        var settingsArgs = constants.defaultSettings,

        // Get variables from the query string
            queryString = getUrlVars();

        if (!module.get(settingKeys.noDefaults) && !queryString[queryString[0]]) {
            module.set(settingsArgs);
        } else if (queryString[queryString[0]]) {
            for (var i = 0; i < queryString.length; i++) {
                settingsArgs[queryString[i]] = queryString[queryString[i]];
            }

            module.set(settingsArgs);
        }
    };

    module.get = function (settingName) {
        if (localStorage[settingName] === 'true') {
            return true;
        } else if (localStorage[settingName] === 'false') {
            return false;
        }

        return localStorage[settingName];
    };


    module.set = function (settingName, settingValue) {
        // Assume object literal is passed if no 2nd argument exists
        var settingsArgs = typeof arguments[1] !==  'undefined' ?  '' : arguments[0];

        if (settingsArgs) {
            for (var setting in settingsArgs) {
                if (settingsArgs.hasOwnProperty(setting)) {
                    localStorage[setting] = settingsArgs[setting];
                }
            }
        } else {
            localStorage[settingName] = settingValue;
        }
    };
})(Yt.Settings);