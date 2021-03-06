'use strict';

var hoek = require('hoek');
var Cache = require('./cache');
var compile = require('./compile');

var handle = function(path, options, cache, cacheOutput, callback) {
  callback = callback || function() {};

  var cacheKey = JSON.stringify(path);

  cache.get(cacheKey, function(err, cached) {
    if (cached) {
      callback(null, cached);
      return;
    }

    compile(path, options, function(err, src) {
      if (err) {
        callback(err);
        return;
      }

      cache.set(cacheKey, src, cacheOutput, function(err) {
        if (err) {
          return callback(err);
        }

        callback(err, src);
      });
    });
  });
};

exports.register = function(server, pluginOptions, next) {
  var defaults = hoek.applyToDefaults({
    minify: false,
    precompile: false,
    cache: false
  }, pluginOptions);

  var cache = new Cache().forever();

  server.handler('browserify', function(route, options) {
    options = hoek.applyToDefaults(defaults, options);

    var cacheOutput = options.cache === true;

    if (cacheOutput && options.precompile && options.path) {
      handle(options.path, options, cache, cacheOutput);
    }

    return function(request, reply) {
      var path = options.path;

      if (!path) {
        path = './' + request.params.param;
      }

      handle(path, options, cache, cacheOutput, function(err, src) {
        if (err) {
          return reply(err);
        }

        reply(src).type('text/javascript');
      });
    };
  });

  next();
};

exports.register.attributes = {
  name: 'hapi-browserify'
};
