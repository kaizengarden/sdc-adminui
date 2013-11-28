var Backbone = require('backbone');
var _ = require('underscore');
var Model = require('./model');
var Job = require('./job');

var Vm = Model.extend({
    urlRoot: '/_/vms',

    idAttribute: 'uuid',

    update: function(attrs, cb) {
        $.post(this.url() + '?action=update', attrs, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    start: function(cb) {
        $.post(this.url() + '?action=start', {}, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    stop: function(cb) {
        $.post(this.url() + '?action=stop', {}, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    reboot: function(cb) {
        $.post(this.url() + '?action=reboot', {}, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    del: function(cb) {
        $.delete_(this.url(), function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    createSnapshot: function(cb) {
        $.post(this.url() + '?action=create_snapshot', {}, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },

    rollbackSnapshot: function(snapshotName, cb) {
        $.post(this.url() + '?action=rollback_snapshot', {
            name: snapshotName
        }, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });

            cb(job);
        });
    },

    addNics: function(networks, cb) {
        var req = $.post(this.url() + '?action=add_nics', {
            networks: networks
        });
        req.done(function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(null, job);
        });
        req.fail(function(xhr, status, errThrown) {
            cb(errThrown);
        });
    },

    removeNics: function(macs, cb) {
        $.post(this.url() + '?action=remove_nics', {
            macs: macs
        }, function(data) {
            var job = new Job({
                uuid: data.job_uuid
            });
            cb(job);
        });
    },


    saveAlias: function(cb) {
        $.put(this.url(), { alias: this.get ('alias')}).done(function(data) {
            var job = new Job({ uuid: data.job_uuid });
            cb(null, job);
        }).fail(function(xhr, status) {
            var obj = JSON.parse(xhr.responseText);
            var err = _.findWhere(obj.errors, {'field': 'alias'});
            cb(err);
        });
    },

    saveCustomerMetadata: function(cb) {
        $.put(this.url() + '/customer_metadata', this.get('customer_metadata'), function(data) {
            var job = new Job({ uuid: data.job_uuid });
            cb(null, job);
        }).fail(function(err) {
            cb(err);
        });
    },

    ips: function() {
        return this.get('nics').map(function(n) {
            return n.ip;
        });
    }
});

module.exports = Vm;
