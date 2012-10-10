define(function(require) {
  var ko = require('knockout');
  var BaseView = require('views/base');

  var User = require('models/user');

  var UserView = BaseView.extend({
    template: require('text!tpl/user.html'),

    sidebar: 'users',

    initialize: function(options) {
      console.log(options.user);
      if (options.user) {
        this.user = options.user;
      } else {
        this.user = new User({uuid:options.uuid});
      }
      this.user.fetch();
      this.user.on('reset', this.render);
    },

    render: function() {
      this.$el.html(this.template({user: this.user}));

      var viewModel = kb.viewModel(
        this.user,
        {
          keys: ['uuid', 'cn', 'sn', 'email', 'login', 'memberof', 'member']
        }
      );
      viewModel.member = ko.computed(function() {
        var mb = viewModel.memberof() || [];
        return mb.join(',');
      }, this);

      kb.applyBindings(viewModel, this.el);
    },

    uri: function() {
      return _.str.sprintf('/users/%s', this.user.get('uuid'));
    }
  });

  return UserView;
});
