/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

/** @jsx React.DOM */

var BB = require('../../bb.jsx');
var React = require('react');
var AddKeyView = require('./sshkey-create');
var Backbone = require('backbone');
var $ = require('jquery');

module.exports = React.createClass({
    componentWillMount: function() {
        this.sshkeys = new SSHKeys(null, {
            account: this.props.account,
            user: this.props.user
        });
        this.sshkeysList = new SSHKeysList({collection: this.sshkeys });

        this.view = new SSHKeysList({ collection: this.sshkeys });
        this.sshkeys.fetch();
    },
    componentWillReceiveProps: function(props) {
        this.sshkeys.user = props.user;
        this.sshkeys.account = props.account;
        this.sshkeys.fetch();
    },
    _showAddKey: function() {
        var view = new AddKeyView({
            account: this.props.account,
            user: this.props.user
        });
        view.render();
        view.on('saved', function(key) {
            this.sshkeys.add(key);
        }, this);
    },
    render: function() {
        return (<div className="user-sshkeys">
                <h3>SSH Keys
                    <div className="actions">
                        { !this.props.readonly && <button onClick={this._showAddKey} className="btn btn-info btn-sm add-key"><i className="fa fa-plus"></i> Add Key</button> }
                    </div>
                </h3>
                <div className="ssh-keys">
                    <div className="items"><BB view={this.view} /></div>
                </div>
            </div>);
    }
});

var SSHKeyListItemTemplate = require('./sshkeys-list-item.hbs');
var SSHKeys = require('../../../models/sshkeys');

var SSHKeyListItem = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    attributes: {'class':'item'},
    template: SSHKeyListItemTemplate,
    events: {
        'click .name a': 'showKey',
        'click .remove': 'onClickRemove'
    },
    showKey: function() {
        var modalHeader = $('<div class="modal-header"></div>');
        modalHeader.html('<h2 class="modal-title">'+this.model.get('name')+'</h2>');
        var modalBody = $('<div class="modal-body"></div>');
        var text = $('<textarea readonly>').html(this.model.get('openssh'));
        text.click(function() {
            $(this).select();
        });

        modalBody.append(text);

        var modal = $('<div id="sshkey-view">').addClass('modal');
        var dialog = $('<div class="modal-dialog"></div>');
        var content = $('<div class="modal-content"></div>');
        content.append(modalHeader);
        content.append(modalBody);
        content.append('<div class="modal-footer"><button class="btn btn-default" data-dismiss="modal">Close</button></div>');
        dialog.html(content);
        modal.html(dialog);
        modal.modal();
    },
    onClickRemove: function(e) {
        e.preventDefault();
        var confirm = window.confirm("Are you sure you want to remove this SSH Key?");
        if (confirm) {
            this.model.destroy();
        }
    }
});

var SSHKeyEmptyView = require('../../../views/empty').extend({
    emptyMessage: 'User has no SSH Keys.'
});

var SSHKeysList = Backbone.Marionette.CollectionView.extend({
    emptyView: SSHKeyEmptyView,
    itemView: SSHKeyListItem,
    itemViewOptions: function() {
        return {
            emptyViewModel: this.collection
        };
    }
});

