// ==UserScript==
// @name        InstaSynchP Layouts
// @namespace   InstaSynchP
// @description Larger layouts and fullscreen mode

// @version     1.1.5
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Layouts
// @license     MIT

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// @require     https://greasyfork.org/scripts/2858-jquery-fullscreen/code/jqueryfullscreen.js?version=26079
// ==/UserScript==

function Layouts(version) {
    "use strict";
    this.version = version;
    this.name = 'InstaSynchP Layouts';
    this.userFullscreenToggle = false;
    this.settings = [{
        'label': 'Layout',
        'id': 'Layout',
        'type': 'select',
        'options': ['normal', 'large', 'huge'],
        'default': 'normal',
        'section': ['General']
    }, {
        'label': 'Make chat visible on message',
        'id': 'make-chat-visible',
        'type': 'checkbox',
        'default': true,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'On Chat Message Opacity',
        'id': 'chat-message-opacity',
        'type': 'int',
        'title': '0-100',
        'min': 0,
        'max': 100,
        'default': 100,
        'size': 1,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'Chat Opacity',
        'id': 'chat-opacity',
        'type': 'int',
        'title': '0-100',
        'min': 0,
        'max': 100,
        'default': 30,
        'size': 1,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'Playlist Opacity',
        'id': 'playlist-opacity',
        'type': 'int',
        'title': '0-100',
        'min': 0,
        'max': 100,
        'default': 30,
        'size': 1,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'Poll Opacity',
        'id': 'poll-opacity',
        'type': 'int',
        'title': '0-100',
        'min': 0,
        'max': 100,
        'default': 30,
        'size': 1,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'Font color',
        'id': 'fullscreen-font-color',
        'type': 'text',
        'default': '#FFFF00',
        'size': 5,
        'section': ['General', 'Fullscreen']
    }, {
        'label': 'Outline color',
        'id': 'fullscreen-outline-color',
        'type': 'text',
        'default': '#000000',
        'size': 5,
        'section': ['General', 'Fullscreen']
    }];
}

Layouts.prototype.addLayoutsOnce = function () {
    "use strict";
    var th = this,
        i,
        layouts = [{
            'name': 'normalLayout',
            'url': ''
        }, {
            'name': 'largeLayout',
            'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Layouts/7d144b7ae7a5e0ad168f182c88b9312c8fb2beda/largeLayout.css'
        }, {
            'name': 'hugeLayout',
            'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Layouts/b1e8f187eecce9ea4d552b97f76e8161ecfb3544/hugeLayout.css'
        }, {
            'name': 'fullscreenLayout',
            'url': 'https://rawgit.com/Zod-/InstaSynchP-Layouts/af645cbcd04ea0f813e335540995672317809195/fullscreenLayout.css'
        }];
    for (i = 0; i < layouts.length; i += 1) {
        layouts[i].id = 'layout';
        cssLoader.add(layouts[i]);
    }
    //style for the footer controls
    cssLoader.add({
        'name': 'layouts',
        'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Layouts/e2cb8b52f4dc76811c51c3121dbdd35d1de5b7d9/layouts.css',
        'autoload': true
    });
    events.on(th, 'SettingChange[Layout]', th.changeLayout);
    //reinitialise once the css has been loaded to fix the size
    events.on(th, 'CSSLoad[layout]', function () {
        $("#videos").data("jsp").reinitialise();
    });
};
Layouts.prototype.setUpFullscreenOnce = function () {
    "use strict";
    var th = this,
        chatVisibleTimer;
    //make poll visible in fullscreen when it is hidden
    events.on(th, 'CreatePoll', function () {
        $('.poll-container').removeClass('poll-container2');
        $('#hide-poll').removeClass('hide-poll2');
    });
    $('head').append(
        $('<style>', {
            'id': 'fullscreen-font'
        })
    );
    //make chat visible for 5 seconds on every message
    function changeFontColor(ignore, newVal) {
        if (newVal === 'initial') {
            $('#fullscreen-font').text('');
            return;
        }
        $('#fullscreen-font').text(
            ('#cin,' +
                '#chat .left .messages .message,' +
                '#chat .left .messages .message .username{' +
                '   color: {0} !important;' +
                '   text-shadow: -1px 0 {1}, 0 1px {1}, 1px 0 {1}, 0 -1px {1};' +
                '}'
            ).format(gmc.get('fullscreen-font-color'), gmc.get('fullscreen-outline-color'))
        );
    }

    function chatVisibility() {
            if (!gmc.get('make-chat-visible')) {
                return;
            }
            $('#chat .left').css('opacity', gmc.get('chat-message-opacity') / 100.0);
            if (chatVisibleTimer) {
                clearTimeout(chatVisibleTimer);
                chatVisibleTimer = undefined;
            }
            chatVisibleTimer = setTimeout(function () {
                $('#chat .left').css('opacity', gmc.get('chat-opacity') / 100.0);
            }, 3000);
        }
        //on fullscreen change
    $(document).bind('fscreenchange', function () {
        if ($.fullscreen.isFullScreen()) {
            if (th.userFullscreenToggle) {
                events.on(th, 'AddMessage', chatVisibility);
                changeFontColor();
                events.on(th, 'SettingChange[fullscreen-font-color],SettingChange[fullscreen-outline-color]', changeFontColor);
                cssLoader.load('fullscreenLayout');
                //set bars and elements to their opacity values
                $('#chat .left').css('opacity', gmc.get('chat-opacity') / 100.0);
                $('#playlist').css('opacity', gmc.get('playlist-opacity') / 100.0);
                $('.poll-container').css('opacity', gmc.get('poll-opacity') / 100.0);
                $('#chat-slider').slider('option', 'value', gmc.get('chat-opacity'));
                $('#poll-slider').slider('option', 'value', gmc.get('poll-opacity'));
                $('#playlist-slider').slider('option', 'value', gmc.get('playlist-opacity'));
            }
        } else {
            //turn back to normal if user canceled fullscreen
            if (th.userFullscreenToggle) {
                events.unbind('AddMessage', chatVisibility);
                changeFontColor(undefined, 'initial');
                events.unbind('SettingChange[fullscreen-font-color],SettingChange[fullscreen-outline-color]', changeFontColor);
                cssLoader.load('{0}Layout'.format(gmc.get('Layout')));
                if (chatVisibleTimer) {
                    clearTimeout(chatVisibleTimer);
                    chatVisibleTimer = undefined;
                }
                $('#chat .left').css('opacity', '1');
                $('#playlist').css('opacity', '1');
                $('.poll-container').css('opacity', '1');
            }
            th.userFullscreenToggle = false;
        }
    });
};

Layouts.prototype.addLayouts = function () {
    "use strict";
    var th = this,
        i,
        layouts = [
            'normal',
            'large',
            'huge'
        ];
    //change layout if it is a different one and then save
    function setLayout(event) {
        if (gmc.get('Layout') !== $(event.currentTarget).text()) {
            gmc.set('Layout', $(event.currentTarget).text());
            window.plugins.settings.save();
        }
    }

    $('<div>', {
        'id': 'layoutSelector'
    }).text('layout:').insertBefore('#roomFooter');

    //add all possible layouts
    for (i = 0; i < layouts.length; i += 1) {
        $('#layoutSelector').append($('<a>', {
            'id': '{0}Layout'.format(layouts[i])
        }).text(layouts[i]).click(setLayout).addClass('layoutClickable'));
    }

    //set active layout
    $('#{0}Layout'.format(gmc.get('Layout'))).addClass('layoutNotClickable');
    //change to that layout
    th.changeLayout();
};

Layouts.prototype.setUpFullscreen = function () {
    "use strict";
    var th = this,
        opacitySaveTimer;
    //add option in the settings menu
    $('#playlist-settings-menu').append(
        $('<li>', {
            'id': 'fullscreen',
            'title': 'turn fullscreen on or off'
        }).click(function () {
            th.toggleFullscreen();
        }).text('Fullscreen')
    );

    //add div to block the fullscreen button of the player
    $('#stage').append($('<div>', {
        'id': 'block-fullscreen'
    }).click(th.toggleFullscreen));
    $('#playlist').hover(function () {
        $('#hide-playlist').css('opacity', 1);
    }, function () {
        $('#hide-playlist').css('opacity', 0);
    });

    //don't save opacity with every little value change
    function saveOpacity() {
        $('#chat .left').css('opacity', gmc.get('chat-opacity') / 100.0);
        $('#playlist').css('opacity', gmc.get('playlist-opacity') / 100.0);
        $('.poll-container').css('opacity', gmc.get('poll-opacity') / 100.0);
        if (opacitySaveTimer) {
            clearTimeout(opacitySaveTimer);
            opacitySaveTimer = undefined;
        }
        opacitySaveTimer = setTimeout(window.plugins.settings.save, 5000);
    }

    //add buttons to hide playlist/poll
    $('#stage .stage').prepend(
        $('<div>', {
            'id': 'hide-playlist'
        }).append(
            $('<div>').click(function () {
                $('#videos').toggleClass('playlist2');
                $('#hide-playlist').toggleClass('hide-playlist2');
                $('#chat').toggleClass('chat2');
            })
        )
    );
    $('.poll-container').prepend(
        $('<div>', {
            'id': 'hide-poll'
        }).append(
            $('<div>').click(function () {
                $('.poll-container').toggleClass('poll-container2');
                $('#hide-poll').toggleClass('hide-poll2');
            })
        )
    );

    //add opacity sliders
    $('.overall').append(
        $('<div>', {
            'id': 'opacity-sliders'
        }).append(
            $('<span>').text('Opacity')
        ).append(
            $('<div>', {
                'id': 'chat-slider'
            }).slider({
                range: "min",
                value: gmc.get('chat-opacity'),
                min: 0,
                max: 100,
                slide: function (ignore, ui) {
                    gmc.set('chat-opacity', ui.value);
                    saveOpacity();
                }
            }).append(
                $('<span>').text('chat').addClass('text-shadow')
            )
        ).append(
            $('<div>', {
                'id': 'poll-slider'
            }).slider({
                range: "min",
                value: gmc.get('poll-opacity'),
                min: 0,
                max: 100,
                slide: function (ignore, ui) {
                    gmc.set('poll-opacity', ui.value);
                    saveOpacity();
                }
            }).append(
                $('<span>').text('poll').addClass('text-shadow')
            )
        ).append(
            $('<div>', {
                'id': 'playlist-slider'
            }).slider({
                range: "min",
                value: gmc.get('playlist-opacity'),
                min: 0,
                max: 100,
                slide: function (ignore, ui) {
                    gmc.set('playlist-opacity', ui.value);
                    saveOpacity();
                }
            }).append(
                $('<span>').text('playlist').addClass('text-shadow')
            )
        )
    );
};

Layouts.prototype.preConnect = function () {
    "use strict";
    var th = this;
    th.addLayouts();
    th.setUpFullscreen();
};

Layouts.prototype.executeOnce = function () {
    "use strict";
    var th = this;
    th.addLayoutsOnce();
    th.setUpFullscreenOnce();
};

Layouts.prototype.toggleFullscreen = function () {
    "use strict";
    var th = this;
    if ($.fullscreen.isFullScreen()) {
        $.fullscreen.exit();
    } else {
        th.userFullscreenToggle = true;
        $('body').fullscreen();
    }
};

Layouts.prototype.changeLayout = function () {
    "use strict";
    $('.layoutNotClickable').removeClass('layoutNotClickable');
    $('#{0}Layout'.format(gmc.get('Layout'))).addClass('layoutNotClickable');
    cssLoader.load('{0}Layout'.format(gmc.get('Layout')));
};

window.plugins = window.plugins || {};
window.plugins.layouts = new Layouts('1.1.5');
