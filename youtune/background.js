// Copyright (c) 2014 All Right Reserved, http://bendeg.us/
// Please Contact Me for Deals & More Information.
// Szabó Bendegúz (szabo@bendeg.us)

function init() {
    set_defaults();
    set_listeners();
}

// HELPERS
Object.prototype.as_array = function()     {return this ? JSON.parse(this) : [];};
Object.prototype.as_json  = function()     {return this ? JSON.stringify(this) : {};};
String.prototype.params   = function(name) {return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(this)||[,""])[1].replace(/\+/g, '%20'))||null;};
// END of HELPERS

// DEFAULTS

var set_defaults = function() {
    if (!localStorage.last_media)
        localStorage.last_media = '{ \
            "time"        : 0, \
            "duration"    : 145, \
            "video_id"    : "oNuX7bs2qAM", \
            "playlist_id" : "PL2gRhdDJP5P_Wu_XE3osZe8CmlfO0Z7Wk" \
        }'

    if (!localStorage.popup_color)
        localStorage.popup_color = 'light';

    if (!localStorage.popup_height || !localStorage.popup_width) {
        localStorage.popup_width  = 300;
        localStorage.popup_height = 350;
    }

    //

    window.PLAYING = false;
    window.TABS = new Array();
    TABS.push({
        tab_id : null,
        media  : localStorage.last_media.as_array()
    });

    window.ASSETS = {
        POPUP_PLAY : '/assets/images/popup/play_30.png',
        POPUP_STOP : '/assets/images/popup/stop_30.png',
        PLAY_48    : '/assets/images/icons/play_48.png',
        STOP_48    : '/assets/images/icons/stop_48.png'
    };

    //

    chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
}

// END of DEFAULTS

function tab_exist(tab_id, on_exist, on_not_exists) {
    chrome.windows.getAll({ populate: true }, function (windows) {
        for (var i = 0, window; window = windows[i]; i++) {
            for (var j = 0, tab; tab = window.tabs[j]; j++) {
                if (tab.id == tab_id) {
                    on_exist && on_exist(tab);
                    return;
                }
            }
        }
        on_not_exists && on_not_exists();
    });
}

Object.prototype.create_tab = function() {
    if (this.media.playlist_id)
        var media_url = "http://www.youtube.com/watch?v=" + this.media.video_id + "&list=" + this.media.playlist_id;
    else
        var media_url = "http://www.youtube.com/watch?v=" + this.media.video_id;

    console.log("New Tab with URL: " + media_url)

    chrome.tabs.create({ url: media_url });
}

var current_tab = function() {
    return TABS[TABS.length-1] || null;
}

var current_message = function(message) {
    var tab = current_tab();
    try {
        chrome.tabs.sendMessage(tab.tab_id, message);
    } catch(e) {
        // tab.create_tab();

        console.log(e);
    }
}

var register_tab = function(sender, media) {
    var tab = sender.tab || sender;

    for (var i = 0; i < TABS.length; i++) {
        if (TABS[i].tab_id == tab.id) {
            TABS.splice(i,1);
            i--;
        } else if (TABS[i].tab_id != null) {
            try {
                chrome.tabs.sendMessage(TABS[i].tab_id, {cmd : {thread : false}});
            } catch(e) {
                console.log(e);
            }
        }
    }
    
    TABS.push({
        tab_id : tab.id,
        media  : (media || null)
    });
}

// LISTENERS
    var detect_changes = function(media) {
        // INDICATE LAST 9 SECONDS
            var diff = Math.ceil(media.duration - media.time);
            if (diff < 10 && diff > 0) chrome.browserAction.setBadgeText({text : diff.toString() });
            else                       chrome.browserAction.setBadgeText({text : '' });


        // DETECT PLAY OR PAUSE
            var media_JSON = media.as_json();

            if (media_JSON != localStorage.last_media) {
                localStorage.last_media = media_JSON;

                if (PLAYING == false) {
                    chrome.browserAction.setIcon({ path: ASSETS.STOP_48 }, function() {});
                    PLAYNG = true;
                }
            } else if ((media_JSON == localStorage.last_media) && (PLAYNG == true)) {
                chrome.browserAction.setIcon({ path: ASSETS.PLAY_48 }, function() {});
                PLAYNG = false;
            }
    }


    var set_listeners = function() {
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (TABS.length == 0 || (sender.tab.id != current_tab().tab_id))
                register_tab(sender, request.media);
            else if (request.media)
                detect_changes(request.media);

            console.log(localStorage.last_media);
        });

        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (tab.url.params('v')) {
                if (tab.id != current_tab().tab_id) 
                    register_tab(tab);

                PLAYING = true;
                chrome.browserAction.setIcon({ path: ASSETS.STOP_48 }, function() {});

                try {
                    chrome.tabs.sendMessage(tab.id, {cmd : {thread : true}});
                } catch(e) {
                    console.log(e);
                }
            }
        });
    };
// END of LISTENERS

init();