# hapi-browserify

[![npm](https://img.shields.io/npm/v/hapi-browserify.svg)](https://www.npmjs.com/package/hapi-browserify)
[![Dependency Status](https://david-dm.org/sibartlett/hapi-browserify.svg)](https://david-dm.org/sibartlett/hapi-browserify)

Browserify handler for [hapi](http://hapijs.com/) (inspired by [browserify-middleware](https://github.com/ForbesLindesay/browserify-middleware)).

##### Table of Contents

* [Installation and Configuration](#installation-and-configuration)
* [Example Usages](#example-usages)


### Installation and Configuration

```sh
npm install hapi-browserify --save
```

```js
server.register({
  register: require('hapi-browserify'),
  options: {
    ...
  }
});
```

##### Options

Configures the default options for routes.

* `path` - path to bundle file.
* `cache` - boolean, configures the handlers caching strategy. This does not set cache headers on the response - you should still use hapi for that.
* `minify` - enable uglify, only recommended if `cache` is true.
* `precompile` - precompile bundles where possible. Only works if `cache` is true.
* bundle - browserify options, plus options for `require`, `exclude`, `external`, `transform`

### Example Usages

See [options](##options) for all available options.

```js
# Fixed path

server.route({
  method: 'GET',
  path: '/my-script.js',
  handler: {
    browserify: {
      path: './scripts/my-script.js'
    }
  }
});

# Dynamic path

server.route({
  method: 'GET',
  path: '/script/{param*}',
  handler: {
    browserify: {
      bundle: {
        basedir: './script/'
      }
    }
  }
});
```
