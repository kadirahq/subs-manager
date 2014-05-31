SubManager = function (options) {
  var self = this;
  self.cache = {};
  self.ready = false;
  self.buffered = {};
  self.dep = new Deps.Dependency();

  self.computation = Deps.autorun(function() {
    var ready = true;
    _.each(self.cache, function(args) {
      ready = ready && Meteor.subscribe.apply(Meteor, args).ready();
    });

    if(ready) {
      self.ready = true;
      self.buffered = {};
      self.dep.changed();
    }
  });
};

SubManager.prototype.subscribe = function() {
  var self = this;
  if(Meteor.isClient) {
    var hash = JSON.stringify(arguments);
    this.cache[hash] = arguments;

    this.ready = false;
    this.computation.invalidate();
    
    return {
      ready: function() {
        self.dep.depend();
        return self.ready;
      }
    };
  } else {
    return Meteor.subscribe.apply(Meteor, arguments);
  }
};