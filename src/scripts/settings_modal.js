/*! settings_modal.js | Yammertime */

var Yt = Yt || {};
Yt.SettingsModal = Yt.SettingsModal || {};

(function(module) {

    // Namespaces
    var constants = Yt.Constants,
        feed = Yt.Feed,
        util = Yt.Util,
        settings = Yt.Settings;

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
        var token = "";

        // Set the new token into settings
        $.each(config.accessTokens, function (index, token) {
            if (token.network_id.toString() === elements.network.val()) {
                settings.set(settingKeys.networkToken, token.token);
            }
        });

        util.log("Network changed to ", elements.network.find("option:selected").text());
        util.log("Network id is ", elements.network.val());
        util.log("Network token is ", settings.get(settingKeys.networkToken));
        util.log("Setting new auth token...");

        yam.platform.setAuthToken(
            settings.get(settingKeys.networkToken),
            function (response) {
                util.log("Authorization token response received: ", response);
                module.loadGroups(module.addGroups);
            }
        );
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
        var color = settings.get(settingKeys.bgColor);

        if (color) {
            elements.body.css('background', color);
        }
    }


    function initLogo() {
        var logoUrl = settings.get(settingKeys.logoUrl),
            attr = 'src';

        if (util.isUrl(logoUrl)) {
            elements.headerLogo.attr(attr, logoUrl);
        } else {
            elements.headerLogo.attr(attr, 'images/yammertime.png');
        }
    }


    function initTextSize() {
        var textSize = settings.get(settingKeys.textSize);

        if (textSize === 'small') {
            elements.feed.removeClass(classes.mediumText + classes.largeText + classes.xlargeText).addClass(classes.smallText);
        } else if (textSize === 'medium') {
            elements.feed.removeClass(classes.smallText + classes.largeText + classes.xlargeText).addClass(classes.mediumText);
        } else if (textSize === 'large') {
            elements.feed.removeClass(classes.smallText + classes.medium + classes.xlarge).addClass(classes.large);
        } else if (textSize === 'xlarge') {
            elements.feed.removeClass(classes.smallText + classes.mediumText + classes.largeText).addClass(classes.xlargeText);
        }

        if (settings.get(settingKeys.tiled)) {
            elements.feed.trigger('tilePosts');
        }
    }


    function loadSettingsHandler() {
        //Set the form data to unchanged by default
        elements.settingsForm.data('changed', 'false');

        var groupId = settings.get(settingKeys.groupId);

        // Set the values on input fields
        elements.network.val(settings.get(settingKeys.networkId));
        elements.logoUrl.val(settings.get(settingKeys.logoUrl));
        elements.color.val(settings.get(settingKeys.bgColor));
        elements.topic.val(settings.get(settingKeys.topicName));
        elements.textSize.val(settings.get(settingKeys.textSize) || config.textSize);

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
        settings.set(settingsArgs);

        module.initStyleSettings();

        // Toggle scrolling on the body
        util.toggleScroll();

        if (elements.topic.val()) {
            if (elements.settingsForm.data('changed') === 'true') {
                feed.getOrCreateTopicId(elements.topic.val(), storeTopicCookies, getOrCreateTopicIdFail);
            }
        } else {
            settings.set(settingKeys.topicId, '');
            settings.set(settingKeys.topicName, '');

            if (elements.settingsForm.data('changed') === 'true') {
                elements.feed.trigger('retrieveFeed');
            }
        }

    }


    function setCheckboxes(settingName, variableName) {
        var settingsArgs = typeof arguments[1] !==  'undefined' ?  '' : arguments[0];

        if (settingsArgs) {
            for (var setting in settingsArgs) {
                if (settingsArgs.hasOwnProperty(setting) && settings.get(setting)) {
                    elements[settingsArgs[setting]].attr('checked', 'true');
                }
            }
        } else {
            if (settings.get(settingName)) {
                elements[variableName].attr('checked', 'true');
            }
        }

        if (settings.get(settingKeys.tiled)) {
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

        settings.set(settingsArgs);

        elements.feed.trigger('retrieveFeed');
    }


    module.addNetworks = function (data) {
        util.addOptions(elements.network, data, 'name', 'permalink');
    };


    module.addGroups = function (data) {
        util.log("Groups loaded: ", data);
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

    module.buildNetworkSelector = function() {
        util.addOptions(elements.network, config.accessTokens, 'network_name', 'network_id');
    };

    module.loadGroups = function (success) {
        util.log("Loading groups...");

        // Load group options
        yam.platform.request({
            url: 'groups.json',
            method: 'GET',
            data: {
                mine: '1'
            },
            success: success,
            error: util.requestErrorHandler
        });
    };


    module.initStyleSettings = function() {
        initColor();
        initLogo();
        initTextSize();
    };

})(Yt.SettingsModal);