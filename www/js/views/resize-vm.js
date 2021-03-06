/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var Backbone = require('backbone');
var Packages = require('../models/packages');
var Package = require('../models/package');
var JobProgressView = require('./job-progress');
var PackagePreviewView = require('./package-preview');

var ViewModel = Backbone.Model.extend({});
var View = Backbone.Marionette.ItemView.extend({
    template: require('../tpl/resize-vm.hbs'),
    attributes: {
        'class': 'modal resize-vm'
    },
    events: {
        'click button': 'onClickResize'
    },
    initialize: function(options) {
        this.vm = options.vm;
        this.model = new ViewModel();

        this.packages = new Packages();
        this.packages.fetch();
        this.selectedPackage = new Package();
        this.packagePreviewView = new PackagePreviewView({
            model: this.selectedPackage
        });
        this.listenTo(this.packages, 'sync', this.render, this);
        this.listenTo(this.model, 'change:package', this.onSelectPackage, this);
    },
    onClickResize: function() {
        this.$('.alert').hide();
        var self = this;
        var pkg = new ViewModel(this.model.get('package'));
        var values = {};
        values.billing_id = pkg.get('uuid');
        values.package_name = pkg.get('name');
        values.package_version = pkg.get('version');
        values.cpu_cap = pkg.get('cpu_cap');
        values.max_lwps = pkg.get('max_lwps');
        values.max_swap = pkg.get('max_swap');
        // quota value needs to be in GiB
        values.quota = pkg.get('quota');
        if (values.quota) {
            values.quota = Math.ceil(Number(values.quota) / 1024);
        }

        values.vcpus = pkg.get('vcpus');
        values.zfs_io_priority = pkg.get('zfs_io_priority');
        values.ram = pkg.get('max_physical_memory');
        this.vm.update(values, function(job, error) {
            if (job) {
                self.$el.modal('hide');
                var jobView = new JobProgressView({
                    model: job
                });
                jobView.show();
            } else {
                self.$('.alert').html(error.message);
                self.$('.alert').show();
            }
        });
    },
    onSelectPackage: function(p) {
        var pkg = p.get('package');
        if (pkg && typeof(pkg) === 'object') {
            this.selectedPackage.set(pkg);
        } else {
            this.selectedPackage.clear();
        }
    },
    onRender: function() {
        this.$('.alert').hide();
        this.$('.package-preview-container').html(this.packagePreviewView.render().el);
        var self = this;
        this.stickit(this.model, {
            'button': {
                attributes: [{
                    name: 'disabled',
                    observe: 'package',
                    onGet: function(pkg) {
                        return pkg === null || pkg.length === 0;
                    }
                }]
            },
            'select': {
                observe: 'package',
                selectOptions: {
                    'collection': 'this.packages',
                    defaultOption: {
                        label: 'Select a Package'
                    },
                    'labelPath': 'name'
                }
            }
        });
        this.$('select').chosen();
    },
    show: function() {
        this.render();
        this.$el.modal();
    }
});

module.exports = View;
