// Copyright (c) 2014 All Right Reserved, http://bendeg.us/
// Please Contact Me for Deals & More Information.
// Szabó Bendegúz (szabo@bendeg.us)

var error_DOM_txt = "<div id='donate'> \
                        <div id='donate_title'> \
                            ERR()R \
                        </div> \
                        <div id='donate_desc'> \
                            YouTune is just a beta yet, please <a href='http://bendeg.us/donate'>Donate</a> to our team to make it <a href='http://bendeg.us/errors'>Error-Free</a>. \
                        </div> \
                    </div>"

                    
                    // <div id='donate_creator'> \
                    //     Szabó Bendegúz \
                    // </div> \

Array.prototype.show_as_playlist = function() {
    var content = id('content');

    for (var i = 0; i < this.length; i++) {
        var video = content.new_obj({class: 'video', id: this[i].video_id});
            video.addEventListener('click', function(){
                select_video(this.id);
            });

        var thumbnail_div = video.new_obj({class: 'thumbnail_div'});
        var thumbnail     = thumbnail_div.new_obj({type: 'img', class: 'thumbnail'});
        var duration      = thumbnail_div.new_obj({class: 'duration'});
        var position      = thumbnail_div.new_obj({class: 'position'});

        var video_content = video.new_obj({class: 'video_content'});
        var title         = video_content.new_obj({class: 'title'});
        var views         = video_content.new_obj({class: 'views'});
        var author        = video_content.new_obj({class: 'author'});

        var votes         = thumbnail_div.new_obj({class: 'votes'});
        var likes         = votes.new_obj({class: 'likes'});
        

        title.innerHTML    = this[i].title;
        title.title        = this[i].title;
        likes.style.width  = (parseInt(this[i].likes) / (parseInt(this[i].dislikes) + parseInt(this[i].likes)) * 100) + '%'

        thumbnail.src      = this[i].thumbnail
        position.innerHTML = i + 1 + '.';
        duration.innerHTML = this[i].duration.format_seconds();  // ►
        author.innerHTML   = 'by: ' + this[i].author
        views.innerHTML    = this[i].views.format_number(',');

        // if (i + 1 == this.length){
        //     var donate = content.new_obj({id: 'donate'});
        //     donate.new_obj({id: 'donate_text'}).innerHTML = '&nbsp Please DONATE If You Are Interested<br />by the ENDING . . &nbsp'
        // }
    }

    if (localStorage.last_media) {
        select_video(localStorage.last_media.as_array().video_id);

        // var video_div = id(localStorage.ytp_last_media.as_array().video_id);
        // if (video_div)
            // video_div.scrollIntoView();
        // else
            // console.log("List doesn't contain this video.");
    }

    select_video(localStorage.last_media.as_array().video_id);

    if (className("selected_video")[0])
        className("selected_video")[0].scrollIntoView();
}

var load_file = {
    xml: function(params) {
        var content = id('content');
        content.className = 'loading';

        window.params = params;

        try {
            var xml_url =  'https://gdata.youtube.com/feeds/api/playlists/' + params.xml + '?v=2';
            console.log('playlist_url: ' + xml_url);

            var req = new XMLHttpRequest();
                req.open("GET", xml_url, true);
                req.onload = this.on_load.bind(this);
                req.send(null);

        } catch(e) {
            console.log(e);

            content.innerHTML = error_DOM_txt;
            content.className = 'error';
        }
    },

    on_load: function (e) {
        var content = id('content');

        try {
            var items = e.target.responseXML.querySelectorAll(params.selector)[0];

            var prefix = {
                media : items.getAttribute('xmlns:media'),
                yt    : items.getAttribute('xmlns:yt'),
                gd    : items.getAttribute('xmlns:gd')
            }

            var deeper_items = items.tag(params.objects_tag);
            var output = new Array();
            for (var i = 0; i < deeper_items.length; i++) {
                var output_object = {
                    title     : null,
                    author    : null,
                    thumbnail : null,
                    views     : null,
                    duration  : null,
                    video_id  : null,
                    likes     : 0,
                    dislikes  : 0
                };

                try {
                    var media_group = deeper_items[i].tagNS("group", prefix.media)[0];
                

                    output_object.title     = deeper_items[i].tag('title')[0].textContent;
                    output_object.author    = media_group.tagNS("credit", prefix.media)[0].getAttribute('yt:display');
                                         // = deeper_items[i].tag('author')[0].tag('name')[0].textContent;
                    output_object.video_id  = media_group.tagNS("videoid", prefix.yt)[0].textContent;
                    output_object.duration  = media_group.tagNS("duration", prefix.yt)[0].getAttribute('seconds');
                    output_object.thumbnail = media_group.tagNS("thumbnail", prefix.media)[2].getAttribute('url');

                    var rating = deeper_items[i].tagNS("rating", prefix.yt)[0];
                    // if (rating) {
                        output_object.likes     = rating.getAttribute('numLikes');
                        output_object.dislikes  = rating.getAttribute('numDislikes');
                    // }

                    output_object.views     = deeper_items[i].tagNS("statistics", prefix.yt)[0].getAttribute('viewCount');

                    output.push(output_object)
                } catch(e) {
                    console.log(e);
                }
            }

            content.className = null;
            output.show_as_playlist();

        } catch(e) {
            console.log(e);

            var donate = content.new_obj({id: 'donate'});
            donate.new_obj({id: 'donate_text'}).innerHTML = '&nbsp Please DONATE If You Are Interested<br />by the ENDING . . &nbsp'

            content.innerHTML = error_DOM_txt;
            content.className = 'error';
        }
    }
};
