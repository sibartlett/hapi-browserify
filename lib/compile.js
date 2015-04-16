'use strict';

var browserify = require('browserify');
var uglify = require('uglify-js');

var DynamicCache = require('./dynamic-cache.js');
var dynamicCache = {};

function arrayify(value) {
  if (!value) {
    return [];
  }

  if (!Array.isArray(value)) {
    return [value];
  }

  return value;
}

function minify(str, options) {
  if (!options || typeof options !== 'object') options = {};
  options.fromString = true;
  return uglify.minify(str, options);
}

function compile(path, options, cb, cacheUpdated) {
  var cache;
  if (options.cache && options.cache === 'dynamic') {
    var cacheName = path + ':' + options.external + ':' + options.debug;
    cache = dynamicCache[cacheName];
    if (cache && !cacheUpdated) {
      return cache.update(function() { compile(path, options, cb, true); });
    } else if (!cache) {
      cache = (dynamicCache[cacheName] = new DynamicCache());
    }
  }

  var opts = options.bundle || {};

  var bundle = browserify({
    noParse: opts.noParse,
    extensions: opts.extensions,
    resolve: opts.resolve,
    insertGlobals: opts.insertGlobals,
    detectGlobals: opts.detectGlobals,
    ignoreMissing: opts.ignoreMissing,
    basedir: opts.basedir,
    debug: opts.debug,
    standalone: opts.standalone || false,
    cache: cache ? cache.getCache() : undefined,
    fullPaths: cache ? true : false
  });

  var plugins = arrayify(opts.plugins);
  var paths = arrayify(path);
  var requires = arrayify(opts.require);
  var excludes = arrayify(opts.exclude);
  var externals = arrayify(opts.external);
  var ignores = arrayify(opts.ignore);
  var transforms = arrayify(opts.transform);

  plugins.forEach(function(p) {
    bundle.plugin(p.plugin, p.options);
  });

  paths.forEach(function(p) {
    bundle.add(p);
  });

  requires.forEach(function(p) {
    bundle.require(p);
  });

  if (cache) {
    cache.populate(bundle);
  }

  excludes.forEach(function(p) {
    bundle.exclude(p);
  });

  externals.forEach(function(p) {
    bundle.external(p);
  });

  ignores.forEach(function(p) {
    bundle.ignore(p);
  });

  transforms.forEach(function(transform) {
    if (Array.isArray(transform)) {
      bundle.transform(transform[1], transform[0]);
    } else {
      bundle.transform(transform);
    }
  });

  bundle.bundle(function(err, src) {
    if (err) {
      return cb(err);
    }

    src = src.toString();

    if (options.postcompile) {
      src = options.postcompile(src);
    }

    if (options.minify) {
      if (options.preminify) {
        src = options.preminify(src);
      }

      try {
        src = minify(src, options.minify).code;
      }

      //better to just let the client fail to parse
      catch (ex) { }

      if (options.postminify) {
        src = options.postminify(src);
      }
    }

    cb(null, src);
  });
}

module.exports = compile;
