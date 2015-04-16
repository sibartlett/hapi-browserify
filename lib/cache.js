'use strict';

function Cache() {
}

Cache.prototype.forever = function() {
  this.catbox = false;
  this.cache = {};
  return this;
};

Cache.prototype.catbox = function(cache) {
  this.catbox = true;
  this.cache = cache;
  return this;
};

Cache.prototype.get = function(key, callback) {
  if (!this.cache) {
    if (callback) {
      callback();
    }

    return;
  }

  if (this.catbox) {
    this.cache.get(key, callback);
  } else {
    callback(null, this.cache[key]);
  }
};

Cache.prototype.set = function(key, value, ttl, callback) {
  if (!this.cache) {
    if (callback) {
      callback();
    }

    return;
  }

  if (this.catbox) {
    this.cache.set(key, value, ttl, callback);
  } else {
    if (ttl) {
      this.cache[key] = value;
    }

    if (callback) {
      callback();
    }
  }
};

Cache.prototype.drop = function(key, callback) {
  if (!this.cache) {
    if (callback) {
      callback();
    }

    return;
  }

  if (this.catbox) {
    this.cache.drop(key, callback);
  } else {
    delete this.cache[key];
    if (callback) {
      callback();
    }
  }
};

module.exports = Cache;
