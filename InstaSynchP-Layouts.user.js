// ==UserScript==
// @name        InstaSynchP Layouts
// @namespace   InstaSynchP
// @description Provides a larger layout and fullscreen mode

// @version     1
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Layouts
// @license     GPL-3.0

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// ==/UserScript==
function Layouts(version) {
    "use strict";
    this.version = version;
    this.settings = [{
        'id': 'Layout',
        'label': 'Layout',
        'type': 'select',
        'options': ['normal', 'large'],
        'default': 'normal',
        'section': ['General']
    }];
}

function layoutsRef() {
    return window.plugins.layouts;
}

Layouts.prototype.executeOnce = function () {
    "use strict";
    var th = layoutsRef(),
        i,
        layouts = [{
            'name': 'normalLayout',
            'url': ''
        }, {
            'name': 'largeLayout',
            'url': 'https://cdn.rawgit.com/Zod-/InstaSynchP-Layouts/7d144b7ae7a5e0ad168f182c88b9312c8fb2beda/largeLayout.css'
        }];
    for (i = 0; i < layouts.length; i += 1) {
        layouts[i].id = 'layout';
        cssLoader.add(layouts[i]);
    }

    //style for the footer controls
    cssLoader.add({
        'name': 'layouts',
        'url': 'https://raw.githubusercontent.com/Zod-/InstaSynchP-Layouts/7d144b7ae7a5e0ad168f182c88b9312c8fb2beda/layouts.css',
        'autoload': true
    });
    events.on('SettingChange[Layout]', th.changeLayout);
    //reinitialise once the css has been loaded to fix the size
    events.on('CSSLoad[layout]', function () {
        $("#videos").data("jsp").reinitialise();
    });
};

Layouts.prototype.preConnect = function () {
    "use strict";
    var th = layoutsRef(),
        i,
        layouts = [
            'normal',
            'large'
        ];
    //change layout if it is a different one and then save
    function setLayout(event) {
        if (gmc.get('Layout') !== $(event.currentTarget).text()) {
            gmc.set('Layout', $(event.currentTarget).text());
            plugins.settings.save();
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

Layouts.prototype.changeLayout = function () {
    "use strict";
    $('.layoutNotClickable').removeClass('layoutNotClickable');
    $('#{0}Layout'.format(gmc.get('Layout'))).addClass('layoutNotClickable');
    cssLoader.load('{0}Layout'.format(gmc.get('Layout')));
};

window.plugins = window.plugins || {};
window.plugins.layouts = new Layouts("1");
