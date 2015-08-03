/*! utilities.js | Yammertime */

var Yt = Yt || {};
Yt.Util = Yt.Util || {};

(function(module, $, window, document, undefined) {

    var classes = Yt.Constants.classes;

    /**
     * Adds support for the .trim() method in IE8 and lower
     */
    module.addTrim = function () {
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }
    };


    /**
     * Add options to a dropdown
     */
    module.addOptions = function (select, data, nameKey, valueKey) {
        select.empty();

        $.each(data, function(index, item) {
            select.get(0).options.add(new Option(item[nameKey], item[valueKey]));
        });
    };


    /**
     * Determines if input is an integer.
     */
    module.isInt = function (x) {
        var y = parseInt(x);

        if (isNaN(y)) {
            return false;
        }

        return x == y && x.toString() == y.toString();
    };


    /**
     * Determines if input is a URL
     */
    module.isUrl = function (str) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        return regexp.test(str);
    };


    module.getElements = function() {
        return {
            body: $('body'),
            closeButton: $('.close-button'),
            container: $('.container'),
            cancelButton: $('.settings button[name="cancel"]'),
            feed: $('.feed'),
            header: $('.header'),
            headerLogo: $('.header-logo'),
            landing: $('.landing'),
            logout: $('#logout'),
            mainContent: $('.main'),
            overlay: $('.overlay'),
            overlayExpanded: $('.expanded.modal'),
            postExpanded: $('.post-expanded'),
            repliesExpanded: $('.replies-expanded'),
            settings: $('#settings'),
            settingsDialog: $('.settings'),
            settingsForm: $('.settings form'),
            settingsInputs: $('.settings form :input[name!="color"][name!="logoUrl"][name!="text-size"][name!="post-rotation"]'),
            spinner: $('#spinner'),
            sticky: $('.sticky'),
            tile: $('.tile'),
            viewReplies: $('.view-replies'),

            color: $('.settings input[name="color"]'),
            group: $('.settings select[name="group"]'),
            logoUrl: $('.settings input[name="logoUrl"]'),
            network: $('.settings select[name="network"]'),
            postRotation: $('.settings input[name="post-rotation"]'),
            remove: $('.settings input[name="remove"]'),
            showSticky: $('.settings input[name="show-sticky"]'),
            submitButton: $('.settings button[name="submit"]'),
            textSize: $('.settings select[name="text-size"]'),
            tiled: $('.settings input[name="tiled"]'),
            topic: $('.settings input[name="topic"]'),
            truncate: $('.settings input[name="truncate"]'),
            yammerLinks: $('.settings input[name="yammer-links"]')
        };
    };


    /**
     * Toggle scrolling on the body element
     */
    module.toggleScroll = function () {
        $('body').toggleClass(classes.noScroll)
            .toggleClass(classes.noScrollbar);
    };


    /**
     * Error handler
     */
    module.requestErrorHandler = function (msg) {
        if (console && console.log) {
            console.log('An error has occured:', msg);
        }
    };

    /**
     * console.log wrapper - will only log the first 2 arguments
     */
    module.log = function (msg1, msg2) {
        if (!msg2) {
            msg2 = "";
        }

        if (console && console.log) {
            console.log(msg1, msg2);
        }
    };


    module.addTrim();

})(Yt.Util, jQuery, window, document);