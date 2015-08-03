/*! constants.js | Yammertime */

var Yt = Yt || {};
Yt.Constants = Yt.Constants || {};

(function(module) {

	module.classes = {
		hidden: 'hidden',
		largeText: ' large text ',
		largeTile: 'large',
		mediumText: ' medium text ',
		mediumTile: 'medium',
		noScroll: 'no-scroll',
		noScrollbar: 'no-scrollbar',
		pushSettings: 'push_3',
		replies: 'replies',
		replyNumber: 'reply-number',
		smallText: ' small text ',
		smallTile: 'small',
		tile: 'tile',
		tiled_view: 'tiled-view',
		viewReplies: 'view-replies',
		xlargeText: ' xlarge text '
	};

	module.defaultConfig = {
		accessTokens: {},
		animationDelay: 10000,
		cookie: 'networkPermalink',
		count: 3000,
		idleWait: 5,
		lastMessageId: 0,
		lastMessageTime: '',
		loadDelay: 15000,
		messageLimit: 20,
		oldLastMessageId: 0,
		showDelay: 3000,
		textSize: 'medium',
		updateCount: 0
	};

	// Default settings
	module.defaultSettings = {
        bgColor      : '#455560',
        debug        : 'false',
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

	module.settingKeys = {
		appendPostReplies: 'appendPostReplies',
		bgColor: 'bgColor',
		debug: 'debug',
		fullName: 'fullName',
		groupId: 'groupId',
		logoUrl: 'logoUrl',
		modalPostAppend: 'modalPostAppend',
		networkId: 'networkId',
		networkName: 'networkName',
		networkPermalink: 'networkPermalink',
		networkToken: 'networkToken',
		noDefaults: 'noDefaults',
		olderReplies: 'olderReplies',
		postId: 'postId',
		postRotation: 'postRotation',
		showSticky: 'showSticky',
		sticky: 'sticky',
		stickyDate: 'stickyDate',
		textSize: 'textSize',
		tiled: 'tiled',
		topicId: 'topicId',
		topicName: 'topicName',
		truncate: 'truncate',
		yammerLinks: 'yammerLinks'
	};

})(Yt.Constants);