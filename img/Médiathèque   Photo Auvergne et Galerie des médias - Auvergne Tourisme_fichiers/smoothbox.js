/*
 * Smoothbox v20080623 by Boris Popoff (http://gueschla.com)
 * To be used with MooTools 1.2
 *
 * Based on Cody Lindley's Thickbox, MIT License
 *
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */

// on page load call TB_init
window.addEvent('domready', TB_init);

// prevent javascript error before the content has loaded
TB_WIDTH = 0;
TB_HEIGHT = 0;
var TB_doneOnce = 0;

// add smoothbox to href elements that have a class of .smoothbox
function TB_init(){
    $$("a.smoothbox").each(function(el){
        el.onclick = TB_bind;
    });
}

function TB_bind(event){
	if ( $chk(event) )
	{
		var event = new Event(event);
		// stop default behaviour
		event.preventDefault();
	}
	// remove click border
    this.blur();
    // get caption: either title or name attribute
    var caption = this.title || this.name || "";
    // get rel attribute for image groups
    var group = this.rel || false;
    // display the box for the elements href
    TB_show(caption, this.href, group);
    this.onclick = TB_bind;
    return false;
}

// called when the user clicks on a smoothbox link
function TB_show(caption, url, rel){
    // create iframe, overlay and box if non-existent
	if ( SlideShowInterest )
		SlideShowInterest.getInstance().stop();

	if (!$("TB_overlay")) {
        new Element('iframe').setProperty('id', 'TB_HideSelect').injectInside(document.body);
        $('TB_HideSelect').setOpacity(0);
        new Element('div').setProperty('id', 'TB_overlay').injectInside(document.body);
        $('TB_overlay').setOpacity(0);
        TB_overlaySize();
        new Element('div').setProperty('id', 'TB_load').injectInside(document.body);
        $('TB_load').innerHTML = "<img src='img/global/loading.gif' />";
        TB_load_position();

        $('TB_overlay').set('tween', {
            duration: 400
        });
        $('TB_overlay').tween('opacity', 0, 0.8);

    }

    if (!$("TB_load")) {
        new Element('div').setProperty('id', 'TB_load').injectInside(document.body);
        $('TB_load').innerHTML = "<img src='img/global/loading.gif' />";
        TB_load_position();
    }

    if (!$("TB_window")) {
        new Element('div').setProperty('id', 'TB_window').setStyle('display', 'none').injectInside(document.body);
        $('TB_window').setOpacity(0);
    }

    $("TB_overlay").onclick = TB_remove;
    window.onscroll = TB_position;

    // check if a query string is involved
    var baseURL = url.match(/(.+)?/)[1] || url;

    // regex to check if a href refers to an image
    var imageURL = /\.(jpe?g|png|gif|bmp)/gi;

    // check for images
    if (baseURL.match(imageURL)) {
        var dummy = {
            caption: "",
            url: "",
            html: ""
        };

        var prev = dummy, next = dummy, imageCount = "";

        // if an image group is given
        if (rel && (bLaunchAuto == undefined || !$defined(bLaunchAuto) || !$chk(bLaunchAuto) || bLaunchAuto !== true ) ) {
            function getInfo(image, id, label){
                return {
                    caption: image.title,
                    url: image.href,
                    html: "<span id='TB_" + id + "'>&nbsp;&nbsp;<a href='javascript:void(0);'>" + label + "</a></span>"
                }
            }

            // find the anchors that point to the group
            var imageGroup = [];
            $$("a.smoothbox").each(function(el){
                if (el.rel == rel) {
                    imageGroup[imageGroup.length] = el;
                }
            })

            var foundSelf = false;

            // loop through the anchors, looking for ourself, saving information about previous and next image
            for (var i = 0; i < imageGroup.length; i++) {
                var image = imageGroup[i];
                var urlTypeTemp = image.href.match(imageURL);

                // look for ourself
                if (image.href == url) {
                    foundSelf = true;
                    imageCount = (i + 1) + " / " + (imageGroup.length);
                }
                else {
                    // when we found ourself, the current is the next image
                    if (foundSelf) {
                        next = getInfo(image, "next", " &gt;&gt;");
                        // stop searching
                        break;
                    }
                    else {
                        // didn't find ourself yet, so this may be the one before ourself
                        prev = getInfo(image, "prev", "&lt;&lt; ");
                    }
                }
            }
        }

        imgPreloader = new Image();
        imgPreloader.onload = function(){
            imgPreloader.onload = null;

            // Resizing large images
            var x = window.getWidth() - 150;
            var y = window.getHeight() - 150;
            var imageWidth = imgPreloader.width;
            var imageHeight = imgPreloader.height;
            if (imageWidth > x) {
                imageHeight = imageHeight * (x / imageWidth);
                imageWidth = x;
                if (imageHeight > y) {
                    imageWidth = imageWidth * (y / imageHeight);
                    imageHeight = y;
                }
            }
            else
                if (imageHeight > y) {
                    imageWidth = imageWidth * (y / imageHeight);
                    imageHeight = y;
                    if (imageWidth > x) {
                        imageHeight = imageHeight * (x / imageWidth);
                        imageWidth = x;
                    }
                }
            // End Resizing

            // TODO don't use globals
            TB_WIDTH = imageWidth;
            TB_HEIGHT = imageHeight + 60;

            // TODO empty window content instead
            $("TB_window").innerHTML += "<div id='TB_caption'><div id='TB_secondLine'>" + imageCount + prev.html + next.html + "</div></div><div id='TB_closeWindow'><a href='javascript:void(0);' id='TB_closeWindowButton' title='"+MooTools.lang.get('fromPHP', 'Fermer')+"'><img src='img/global/bt_fermer.gif' alt='' title='' /></a></div><a href='' id='TB_ImageOff' title=''><img id='TB_Image' src='" + url + "' width='" + imageWidth + "' height='" + imageHeight + "' alt='" + caption + "'/></a><p class=\"img_legend\">"+caption+"</p>";

            $("TB_closeWindowButton").onclick = TB_remove;

            function buildClickHandler(image){
                return function(){
                    $("TB_window").dispose();
                    new Element('div').setProperty('id', 'TB_window').injectInside(document.body);

                    TB_show(image.caption, image.url, rel);
                    return false;
                };
            }
            var goPrev = buildClickHandler(prev);
            var goNext = buildClickHandler(next);
            if ($('TB_prev')) {
                $("TB_prev").onclick = goPrev;
            }

            if ($('TB_next')) {
                $("TB_next").onclick = goNext;
            }

            document.onkeydown = function(event){
                var event = new Event(event);
                switch (event.code) {
                    case 27:
                        TB_remove();
                        break;
                    case 190:
                        if ($('TB_next')) {
                            document.onkeydown = null;
                            goNext();
                        }
                        break;
                    case 188:
                        if ($('TB_prev')) {
                            document.onkeydown = null;
                            goPrev();
                        }
                        break;
                }
            }

            // TODO don't remove loader etc., just hide and show later
            $("TB_ImageOff").onclick = TB_remove;
            TB_position();
            TB_showWindow();
        }
        imgPreloader.src = url;

    }
    else { //code to show html pages
        var queryString = url.match(/\?(.+)/)[1] || '';
        var params = TB_parseQuery(queryString);

        TB_WIDTH = (params['width'] * 1) + 30;
        TB_HEIGHT = (params['height'] * 1) + 40;

        var ajaxContentW = TB_WIDTH - 30, ajaxContentH = TB_HEIGHT - 45;

        if (url.indexOf('TB_iframe') != -1) {
			var sNav = '<div id="TB_secondLine" class="iframeNav"><div class="iframeTitle">'+caption+'</div></div>';
			var initNavEvents = function() { return false; };
			 if (rel && !bLaunchAuto) { // if rel exists, supposed to be multi-iframe navigation
				function getIframeInfo(iframe, id, label, pos){
					return {
						url: iframe.href,
						html: "<span>&nbsp;&nbsp;<a id='TB_" + id + "' href='javascript:void(0);' rel='"+pos+"'>" + label + "</a></span>",
						caption : iframe.title
					}
				}

				// find the anchors that point to the group
				var iframeGroup = [];
				$$("a.smoothbox").each(function(el){
					if (el.rel == rel) {
						iframeGroup[iframeGroup.length] = el;
					}
				})

				var foundSelf = false;
				var iCurrentFrame = 0;
				// loop through the anchors, looking for ourself, saving information about previous and next iframe
				for (var i = 0; i < iframeGroup.length; i++) {
					var iframe = iframeGroup[i];
					var urlTypeTemp = iframeGroup.href;

					// look for ourself
					if (iframe.href == url) {
						foundSelf = true;
						iCurrentFrame = i;
					}
					else {
						// when we found ourself, the current is the next iframe
						if (foundSelf) {

							// stop searching
							break;
						}
						else {
							// didn't find ourself yet, so this may be the one before ourself
						}
					}
				}

				function changeIframe(num)
				{
					$('TB_iframeContent').src = iframeGroup[num].href;
					$('TB_caption').set('html', buildNavIframe(num));
					var aCopyRight = iframeGroup[num].href.split('cpright');
					if( aCopyRight[1] )
					{
						aCopyRight = aCopyRight[1].split('&');
						var sCopyRight = aCopyRight[0].substr( 1, aCopyRight[0].length - 1);
						sCopyRight = decodeURIComponent(sCopyRight.replace('+', ' '));
						$('displayCopyright').set('html', '&copy; '+sCopyRight);
					}
					else
						$('displayCopyright').set('html', '');
					initNavEvents();
				}

				initNavEvents = function()
				{
					if ( $('TB_next') )
						$('TB_next').addEvent('click', function() { changeIframe(this.rel); });
					if ( $('TB_prev') )
						$('TB_prev').addEvent('click', function() { changeIframe(this.rel); });
				}

				function buildNavIframe(num){
					num = num.toInt();
					var next = $chk(iframeGroup[num + 1]) ? getIframeInfo(iframeGroup[num + 1], "next", '<img src="img/global/smoothbox_go_right.gif" />', num + 1) : null;
					var prev = $chk(iframeGroup[num - 1]) ? getIframeInfo(iframeGroup[num - 1], "prev", '<img src="img/global/smoothbox_go_left.gif" /> ', num - 1) : null;

					var sNext = $chk(next) ? next.html : '';
					var sPrev = $chk(prev) ? prev.html : '';

					var caption =  getIframeInfo(iframeGroup[num], "", "", "").caption.toString();
					var sNav = '<div id="TB_secondLine" class="iframeNav">' + sPrev + '<div class="navInfos">' + (num.toInt() + 1) + '/' + iframeGroup.length + '</div>' + sNext + '<div class="iframeTitle">'+caption+'</div></div>';
					return sNav;
				}

				sNav = buildNavIframe(iCurrentFrame);
			}

            urlNoQuery = url.split('TB_');
            $("TB_window").innerHTML += "<div id='TB_caption'>" + sNav + "</div><div id='TB_title'><div id='TB_ajaxWindowTitle'></div><div id='TB_closeAjaxWindow'><a href='javascript:void(0);' id='TB_closeWindowButton' title=''><img src='img/global/bt_fermer.gif' alt='' title='' /></a></div></div><iframe frameborder='0' hspace='0' src='" + urlNoQuery[0] + "' id='TB_iframeContent' name='TB_iframeContent' style='width:" + (ajaxContentW + 29) + "px;height:" + (ajaxContentH + 17) + "px;' onload='TB_showWindow()'> </iframe>";


			aCopyRight = urlNoQuery[0].split('cpright');
			if( aCopyRight[1] )
			{
				aCopyRight = aCopyRight[1].split('&');
				sCopyRight = aCopyRight[0].substr( 1, aCopyRight[0].length - 1);
				sCopyRight = decodeURIComponent(sCopyRight.replace('+', ' '));
				$("TB_window").innerHTML += "<div style='text-align:center;color:#FFF;font-family : Arial,Tahoma,Verdana,Helvetica,sans-serif; font-size : 12px;'><span id='displayCopyright'>&copy; " + sCopyRight + "</span></div>";
			}
			else
				$("TB_window").innerHTML += "<div style='text-align:center;color:#FFF;font-family : Arial,Tahoma,Verdana,Helvetica,sans-serif; font-size : 12px;'><span id='displayCopyright'></span></div>";

            if ( $chk(initNavEvents) )
				initNavEvents();
        }
        else {
            $("TB_window").innerHTML += "<div id='TB_title'><div id='TB_ajaxWindowTitle'>" + caption + "</div><div id='TB_closeAjaxWindow'><a href='javascript:void(0);' id='TB_closeWindowButton'>close</a></div></div><div id='TB_ajaxContent' style='width:" + ajaxContentW + "px;height:" + ajaxContentH + "px;'></div>";
        }

        if ($("TB_closeWindowButton"))
        	$("TB_closeWindowButton").onclick = TB_remove;

        if (url.indexOf('TB_inline') != -1) {
            $("TB_ajaxContent").innerHTML = ($(params['inlineId']).innerHTML);
            TB_position();
            TB_showWindow();
        }
        else
            if (url.indexOf('TB_iframe') != -1) {
                TB_position();
                if (frames['TB_iframeContent'] == undefined) {//be nice to safari
                    $(document).keyup(function(e){
                        var key = e.keyCode;
                        if (key == 27) {
                            TB_remove()
                        }
                    });
                    TB_showWindow();
                }
            }
            else {
                var handlerFunc = function(){
                    TB_position();
                    TB_showWindow();
                };

				new Request.HTML({
                    method: 'get',
                    update: $("TB_ajaxContent"),
                    onComplete: handlerFunc
                }).get(url);
            }
    }

    window.onresize = function(){
        TB_position();
        TB_load_position();
        TB_overlaySize();
    }

    document.onkeyup = function(event){
        var oEvent = new Event(event);
        if (oEvent.code == 27) { // close
            TB_remove();
        }
    }
    bLaunchAuto = false;
}

//helper functions below

function TB_showWindow(){
	if ( $("TB_window") )
	{
		$("TB_window").setStyles({display:"block",opacity:'0'});

		if (TB_doneOnce == 0) {
			TB_doneOnce = 1;

			$('TB_window').set('tween', {
				duration: 250,
				onComplete: function(){
					if ($('TB_load')) {
						$('TB_load').dispose();
					}
					top.fireEvent('smoothLoaded');
				}
			});
			$('TB_window').tween('opacity', 0, 1);

		}
		else {
			$('TB_window').setStyle('opacity', 1);
			if ($('TB_load')) {
				$('TB_load').dispose();
			}
		}
	}
}

function TB_remove(){

    $("TB_overlay").onclick = null;
    document.onkeyup = null;
    document.onkeydown = null;

    if ($('TB_imageOff'))
        $("TB_imageOff").onclick = null;
    if ($('TB_closeWindowButton'))
        $("TB_closeWindowButton").onclick = null;
    if ($('TB_prev')) {
        $("TB_prev").onclick = null;
    }
    if ($('TB_next')) {
        $("TB_next").onclick = null;
    }


    $('TB_window').set('tween', {
        duration: 250,
        onComplete: function(){
            $('TB_window').dispose();
        }
    });
    $('TB_window').tween('opacity', 1, 0);



    $('TB_overlay').set('tween', {
        duration: 400,
        onComplete: function(){
            $('TB_overlay').dispose();
        }
    });
    $('TB_overlay').tween('opacity', 0.6, 0);

    window.onscroll = null;
    window.onresize = null;

    $('TB_HideSelect').dispose();
    TB_init();
	closeVideo();
    TB_doneOnce = 0;

    return false;
}

function TB_position(){
    $('TB_window').set('morph', {
        duration: 75
    });
    $('TB_window').setStyles({
		width: TB_WIDTH + 'px',
		left: (window.getScrollLeft() + (window.getWidth() - TB_WIDTH) / 2) + 'px',
		top: (window.getScrollTop() + (window.getHeight() - TB_HEIGHT) / 2) + 'px'
	});
}

function TB_overlaySize(){
    // we have to set this to 0px before so we can reduce the size / width of the overflow onresize
    $("TB_overlay").setStyles({
        "height": '0px',
        "width": '0px'
    });
    $("TB_HideSelect").setStyles({
        "height": '0px',
        "width": '0px'
    });
    $("TB_overlay").setStyles({
        "height": window.getScrollHeight() + 'px',
        "width": window.getScrollWidth() + 'px'
    });
    $("TB_HideSelect").setStyles({
        "height": window.getScrollHeight() + 'px',
        "width": window.getScrollWidth() + 'px'
    });
}

function TB_load_position(){
    if ($("TB_load")) {
        $("TB_load").setStyles({
            left: (window.getScrollLeft() + (window.getWidth() - 56) / 2) + 'px',
            top: (window.getScrollTop() + ((window.getHeight() - 20) / 2)) + 'px',
            display: "block"
        });
    }
}

function TB_parseQuery(query){
    // return empty object
    if (!query)
        return {};
    var params = {};

    // parse query
    var pairs = query.split(/[;&]/);
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (!pair || pair.length != 2)
            continue;
        // unescape both key and value, replace "+" with spaces in value
        params[unescape(pair[0])] = unescape(pair[1]).replace(/\+/g, ' ');
    }
    return params;
}
