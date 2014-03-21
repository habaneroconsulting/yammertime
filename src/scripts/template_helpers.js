/*! template_helpers.js | Yammertime */

(function(Handlebars) {

    var classes = Yt.Constants.classes,
        settingKeys = Yt.Constants.settingKeys,
        settings = Yt.Settings;

    // See who liked the post
    Handlebars.registerHelper('like_count', function() {
        if (this.liked_by.count > 1) {
            var text = '',
                count = this.liked_by.names.length;

            for (var i = 0; i < count; i++) {
                if (i < count - 1) {
                    text += this.liked_by.names[i].full_name

                    if (i === count - 2 && this.liked_by.count < 4) {
                        text += ' ';
                    } else {
                        text += ', ';
                    }
                } else {
                    if (this.liked_by.count > 3) {
                        text += this.liked_by.names[i].full_name + ' ';
                    } else {
                        text += 'and ' + this.liked_by.names[i].full_name;
                    }
                }
            }

            if (this.liked_by.count > 3) {
                text += 'and ' + (this.liked_by.count - 3).toString();
                text += (this.liked_by.count - 3 === 1) ? ' other' : ' others';
            }

            return new Handlebars.SafeString(
                text + ' like'
            );
        } else {
            return new Handlebars.SafeString(
                this.liked_by.names[0].full_name + ' likes'
            );
        }
    });


    //  Helper for hiding yammer links
    Handlebars.registerHelper('link_helper', function() {
        var yammerLinks = settings.get(settingKeys.yammerLinks);

        if (yammerLinks) {
            return new Handlebars.SafeString('id');
        }

        return new Handlebars.SafeString('href');
    });


    // Return 'View # replies' or  'View reply' depending on the number of replies
    Handlebars.registerHelper('update_count', function() {
        var numUpdates = parseInt(this.thread_stats.updates) - 1,
            replies = '<div class="' + classes.replies + '">';

        if (numUpdates > 1) {
            return new Handlebars.SafeString(
                replies +
                    '<a href="#' + this.thread_id + '" class="' + classes.viewReplies + '">' +
                        '<span class="' + classes.replyNumber + '">' + numUpdates + '</span> ' +
                        '<span>replies</span>' +
                    '</a>' +
                '</div>'
            );
        } else if (numUpdates === 1){
            return new Handlebars.SafeString(
                replies +
                    '<a href="#' + this.thread_id + '" class="' + classes.viewReplies + '">' +
                        '<span class="' + classes.replyNumber + '">1</span> ' +
                        '<span>reply</span>' +
                    '</a>' +
                '</div>'
            );
        }
    });

})(Handlebars);