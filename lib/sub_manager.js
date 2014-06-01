SubsManager = function (options) {
  var self = this;
  self.options = options || {};
  // maxiumum number of subscriptions are cached
  self.options.cacheLimit = self.options.cacheLimit || 10;
  // maximum time, subscription stay in the cache
  self.options.expireIn = self.options.expireIn || 5;

  self._cacheMap = {};
  self._cacheList = [];
  self.ready = false;
  self.dep = new Deps.Dependency();

  self.computation = Deps.autorun(function() {
    self._applyExpirations();
    self._applyCacheLimit();

    var ready = true;
    _.each(self._cacheList, function(sub) {
      ready = ready && Meteor.subscribe.apply(Meteor, sub.args).ready();
    });

    if(ready) {
      self.ready = true;
      self.dep.changed();
    }
  });
};

SubsManager.prototype.subscribe = function() {
  var self = this;
  if(Meteor.isClient) {
    this._addSub(arguments);
    this.ready = false;
    this.computation.invalidate();

    return {
      ready: function() {
        self.dep.depend();
        return self.ready;
      }
    };
  } else {
    // to support fast-render
    if(Meteor.subscribe) {
      return Meteor.subscribe.apply(Meteor, arguments);
    }
  }
};

SubsManager.prototype._addSub = function(args) {
  var hash = JSON.stringify(args);
  if(!this._cacheMap[hash]) {
    var sub = {
      args: args,
      hash: hash
    };

    this._cacheMap[hash] = sub;
    this._cacheList.push(sub);
  }

  // add the current sub to the top of the list
  var sub = this._cacheMap[hash];
  sub.updated = Date.now();

  var index = this._cacheList.indexOf(sub);
  this._cacheList.splice(index, 1);
  this._cacheList.push(sub);
};

SubsManager.prototype._applyCacheLimit = function () {
  var self = this;
  var overflow = self._cacheList.length - self.options.cacheLimit;
  if(overflow > 0) {
    var removedSubs = self._cacheList.splice(0, overflow);
    _.each(removedSubs, function(sub) {
      delete self._cacheMap[sub.hash];
    });
  }
};

SubsManager.prototype._applyExpirations = function() {

  var self = this;
  var newCacheList = [];

  var expirationTime = Date.now() - self.options.expireIn * 60 * 1000;
  _.each(self._cacheList, function(sub) {
    if(sub.updated >= expirationTime) {
      newCacheList.push(sub);
    } else {
      delete self._cacheMap[sub.hash];
    }
  });

  self._cacheList = newCacheList;
};
