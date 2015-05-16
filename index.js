var util = require('util'),
Resource = require('deployd/lib/resource'),
express = require('express'),
i18n = require('i18n'),
path = require('path');


function Express(name, options) {
  Resource.apply(this, arguments);
  i18n.configure({
    locales: ['en', 'ru', 'de', 'es', 'fr'],
    defaultLocale: 'en',
    cookie: 'i18nlang',
    directory: path.join(path.resolve('.'), 'locales')
  });

  var app = this.app = express(), exp = this;

  app.configure(function () {
    app.use(express.cookieParser());
    app.use(i18n.init);
  });

  // handle all routes
  this.path = '/';

  app.set('views', path.join(path.resolve('.'), 'views'));

}

Express.events = ['init'];

util.inherits(Express, Resource);
module.exports = Express;

Express.prototype.handle = function (ctx, next) {
  ctx.req.dpd = ctx.dpd;
  ctx.req.me = ctx.session && ctx.session.user;
  this.app.call(this.server, ctx.req, ctx.res);
  if(ctx.res._finished) {
    next();
  }
};

Express.prototype.load = function (fn) {
  var e = this;
  Resource.prototype.load.call(this, function () {
    if(e.events && e.events.init) {

      var domain = {
        app: e.app, require: function () {
          return require.apply(module, arguments);
        }
      };

      e.events.init.run({}, domain);

      e.app.use(function (req, res) {
        res._finished = true;
      });
    }

    fn();
  });
};
