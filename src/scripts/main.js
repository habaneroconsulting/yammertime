/*! main.js | Yammertime */

(function($, moment, Handlebars, window, document, undefined) {

    // Namespaces
    var constants = Yt.Constants,
        util = Yt.Util,
        feed = Yt.Feed,
        settings = Yt.Settings,
        templates = Yt.Templates;

    var oauth = settings.oauth,
        elements = util.getElements(),
        classes = constants.classes,
        config = constants.defaultConfig,
        settingKeys = constants.settingKeys;


    function bindEvents() {
        settings.bindEvents();

        elements.closeButton.on('click', closeExpandedPost);
        elements.container.on('click', 'a.view-replies', showReplies);
        elements.container.on('click', 'a.older-replies', appendOldReplies);
        elements.logout.on('click', logoutHandler);
        elements.feed.on('click', '.'+classes.tile, expandPost);

        elements.feed.on('tilePosts', tilePosts);
        elements.feed.on('retrieveFeed', retrieveFeed);

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


    function formatCreationDates() {
        $('.creationdate').each(function() {
            var datestr = $(this).data('time');
            var timeAgo = moment(datestr).fromNow();
            var newDateStr = ' ' + timeAgo;

            $(this).text(newDateStr);
        });
    }


    function formatPosts(messages) {
        if (settings.get(settingKeys.tiled)) {
            tilePosts();
        } else {
            // Remove the tiled view classes
            elements.container.removeClass(classes.tiled_view);
            elements.settingsDialog.removeClass(classes.pushSettings);
        }
    }


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


    function login(response) {
        // Hide landing, show heading
        elements.landing.addClass(classes.hidden);
        elements.header.removeClass(classes.hidden);

        bindEvents();

        settings.set(settingKeys.networkPermalink, response.access_token.network_permalink);
        var networkPermalink = settings.get(settingKeys.networkPermalink);

        //Set network setting right off the start
        settings.set(settingKeys.networkId, response.access_token.network_name);

        feed.loadTokens(config);
        feed.loadNetworks(settings.addNetworks);
        feed.loadGroups(settings.addGroups);


        var queryString = getUrlVars();

        // Default settings
        var settingsArgs = {
            bgColor      : '#455560',
            groupId      : '-1',
            olderReplies : 'false',
            logoUrl      : '',
            postRotation : 'false',
            showSticky   : 'false',
            stickyDate   : 0,
            textSize     : 'small',
            truncate     : 'false',
            tiled        : 'true',
            yammerLinks  : 'false'
        };

        // Set default settings
        if (!settings.get(settingKeys.noDefaults) && !queryString[queryString[0]]) {
            settings.set(settingsArgs);
        } else if (queryString[queryString[0]]) {
            for (var i = 0; i < queryString.length; i++) {
                settingsArgs[queryString[i]] = queryString[queryString[i]];
            }

            settings.set(settingsArgs);
        }

        settings.initStyleSettings();

        // Retrieve feed
        retrieveFeed();

        // Start timer actions timers
        setInterval(timerHandler, config.showDelay);
        setInterval(rotateOrNot, config.animationDelay);
    }


    function logoutHandler() {
        yam.logout(function(response) {
            location.reload();
        });
    }


    function makeSticky(messages) {
        var sticky = [];

        if (settings.get(settingKeys.showSticky)) {
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].message_type === 'announcement') {
                    // Add message to the sticky array...
                    sticky.push(messages[i]);

                    // ...and remove it from the message stream
                    messages.splice(i, 1);
                    i--;
                }
            }

            if (sticky.length > 0) {
                stickyDate = moment(sticky[0].created_at).format('X');

                if (stickyDate >= settings.get(settingKeys.stickyDate)) {
                    sticky = '<p datetime="'+sticky[0].created_at+'">'+sticky[0].body.plain+'</p>';

                    settings.set(settingKeys.sticky, sticky);
                    settings.set(settingKeys.stickyDate, stickyDate);

                    prependSticky();
                }

            } else if (settings.get(settingKeys.sticky)) {
                prependSticky();
            }
        } else {
            settings.set(settingKeys.stickyDate, 0);
            elements.sticky.addClass(classes.hidden);
        }

        return messages;
    }


    function parseMessages(response) {
        var users = {},
            ref_msgs = {},
            yammerLinks = settings.get(settingKeys.yammerLinks);

        for (var i in response.references) {
            if (response.references.hasOwnProperty(i)) {
                var r = response.references[i];

                if (r.type === 'user') {
                    users[r.id] = r;
                    users[r.name] = r;
                } else if (r.type === 'message') {
                    ref_msgs[r.id] = r;
                } else if (r.type === 'group') {
                    users[r.id] = r;
                } else if (r.type === 'thread') {
                    users[r.id] = r;
                }
            }
        }

        for (i in response.messages) {
            if (response.messages.hasOwnProperty(i)) {
                var m = response.messages[i];

                if (m.sender_id) {
                    m.mugshot_url = users[m.sender_id].mugshot_url.replace('48x48', '96x96');
                    m.full_name = users[m.sender_id].full_name;
                    m.username = users[m.sender_id].name;
                }

                if (m.thread_id) {
                    m.thread_stats = users[m.thread_id].stats;
                }

                if (settings.get(settingKeys.groupId) === '-1') {
                    if (m.group_id) {
                        m.group_name = users[m.group_id].full_name;
                        m.group_url = users[m.group_id].web_url;
                    }
                }

                if (m.body.rich.indexOf('(See attached') === 0) {
                    for (var j in m.attachments) {
                        if (m.attachments.hasOwnProperty(j)) {
                            var a = m.attachments[j];

                            if (a.ymodule) {
                                m.body.rich = a.name;
                            }
                        }
                    }
                }

                m.body.rich = m.body.rich.replace(/br><br/g, 'br');

                if (yammerLinks) {
                    // Replace yammer links if 'Disable links to yammer' option is enabled
                    m.body.rich = m.body.rich.replace('href=\'https://www.yammer.com', '\'');
                    m.body.rich = m.body.rich.replace('href="https://www.yammer.com', '"');
                }

                if (m.replied_to_id) {
                    if (ref_msgs[m.replied_to_id]) {
                        if (ref_msgs[m.replied_to_id].sender_id) {
                            in_reply_to = users[ref_msgs[m.replied_to_id].sender_id];
                            m.in_reply_to = in_reply_to.full_name;
                        }
                    } else {
                        m.replied_to_id = null;
                    }
                }
            }
        }

        return response.messages;
    }


    function placeMessages(response) {
        //  Show feed
        var messages = parseMessages(response),
            messagescount = messages.length;

        if (messagescount > 0) {
            // Returns messages sans the sticky if it is present
            messages = makeSticky(messages);

            //  Store config.lastMessageId
            messages = storeLastMessageId(messages);

            // Add the messages to the page
            prependMessages(messages);

            // Friendly time
            formatCreationDates();

            // Tiled view vs regular view
            formatPosts(messages);
        }
    }


    function prependSticky() {
        // If sticky is less then a week old, attach it
        if ((moment().format('X') - settings.get(settingKeys.stickyDate)) < 60*60*24*7) {
            elements.sticky.html(sticky);
            elements.sticky.removeClass(classes.hidden);
        } else {
            // Clear the sticky if it's more than a week old
            settings.set(settingKeys.sticky, '');
            settings.set(settingKeys.stickyDate, '');

            elements.sticky.addClass(classes.hidden);
            elements.sticky.html('');
        }
    }


    function prependMessages(messages) {
        var postId = settings.get(settingKeys.postId) || '',
            messagescount = messages.length,
            olderReplies = settings.get(settingKeys.olderReplies),
            sores,
            post,
            updateCount,
            template,
            html;

        if (messagescount > 0) {
            updateCount = messages[0].thread_stats.updates;
        } else {
            updateCount = false;
        }

        if (settings.get(settingKeys.tiled)) {
            template = templates.tile;
        } else {
            template = templates.message;
        }

        html = template(messages);

        // Turn the response with replies in it into an array
        html = Array.prototype.slice.call($(html));

        // Reverse the order of messages
        html = html.reverse();

        // Appending replies to a post
        if (postId.length > 0) {

            // Select the post to which replies will be appended
            if (settings.get(settingKeys.modalPostAppend)) {
                post = elements.repliesExpanded;
            } else {
                post = $('#' + postId);
            }

            if (settings.get(settingKeys.tiled)) {
                var replies = '';

                var title = function() {
                    // Making an object which mimics the yammer repsponse message object so that reply count function can do it's thing
                    var message = {
                        'thread_id': postId,
                        'thread_stats': {
                            'updates': updateCount
                        }
                    };

                    updateReplyCount(message);

                    return '<h2>'+replies+'</h2>';
                };

                if (messagescount > 0 && messagescount <= config.messageLimit) {
                    sores = (messagescount === 1) ? ' reply' : ' replies';
                    replies = '<span class="num">' + (messagescount).toString() + '</span>' + sores;
                } else if ((messagescount === config.messageLimit) && (messagescount !== updateCount-1)) {
                    replies = 'Latest replies';
                } else {
                    replies = 'No replies yet :(';
                }

                post.append(title);
            }

            // Append to the original post
            $(html).appendTo(post);

            if ((messagescount === config.messageLimit) && (messagescount !== updateCount-1)) {
                if ((updateCount - config.messageLimit) > config.messageLimit) {
                    updateCount  = config.messageLimit;
                } else {
                    updateCount = updateCount - config.messageLimit - 1;
                }

                sores = (updateCount === 1) ? ' message' : ' messages';
                var viewOlderLink = '<a href="#" id="' + messages[messagescount-1].id + '" class="older-replies">View <span class="num">' + updateCount + '</span> older <span class="sores">' + sores + '</span></a>';

                $(viewOlderLink).insertAfter(post.find('h2'));
            }

            elements.spinner.hide();

            //  Truncate HTML
            truncateHTML(messagescount, post);

            // Reset the settings
            settings.set(settingKeys.appendPostReplies, 'false');
            settings.set(settingKeys.modalPostAppend, 'false');
            settings.set(settingKeys.postId, '');
        } else if (olderReplies) {
            var numRepliesInTitle = parseInt(elements.repliesExpanded.find('h2').find('.num').text());

            $(html).insertAfter($('.older-replies'));

            if (config.updateCount < config.messageLimit) {
                config.updateCount = config.messageLimit;
            }

            if (((updateCount - config.updateCount) - 1) <= config.messageLimit) {
                $('.older-replies').remove();

                config.updateCount = config.messageLimit;
            } else {
                $('.older-replies').attr('id', messages[messagescount-1].id);

                config.updateCount += messagescount;

                if ((updateCount - config.updateCount) === 2) {
                    $('.older-replies').find('.sores').text('message');
                    $('.older-replies').find('.num').text('1');
                }
            }

            elements.repliesExpanded.find('h2').find('.num').text(numRepliesInTitle + messagescount);
            settings.set(settingKeys.olderReplies, 'false');
        } else {
            html = html.reverse();
            $(html).prependTo(elements.feed);

            config.oldLastMessageId = config.lastMessageId;

            //  Truncate HTML
            truncateHTML(messagescount);
        }
    }


    function appendOldReplies(e) {
        e.preventDefault();

        var oldestId = $(this).attr('id');
        var threadId = $(this).parents('section').find('.post-expanded').attr('id');

        settings.set(settingKeys.olderReplies, 'true');

        feed.loadMessages('messages/in_thread/' + threadId + '.json?older_than=' + oldestId  + '&limit=' +  config.messageLimit, placeMessages);
    }


    function retrieveFeed() {
        // Reset feed
        config.lastMessageId = 0;
        config.oldLastMessageId = 0;
        elements.feed.html('');
        elements.sticky.html('');

        // Apply settings
        var groupId = settings.get(settingKeys.groupId),
            topicId = settings.get(settingKeys.topicId);

        if (groupId && util.isInt(groupId) && groupId != -1) {
            //  Load group feed
            feed.loadMessages('messages/in_group/' + groupId + '.json?threaded=true&limit=' +  config.messageLimit, placeMessages);
        } else if (topicId && util.isInt(topicId)) {
            //  Load topic feed
            feed.loadMessages('messages/about_topic/' + topicId + '.json?threaded=true&limit=' +  config.messageLimit, placeMessages);
        } else {
            //  Load All Company/Network Feed
            feed.loadMessages('messages.json?threaded=true&limit=' + config.messageLimit, placeMessages);
        }
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

        feed.loadMessages('messages/in_thread/' + threadId + '.json?limit=' +  config.messageLimit, placeMessages);
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

            feed.loadMessages('messages/in_thread/' + threadId + '.json', placeMessages);
        } else {
            clickedLink.parents('.yam').find('.reply').toggle();
            clickedLink.parents('.yam').find('.reply').remove();
        }
    }


    function storeLastMessageId(messages) {
        for (var i = 0; i < messages.length; i++) {
            if (messages[i].id > config.lastMessageId) {
                config.lastMessageId = messages[i].id;
            } else if (config.oldLastMessageId !== 0 && settings.get(settingKeys.appendPostReplies) !== 'true') {
                updateReplyCount(messages[i]);

                // Remove old messages only if they are already on the page
                var id = messages[i].id;
                var post = $('#' + id);

                if (post.length > 0) {
                    messages.splice(i, 1);
                    i--;
                }
            }
        }

        return messages;
    }


    function tilePosts() {
        var tiles = $('.feed > div');

        tiles.addClass(classes.tile);

        tiles.each(function() {
            var $this = $(this);

            if ($this.find('.messagebody').first()) {
                // Grab the text of the message without any extras and whitespaces
                var text = $($this.find('.messagebody').first()[0]).text().replace('(less)', '').trim();

                // Assign a class on a tile based on length of the message
                if (text.length > 750) {
                    $this.addClass(classes.largeTile);
                } else if (text.length > 500) {
                    $this.addClass(classes.mediumTile);
                } else {
                    $this.addClass(classes.smallTile);
                }
            }
        });

        elements.container.addClass(classes.tiled_view);

        if ($('.feed .yam').length) {
            elements.feed.masonry('reloadItems');

            elements.feed.masonry({
                itemSelector: '.tile',
                gutter: 20,
                columnWidth: 355
            });
        }
    }


    function timerHandler() {
        formatCreationDates();

        if (config.count % config.loadDelay === 0) {
            var groupId = settings.get(settingKeys.groupId),
                topicId = settings.get(settingKeys.topicId);

            if (groupId && util.isInt(groupId) && groupId !== '-1') {
                // Load group feed
                feed.loadMessages('messages/in_group/' + groupId + '.json?threaded=true&newer_than=' +  config.lastMessageId, placeMessages);
            } else if (topicId && util.isInt(topicId)) {
                // Load topic feed
                feed.loadMessages('messages/about_topic/' + topicId + '.json?threaded=true&newer_than=' +  config.lastMessageId, placeMessages);
            } else {
                // Load All Company/Network feed
                feed.loadMessages('messages.json?threaded=true&newer_than=' + config.lastMessageId, placeMessages);
            }
        }

        if (config.count % config.showDelay === 0) {
            config.count = config.count + config.showDelay;
        }
    }


    function truncateHTML(messagescount, post) {
        if (settings.get(settingKeys.truncate) && !settings.get(settingKeys.tiled)) {
            // Truncating the replies to a post
            if (post) {
                var j;

                // Start truncating later if the post itself already contains truncated items
                if (post.find('.message').first().find('span.messagebody').length === 2) {
                    j = 2;
                } else {
                    j = 1;
                }

                for (var i = j; i < messagescount+1; i++) {
                    $(post.find('span.messagebody')[i]).truncate({ max_length: 275 });
                }
            } else {
                var messages = elements.feed.find('span.messagebody');

                // Truncating the messsages loaded that are not replies
                for (var k = 0; k < messagescount; k++) {
                    $(messages[k]).truncate({ max_length: 275 });
                }
            }
        }
    }


    function updateReplyCount(message) {
        // Find the post that needs the reply number updated
        var post = $('#'+message.thread_id.toString());

        // Find the element in the post that contains the number of replies
        var number = post.find('.'+classes.replyNumber);

        // Do things if the element with the number of replies exists
        if (number.length > 0) {
            // Change the number to the new one
            number.text((message.thread_stats.updates-1).toString());

            // Add the appropriate string after the number of remove the container element if there are 0 replies
            if (message.thread_stats.updates > 2) {
                number.next().text('replies');
            } else if (message.thread_stats.updates === 2) {
                number.next().text('reply');
            } else {
                number.parents('.replies').remove();
            }

        // If the element which contains the number of replies doesn't exist it means there have been 0 replies
        // and a reply container needs to be inserted after the message
        } else {
            if (message.thread_stats.updates === 2) {
                var replies = '<div class="'+classes.replies+'"><a href="#'+message.thread_id+'" class="'+classes.viewReplies+'"><span class="'+classes.replyNumber+'">1</span> <span>reply</span></a></div>';
                var messageContent = post.find('.message');
                $(replies).insertAfter(messageContent);
            }
        }
    }


    function initialise() {
        yam.getLoginStatus( function (response) {
            if (response.authResponse) {
                login(response);
            } else {
                elements.landing.removeClass(classes.hidden);

                yam.connect.loginButton(
                    '#yammer-login',
                    function (response) {
                        if (response.authResponse) {
                            login(response);
                        }
                    }
                );
            }
        });
    }


    initialise();

})(jQuery, moment, Handlebars, window, document);
