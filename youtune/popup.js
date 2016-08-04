// Copyright (c) 2014 All Right Reserved, http://bendeg.us/
// Please Contact Me for Deals & More Information.
// Szabó Bendegúz (szabo@bendeg.us)

function init() {
    open_playlist(localStorage.last_media.as_array().playlist_id);
    set_content();
    set_threat();
    set_window();
    set_listeners();
}

// => CONSTANTES

var BG = chrome.extension.getBackgroundPage()

var $ = {
    NARROW_POPUP_SIZE : {
        X : 200
    },
    WIDE_POPUP_SIZE : {
        X : 460,
        Y : 600
    },
    RESIZE_MAGNIFICATION_SENSITIVITY : 15
};

// => CONSTANTES

var open_playlist = function(playlist_id) {
    load_file.xml({ xml         : playlist_id,
                    selector    : 'feed',
                    objects_tag : 'entry'});
}

function select_video(video_id) {
    var selected_video = className('selected_video')[0];
    if (selected_video)
        selected_video.removeClass('selected_video');

    console.log(video_id)

    var video = id(video_id);
    if (video)
        video.addClass('selected_video');
}

// When You START a Video
function set_play() {
    id('play_stop_player_option').src = BG.ASSETS.POPUP_STOP

    chrome.browserAction.setIcon({path : BG.ASSETS.STOP_48 }, function() {});

    BG.PLAYING = false;
    BG.current_message({cmd : {play: null}});
}

// When You STOP a Video
function set_stop() {
    id('play_stop_player_option').src = BG.ASSETS.POPUP_PLAY

    chrome.browserAction.setIcon({path : BG.ASSETS.PLAY_48 }, function() {});

    BG.PLAYING = true;
    BG.current_message({cmd : {pause : null}});
}

function set_next() {
    BG.current_message({cmd : {next : null}});
}

function set_prev() {
    BG.current_message({cmd : {previous : null}});
}

var dragged_pos, dragged_page_size;
var set_window = function(e) {
    var page = id('page');
    var content = id('content');

    if (e) {
        if (!dragged_pos) {
            dragged_pos = {
                x: e.pageX,
                y: e.pageY
            };
            dragged_page_size = {
                width: page.offsetWidth,
                height: content.offsetHeight
            };
        }

        var calc_x = (dragged_page_size.width + dragged_pos.x - e.pageX) - 15; // - 15 for margin
        var calc_y = (dragged_page_size.height - dragged_pos.y + e.pageY);

        var min_height = id('player_options').offsetHeight + id('footer').offsetHeight - 1;

        if (calc_x + $.RESIZE_MAGNIFICATION_SENSITIVITY > $.WIDE_POPUP_SIZE.X)
            calc_x = $.WIDE_POPUP_SIZE.X;

        if (calc_y - $.RESIZE_MAGNIFICATION_SENSITIVITY < 0)
            calc_y = 0;
        else if (calc_y + $.RESIZE_MAGNIFICATION_SENSITIVITY > $.WIDE_POPUP_SIZE.Y - min_height - 1) {
            calc_y = $.WIDE_POPUP_SIZE.Y - min_height - 1;

            page.className = 'on_resize_x';
        } else
            page.className = 'on_resize_all';


        // if (localStorage.last_media) {
        //     var video = id(localStorage.last_media.as_array().video_id);
        //     if (video)
        //         video.scrollIntoView();
        // }

        var some_video = className('video');
        if ((some_video.length > 0) && (calc_y - $.RESIZE_MAGNIFICATION_SENSITIVITY < some_video[0].offsetHeight) && (calc_y + $.RESIZE_MAGNIFICATION_SENSITIVITY > some_video[0].offsetHeight))
            calc_y = some_video[0].offsetHeight + 2;

        page.style.width     = calc_x + 'px';
        content.style.height = calc_y + 'px';
    } else {
        if (!localStorage.popup_width)  localStorage.popup_width = $.NARROW_POPUP_SIZE.X;
        if (!localStorage.popup_height) localStorage.popup_height = min_height;

        page.style.width           = localStorage.popup_width + 'px';
        document.body.style.width  = localStorage.popup_width + 'px';
        content.style.height       = localStorage.popup_height + 'px';
        document.body.style.height = localStorage.popup_height + 'px';
    }
}

var set_time = function(e) {
    var current_time  = id('current_time');
    var current_text  = id('current_text');
    var duration_text = id('duration_text');

    if (e.pageX) {
        if (e.pageX < document.body.offsetWidth) {
            current_time.style.width = (e.pageX / document.body.offsetWidth * 100) + '%';

            if (localStorage.last_media && e.pageX > 0){
                var new_time = localStorage.last_media.as_array().duration * (e.pageX / document.body.offsetWidth);
                
                BG.current_message({cmd : {time : new_time}});

                current_text.innerHTML = new_time.format_seconds();
            }
        }
    } else if (e.time) {
        current_time.style.width = (e.time / e.duration * 100) + '%';

        current_text.innerHTML = e.time.format_seconds();
        duration_text.innerHTML = ' / ' + e.duration.format_seconds();
    }
}

var set_content = function() {
    
    document.body.addClass(localStorage.popup_color);
//
    if (localStorage.last_media)
        set_time(localStorage.last_media.as_array())
//

    // if (BG.PLAYING != true)
        set_play();
}

var set_threat = function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // if (request.command) {
            // if (request.command == 'START')
                // set_play();
            // else if (request.command == 'STOP')
                // set_stop();
       /* } else */

        if (request.media && (on_setting_time == false))
            set_time(request.media);

        if ((className('selected_video').length == 0) || (className('selected_video')[0].id != request.media.video_id))
            select_video(request.media.video_id);
    });
}

var on_setting_time = false;
var set_listeners = function() {
    var content = id('content');
    var body = document.body;

    // TIME CONTROLLER

    var time_bar = id('time_bar');
    time_bar.addEventListener('mousedown', function(e){
        on_setting_time = true;

        time_bar.addClass('selected_time_bar');

        set_time(e);

        content.style.webkitUserSelect = 'none';
        body.style.cursor = 'pointer';

        document.addEventListener('mousemove', set_time , false);

        document.addEventListener('mouseup', function(){
            on_setting_time = false;

            content.style.webkitUserSelect = 'text';
            body.style.cursor = 'default';

            document.removeEventListener('mousemove', set_time);
            time_bar.removeClass('selected_time_bar');
        });
    });

    // END of TIME CONTROLLER

    // PLAYER OPTIONS

    id('play_stop_player_option').addEventListener('click', function() {
        (BG.PLAYING == true) ? set_play() : set_stop();
    });
    
    id('next_player_option').addEventListener('click', function() {
        set_next();
    });

    id('prev_player_option').addEventListener('click', function() {
        set_prev();
    });

    // END of PLAYER OPTIONS

    // RESIZER
    

    var id = function(_id) {return document.getElementById(_id);}

    id('div_box').addEventListener('mousedown', function() {

        // amikor méretezel

        document.addEventListener('mousemove', function(e){
            console.log(e.pageX)
        }, false);

        document.addEventListener('mouseup', function(){
            page.className = null;

            document.removeEventListener('mousemove', set_window);

            localStorage.popup_width  = page.offsetWidth;
            localStorage.popup_height = content.offsetHeight;
            
            body.style.width  = page.offsetWidth + 'px'
            body.style.height = page.offsetHeight + 'px'

            dragged_content_size = null;
            dragged_pos          = null;
        });
    });




    id('resizer').addEventListener('mousedown', function() {
        var page = id('page');

        page.className = 'on_resize_all';

        body.style.width  = $.WIDE_POPUP_SIZE.X + 'px';
        body.style.height = $.WIDE_POPUP_SIZE.Y + 'px';

        document.addEventListener('mousemove', set_window, false);

        document.addEventListener('mouseup', function(){
            page.className = null;

            document.removeEventListener('mousemove', set_window);

            localStorage.popup_width  = page.offsetWidth;
            localStorage.popup_height = content.offsetHeight;
            
            body.style.width  = page.offsetWidth + 'px'
            body.style.height = page.offsetHeight + 'px'

            dragged_content_size = null;
            dragged_pos          = null;
        });
    });

    // END of RESIZER

    // SWITCH COLOR

    id('switch_color').addEventListener('click', function() {
        if (className('on_switch_color').length == 0) {
            body.addClass('on_switch_color');

            if (className('light').length > 0) {
                body.removeClass('light');
                body.addClass('dark');

                localStorage.popup_color = 'dark';
            } else {
                body.removeClass('dark');
                body.addClass('light');

                localStorage.popup_color = 'light';
            }

            setTimeout(function() {
                body.removeClass('on_switch_color');
            },100)
        }
    });

    // END of SWITCH COLOR
}

document.addEventListener('DOMContentLoaded', function() {
    init();
});