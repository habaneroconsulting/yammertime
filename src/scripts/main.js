/*! main.js | Yammertime */

(function($, moment, Handlebars, window, document, undefined) {

    // Namespaces
    var constants = Yt.Constants,
        util = Yt.Util,
        feed = Yt.Feed,
        settings = Yt.Settings,
        settingsModal = Yt.SettingsModal;

    var oauth = settingsModal.oauth,
        elements = util.getElements(),
        classes = constants.classes,
        config = constants.defaultConfig,
        settingKeys = constants.settingKeys;


    function bindEvents() {
        settingsModal.bindEvents();

        elements.closeButton.on('click', closeExpandedPost);
        elements.container.on('click', 'a.view-replies', showReplies);
        elements.container.on('click', 'a.older-replies', appendOldReplies);
        elements.logout.on('click', logoutHandler);
        elements.feed.on('click', '.' + classes.tile, expandPost);

        elements.feed.on('tilePosts', feed.tilePosts);
        elements.feed.on('retrieveFeed', feed.retrieveFeed);

        $(document).on('keyup', keyPressListen);

        idleEvent();
    }


    function closeExpandedPost() {
        // Hide the content
        elements.settingsDialog.addClass(classes.hidden);
        elements.overlayExpanded.addClass(classes.hidden);
        elements.overlay.addClass(classes.hidden);

        // Toggle the scroll on the body back on
        util.toggleScroll();

        // Return the html to it's original state
        elements.repliesExpanded.html('');
        elements.repliesExpanded.html(elements.spinner.show());
    }


    function expandPost() {
        var id = $(this).attr('id');

        // Show expanded post
        elements.overlayExpanded.toggleClass(classes.hidden);
        elements.overlay.toggleClass(classes.hidden);

        // Clear the contents and insert new content
        elements.postExpanded.html('');
        elements.postExpanded.attr('id', id).html($(this).html());
        showModalReplies(id);

        // Disable scrolling on the body
        util.toggleScroll();
    }


    function idleEvent() {
        var idleTime = 0,
            $this = $(this);

        //Increment the idle time counter every minute.
        var idleInterval = setInterval(function() {

            idleTime = idleTime + 1;
            if (idleTime === config.idleWait) {
                // Scroll to the top if inactive for a specified amount of time
                elements.body.animate({ scrollTop:  0 });
                if(!elements.overlayExpanded.hasClass(classes.hidden)) {
                    closeExpandedPost();
                }
            }

        }, 1000*60); // 1 minute

        function resetIdleTime() {
            idleTime = 0;
        }

        //Zero the idle timer on different events
        $this.mousemove(resetIdleTime);
        $this.keypress(resetIdleTime);
        $this.scroll(resetIdleTime);
    }


    function keyPressListen(e) {
        // Close the expanded post is ESC key is pressed
        if (e.which === 27 && !elements.overlayExpanded.hasClass(classes.hidden)) {
            closeExpandedPost();
        }
    }


    function login() {
        // Hide landing, show heading
        elements.landing.addClass(classes.hidden);
        elements.header.removeClass(classes.hidden);

        // Bind all application events
        bindEvents();

        // Load access tokens and kick off the app
        feed.loadTokens(config);

        settings.setDefaults();

        settingsModal.initStyleSettings();

        // Start timer actions timers
        setInterval(timerHandler, config.showDelay);
        setInterval(rotateOrNot, config.animationDelay);
    }


    function logoutHandler() {
        yam.logout(function(response) {
            location.reload();
        });
    }


    function appendOldReplies(e) {
        e.preventDefault();

        var oldestId = $(this).attr('id');
        var threadId = $(this).parents('section').find('.post-expanded').attr('id');

        settings.set(settingKeys.olderReplies, 'true');

        feed.loadMessages('messages/in_thread/' + threadId + '.json?older_than=' + oldestId  + '&limit=' +  config.messageLimit, feed.placeMessages);
    }


    function rotatePosts() {
        // Post rotation in regular view
        $('.feed .yam:last').animate({'opacity' : '0'}, 500, function () {
            var $this = $(this);

            $this.prependTo(elements.feed)
                .css({'opacity': '1', 'display': 'none'})
                .slideDown('slow');
        });
    }


    function rotateOrNot(argument) {
        if (!settings.get(settingKeys.tiled) && settings.get(settingKeys.postRotation)) {
            rotatePosts();
        }
    }


    function showModalReplies(threadId) {
        settings.set(settingKeys.postId, threadId);
        settings.set(settingKeys.appendPostReplies, 'true');
        settings.set(settingKeys.modalPostAppend, 'true');

        feed.loadMessages('messages/in_thread/' + threadId + '.json?limit=' +  config.messageLimit, feed.placeMessages);
    }


    function showReplies(e) {
        if (e) {
            e.preventDefault();
        }

        var clickedLink = $(this);

        // If there aro no replies appended to the post, load and append them
        if (clickedLink.hasClass(classes.viewReplies) && clickedLink.parents('.yam').find('.reply').length === 0) {
            var threadId = clickedLink[0].hash.slice(1),
                postId = clickedLink.parents('.yam')[0].id;

            settings.set(settingKeys.appendPostReplies, 'true');
            settings.set(settingKeys.postId, postId);

            feed.loadMessages('messages/in_thread/' + threadId + '.json', feed.placeMessages);
        } else {
            clickedLink.parents('.yam').find('.reply').toggle();
            clickedLink.parents('.yam').find('.reply').remove();
        }
    }


    function timerHandler() {
        feed.formatCreationDates();

        if (config.count % config.loadDelay === 0) {
            var groupId = settings.get(settingKeys.groupId),
                topicId = settings.get(settingKeys.topicId);

            if (groupId && util.isInt(groupId) && groupId !== '-1') {
                // Load group feed
                feed.loadMessages('messages/in_group/' + groupId + '.json?threaded=true&newer_than=' +  config.lastMessageId, feed.placeMessages);
            } else if (topicId && util.isInt(topicId)) {
                // Load topic feed
                feed.loadMessages('messages/about_topic/' + topicId + '.json?threaded=true&newer_than=' +  config.lastMessageId, feed.placeMessages);
            } else {
                // Load All Company/Network feed
                feed.loadMessages('messages.json?threaded=true&newer_than=' + config.lastMessageId, feed.placeMessages);
            }
        }

        if (config.count % config.showDelay === 0) {
            config.count = config.count + config.showDelay;
        }
    }


    function initialise() {
        util.log("Trigger LoginStatus");
        yam.getLoginStatus(function (response) {
            if (response.authResponse) {
                util.log("Logged in");
                util.log("Access token is: ", response.access_token);
                login();
            } else {
                elements.landing.removeClass(classes.hidden);

                yam.connect.loginButton(
                    '#yammer-login',
                    function (response) {
                        if (response.authResponse) {
                            util.log("Logged in");
                            util.log("Access token is: ", response.access_token);
                            login();
                        }
                    }
                );
            }
        });
    }


    initialise();

})(jQuery, moment, Handlebars, window, document);
