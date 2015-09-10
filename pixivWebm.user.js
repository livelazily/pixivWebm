// ==UserScript==
// @name        pixivWebm
// @namespace   https://github.com/livelazily
// @description gets webm from pixiv animated images
// @include     http://www.pixiv.net/member_illust.php*
// @require     https://cdn.rawgit.com/antimatter15/whammy/4effe219137e48787f1e82c8bbc64fbf7b4cfeeb/whammy.js
// @require     https://cdn.rawgit.com/eligrey/FileSaver.js/e3485a652bc3387b5df9c133c184ae0753cf30de/FileSaver.min.js
// @version     0.0.3
// @grant       none
// @author      livelazily
// ==/UserScript==

var $button = $('<button type="button" class="add-bookmark _button">Get Webm</button>');
$button.click(function getWebm() {
    var data = pixiv.context.ugokuIllustData;
    var player = (new pixiv.UgokuIllustPlayer($(""), data, {
        autoStart: 1,
        maxWidth: 1920,
        maxHeight: 1080
    }));

    var delays = data.frames.map(function (e) {
        return e.delay;
    });

    var video = new Whammy.Video();

    var timer = setInterval(function () {
        console.log('waiting for retrieval');
        if (player.player && player.player._frameImages.length === delays.length) {
            player = player.player;
            clearInterval(timer);
            player._frameImages.forEach(function (img, i) {
                video.add(getWebp(img), delays[i]);
            });

            var blobData = video.compile();
            var url = URL.createObjectURL(blobData);

            //alert('finished conversion!')
            $('canvas').replaceWith('<video src="' + url + '" autoplay loop>');
            saveAs(blobData, pixiv.context.illustId + '.webm');
        }
    }, 1000);

});
$(".bookmark-container").append($button);

function getWebp(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    return canvas.toDataURL("image/webp");
}
