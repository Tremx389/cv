// Copyright (c) 2014 All Right Reserved, http://bendeg.us/
// Please Contact Me for Deals & More Information.
// Szabó Bendegúz (szabo@bendeg.us)

function init() {
    set_constantes();
    set_listeners();

    start_thread(1000);
}

// HELPERS

Object.prototype.tag    = function(_tag)   {return this.getElementsByTagName(_tag);};
String.prototype.params = function(name)   {return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(this)||[,""])[1].replace(/\+/g, '%20'))||null;};
var className           = function(_class) {return document.getElementsByClassName(_class);};
var id                  = function(_id)    {return document.getElementById(_id);};

// END of HELPERS

// COMMANDS

var cmd_play = function(video_id) {
    try {
        id('movie_player').playVideo();
        return true;
    } catch(e) {
        console.log(e);

        return false;
    }
}

var cmd_pause = function() {
    try {
        id('movie_player').pauseVideo();
        
        return true;
    } catch(e) {
        console.log(e);

        return false;
    }
}

var cmd_time = function(time) {
    try {
        id('movie_player').seekTo(time, true);
    } catch(e) {
        console.log(e);
    }
}

var cmd_next = function() {
    try {
        id('movie_player').nextVideo();
    } catch(e) {
        console.log(e);
    }
}

var cmd_previous = function() {
    try {
        id('movie_player').previousVideo();
    } catch(e) {
        console.log(e);
    }
}

// END of COMMANDS

// GETTINGS


var playlist_id = null;
var get_playlist_id = function() {
    console.log('started_to looking for')
    if (window.location.search.params('list'))
        playlist_id = window.location.search.params('list');
    else {
        var watch_bar = id('watch-related');
        var a_elements = watch_bar.tag('a');
        for (var i = 0; i < a_elements.length; i++)
            if (a_elements[i].href.params('list')) {
                playlist_id = a_elements[i].href.params('list');
                break;
            }
    }
}

var video_id = null;
var get_video_id = function() {
    video_id = window.location.search.params('v') || null;
}

var set_constantes = function() {
    get_playlist_id();
    get_video_id();
}

var get_media = function() {
    try {
        return {
            time        : id('movie_player').getCurrentTime(),
            duration    : id('movie_player').getDuration(),
            video_id    : video_id,
            playlist_id : playlist_id
        };
    } catch(e) {
        console.log(e);

        return 'asd';
    }
}

// END of GETTINGS

// THREAD

var main_thread = null;

var thread = function() {
    chrome.runtime.sendMessage({media : get_media()});
}

var start_thread = function(time) {
    console.log('THREAD STARTED!');

    set_constantes();

    if (main_thread == null)
        main_thread = setInterval(thread, time);
}

var stop_thread = function() {
    console.log('THREAD STOPPED!');

    clearInterval(main_thread);
    main_thread = null;
}

// END of THREAD

// LISTENERS

    var set_listeners = function() {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            var cmd = request.cmd;
            console.log(cmd)

            if (cmd) {
                if (!(typeof cmd.play === "undefined"))
                    sendResponse(cmd_play(cmd.play));
                else if (!(typeof cmd.pause === "undefined"))
                    sendResponse(cmd_pause());
                else if (!(typeof cmd.time === "undefined"))
                    cmd_time(cmd.time);
                else if (!(typeof cmd.next === "undefined"))
                    cmd_next();
                else if (!(typeof cmd.previous === "undefined"))
                    cmd_previous();
                else if (cmd.thread == true)
                    start_thread(1000);
                else if (cmd.thread == false)
                    stop_thread();
                else
                    console.log('Invalid Command');
            }
        });
    }

// END of LISTENERS

init();