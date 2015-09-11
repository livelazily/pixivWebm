// ==UserScript==
// @name        pixivWebm
// @namespace   https://github.com/livelazily
// @description gets webm from pixiv animated images
// @include     http://www.pixiv.net/member_illust.php*
// @require     https://cdn.rawgit.com/antimatter15/whammy/4effe219137e48787f1e82c8bbc64fbf7b4cfeeb/whammy.js
// @require     https://cdn.rawgit.com/eligrey/FileSaver.js/e3485a652bc3387b5df9c133c184ae0753cf30de/FileSaver.min.js
// @version     0.1.1
// @grant       none
// @author      livelazily
// ==/UserScript==
var data = pixiv.context.ugokuIllustFullscreenData;
if (!data) {
    // not ugoku
    return;
}

var $button = $('<button type="button" class="add-bookmark _button">Get Webm</button>');
$(".bookmark-container").append($button);

var _player;
$button.click(function getWebm() {
    if (!_player) {
        _player = (new pixiv.UgokuIllustPlayer($(""), data, {
            autoSize: true,
            autoStart: 1
        }));
    }

    var delays = data.frames.map(function (e) {
        return e.delay;
    });

    var video = new Whammy.Video();

    $button.text('Downloading images...');
    var timer = setInterval(function () {
        var player = _player.player;
        if (!player) {
            console.log('waiting for player');
            return;
        }

        if (player._frameImages.length !== delays.length) {
            var notDownloadSize = delays.length - player._frameImages.length;
            console.log('still have ' + notDownloadSize + ' images not download');
            return;
        }

        clearInterval(timer);
        console.log('starting conversion');
        player._frameImages.forEach(function (img, i) {
            video.add(getWebp(img), delays[i]);
        });

        var blobData = video.compile();
        var url = URL.createObjectURL(blobData);
        console.log('finished conversion!');

        // $('canvas').replaceWith('<video src="' + url + '" autoplay loop>');

        var fileName = '[' + pixiv.context.illustId + ']' + pixiv.context.illustTitle + '.webm';
        saveAs(blobData, fileName);
        $button.text('Get Webm');
    }, 1000);

});

var quality = 0.9;
var canvas;

function getWebp(img) {
    if (!canvas) {
        // Create an empty canvas element
        canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
    }

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    return canvas.toDataURL("image/webp", quality);
}
