var Backbone = require('backbone');
var _ = require('underscore');

var adminui = require('adminui');

var JobProgressView = require('./job-progress');

var MetadataList = Backbone.Marionette.ItemView.extend({
    attributes: {
        'class':'metadata-list'
    },
    template: require("../tpl/metadata.hbs"),
    events: {
        'click .save': 'onClickSave',
        'click .cancel': 'onClickCancel',
        'keyup textarea.value:last': 'onKeyup'
    },

    initialize: function(options) {
        if (!options.vm) {
            throw new TypeError('options.vm required');
        }

        if (!options.property) {
            throw new TypeError('options.property required');
        }

        this.vm = options.vm;
        this.property = options.property;
        this.readonly = options.readonly || false;
        this.editing = false;
    },

    onClickSave: function()  {
        var metadata = this.serializeForm();
        var view = this;
        var data = {};
        data[this.property] = this.serializeForm();
        this.vm.update(data, function(job) {
            adminui.vent.trigger('showjob', job);
            job.on('execution:succeeded', function() {
                view.exitEditingMode();
                view.vm.fetch();
            });
        });
    },

    onClickCancel: function() {
        this.exitEditingMode();
    },

    exitEditingMode: function() {
        this.editing = false;
        this.render();
        this.trigger('editing:end');
    },

    editingMode: function() {
        this.editing = true;
        this.render();
        this.trigger('editing:begin');
    },

    onRender: function() {
        if (this.editing) {
            this.$('textarea').autosize();
        }
    },

    onKeyup: function(e) {
        var v = $(e.target).val();
        if (v && v.length) {
            this.addNewEmptyRow();
        }
    },

    serializeForm: function() {
        var data = {};
        this.$('tr').each(function(i, tr) {
            var k = $('input', tr).val();
            var v = $('textarea', tr).val();
            if (k && v && k.length && v.length) {
                data[k] = v;
            }
        });
        return data;
    },

    addNewEmptyRow: function() {
        var node = $('<tr><td class="key"><input type="text" name="key" /></td><td class="value"><textarea name="value" class="value"></textarea></td></tr>')
        this.$('tbody').append(node);
    },

    serializeData: function() {
        var metadata = this.vm.get(this.property);

        data = {};
        data.metadata = [];
        data.editing = this.editing;
        _(metadata).each(function(v, k) {
            data.metadata.push({key: k, value: v});
        });
        return data;
    },

    showContent: function(m) {
        var view = $(metadataViewModalTemplate()).modal();
        view.modal('show');
    },

    showAddPane: function() {
        var self = this;

        var view = $(metadataEditModalTemplate()).modal({
            show: false,
            backdrop: 'static'
        });

        var viewModel = new MetadataViewModel();
    },

    save: function(cb) {
        var data = {};
        var obj = {};
        obj[this.property] = data;
        this.vm.update(obj, cb);
        return data;
    }
});

module.exports = MetadataList;
