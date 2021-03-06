/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var Backbone = require('backbone');
var adminui = require('../adminui');


var UserPreview = Backbone.Marionette.ItemView.extend({
    template: require('../tpl/user-preview.hbs'),
    attributes: {
        'class': 'user-preview'
    },
    events: {
        'click a.user-details-link': 'gotoUser'
    },
    gotoUser: function(e) {
        e.preventDefault();
        adminui.vent.trigger('showcomponent', 'user', { uuid: this.model.get('uuid') });
    }
});

module.exports = UserPreview;
