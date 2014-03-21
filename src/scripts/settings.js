/*! settings.js | Yammertime */

var Yt = Yt || {};
Yt.Settings = Yt.Settings || {};

(function(module) {

    // Namespaces
    var constants = Yt.Constants,
        feed = Yt.Feed,
        util = Yt.Util;

    var elements = util.getElements(),
        classes = constants.classes,
        config = constants.defaultConfig,
        settingKeys = constants.settingKeys;

    module.oauth = {};


    function cancelSettings(e) {
        e.preventDefault();

        util.toggleScroll();

        elements.settingsDialog.toggleClass(classes.hidden);
        elements.overlay.toggleClass(classes.hidden);
    }


    function changeGroupHandler() {
        var attr = 'disabled';

        // Disable the topic input field if a group is selected
        if (elements.group.val() !== '-1') {
            elements.topic.attr(attr, attr);
        } else {
            elements.topic.removeAttr(attr);
        }
    }


    function changeNetworkHandler() {
        if (module.oauth && module.oauth.setAuthToken) {
            oauth.setAuthToken(config.accessTokens[elements.network.val()]);
        }

        feed.loadGroups(module.addGroups);
    }


    function formChangeHandler() {
        elements.settingsForm.data('changed', 'true');
    }


    function getOrCreateTopicIdFail(response) {
        util.requestErrorHandler(response);

        // Load messages even if the topic id lookup fails
        retrieveFeed();
    }


    function initColor() {
        var color = module.get(settingKeys.bgColor);

        if (color) {
            elements.body.css('background', color);
        }
    }


    function initLogo() {
        var logoUrl = module.get(settingKeys.logoUrl),
            attr = 'src';

        if (util.isUrl(logoUrl)) {
            elements.headerLogo.attr(attr, logoUrl);
        } else {
            elements.headerLogo.attr(attr, 'images/yammertime.png');
        }
    }


    function initTextSize() {
        var textSize = module.get(settingKeys.textSize);

        if (textSize === 'small') {
            elements.feed.removeClass(classes.mediumText + classes.largeText + classes.xlargeText).addClass(classes.smallText);
        } else if (textSize === 'medium') {
            elements.feed.removeClass(classes.smallText + classes.largeText + classes.xlargeText).addClass(classes.mediumText);
        } else if (textSize === 'large') {
            elements.feed.removeClass(classes.smallText + classes.medium + classes.xlarge).addClass(classes.large);
        } else if (textSize === 'xlarge') {
            elements.feed.removeClass(classes.smallText + classes.mediumText + classes.largeText).addClass(classes.xlargeText);
        }

        if (module.get(settingKeys.tiled)) {
            elements.feed.trigger('tilePosts');
        }
    }


    function loadSettingsHandler() {
        //Set the form data to unchanged by default
        elements.settingsForm.data('changed', 'false');

        var groupId = module.get(settingKeys.groupId);

        // Set the values on input fields
        elements.network.val(module.get(settingKeys.networkId));
        elements.logoUrl.val(module.get(settingKeys.logoUrl));
        elements.color.val(module.get(settingKeys.bgColor));
        elements.topic.val(module.get(settingKeys.topicName));
        elements.textSize.val(module.get(settingKeys.textSize) || config.textSize);

        if (groupId && util.isInt(groupId)) {
            elements.group.val(groupId);
        }

        // Variable for setting checkboxes. Follows 'settingName' : 'element.variableName' format
        var checkboxes = {
            remove       : 'remove',
            postRotation : 'postRotation',
            showSticky   : 'showSticky',
            truncate     : 'truncate',
            tiled        : 'tiled',
            yammerLinks  : 'yammerLinks'
        };

        // Set checkbox values
        setCheckboxes(checkboxes);

        changeGroupHandler();

        // Disable scrolling while the settings box is open
        util.toggleScroll();

        elements.settingsDialog.toggleClass(classes.hidden);
        elements.overlay.toggleClass(classes.hidden);
    }


    function submitSettings(e) {
        e.preventDefault();
        elements.settingsDialog.toggleClass(classes.hidden);
        elements.overlay.toggleClass(classes.hidden);

        var settingsArgs = {
            bgColor      : elements.color.val(),
            groupId      : elements.group.val(),
            logoUrl      : elements.logoUrl.val(),
            networkId    : elements.network.val(),
            noDefaults   : true,
            postRotation : elements.postRotation.is(':checked'),
            remove       : elements.remove.is(':checked'),
            showSticky   : elements.showSticky.is(':checked'),
            textSize     : elements.textSize.val(),
            truncate     : elements.truncate.is(':checked'),
            tiled        : elements.tiled.is(':checked'),
            yammerLinks  : elements.yammerLinks.is(':checked')
        };

        // Set settings
        module.set(settingsArgs);

        module.initStyleSettings();

        // Toggle scrolling on the body
        util.toggleScroll();

        if (elements.topic.val()) {
            if (elements.settingsForm.data('changed') === 'true') {
                feed.getOrCreateTopicId(elements.topic.val(), storeTopicCookies, getOrCreateTopicIdFail);
            }
        } else {
            module.set(settingKeys.topicId, '');
            module.set(settingKeys.topicName, '');

            if (elements.settingsForm.data('changed') === 'true') {
                elements.feed.trigger('retrieveFeed');
            }
        }

    }


    function setCheckboxes(settingName, variableName) {
        var settingsArgs = typeof arguments[1] !==  'undefined' ?  '' : arguments[0];

        if (settingsArgs) {
            for (var setting in settingsArgs) {
                if (settingsArgs.hasOwnProperty(setting) && module.get(setting)) {
                    elements[settingsArgs[setting]].attr('checked', 'true');
                }
            }
        } else {
            if (module.get(settingName)) {
                elements[variableName].attr('checked', 'true');
            }
        }

        if (module.get(settingKeys.tiled)) {
            elements.postRotation.attr('disabled', 'disabled');
        } else {
            elements.postRotation.removeAttr('disabled');
        }
    }


    function storeTopicCookies(response) {
        var settingsArgs = {
            topicName : response.name,
            topicId   : response.id,
        };

        module.set(settingsArgs);

        elements.feed.trigger('retrieveFeed');
    }


    module.addNetworks = function (data) {
        util.addOptions(elements.network, data, 'name', 'permalink');
    };


    module.addGroups = function (data) {
        util.addOptions(elements.group, data, 'full_name', 'id');

        elements.group.prepend('<option value="-1">All groups</option>');
    };


    module.bindEvents = function () {
        elements.settings.on('click', loadSettingsHandler);
        elements.cancelButton.on('click', cancelSettings);
        elements.submitButton.on('click', submitSettings);
        elements.network.on('change', changeNetworkHandler);
        elements.group.on('change', changeGroupHandler);
        elements.settingsInputs.on('change', formChangeHandler);
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


    module.initStyleSettings = function() {
        initColor();
        initLogo();
        initTextSize();
    };

})(Yt.Settings);