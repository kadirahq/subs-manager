Tinytest.addAsync('subs with error - mix of error and non error', function(test, done) {
  var sm = new SubsManager();

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one');
  });

  Deps.autorun(function(c) {
    var status = subscribeToErrorOne();
    status = sm.subscribe('posts');
    if(status.ready()) {
      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('subs with error - with existing ready callback', function(test, done) {
  var sm = new SubsManager();

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one', function() {});
  });

  Deps.autorun(function(c) {
    var status = subscribeToErrorOne();
    status = sm.subscribe('posts');
    if(status.ready()) {
      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('subs with error - with existing onReady', function(test, done) {
  var sm = new SubsManager();

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one', {onReady: function() {}});
  });

  Deps.autorun(function(c) {
    var status = subscribeToErrorOne();
    status = sm.subscribe('posts');
    if(status.ready()) {
      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('subs with error - with existing onError', function(test, done) {
  var sm = new SubsManager();
  var called = false;

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one', {onError: function() {called = true;}});
  });

  Deps.autorun(function(c) {
    var status = subscribeToErrorOne();
    status = sm.subscribe('posts');
    if(status.ready()) {
      test.isTrue(called);

      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('subs with error - with some args', function(test, done) {
  var sm = new SubsManager();

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one', "args");
  });

  Deps.autorun(function(c) {
    var status = subscribeToErrorOne();
    status = sm.subscribe('posts');
    if(status.ready()) {
      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('subs with error - just the error sub', function(test, done) {
  var sm = new SubsManager();

  var subscribeToErrorOne = _.once(function() {
    return sm.subscribe('error-one');
  });

  var c = Deps.autorun(function() {
    var status = sm.subscribe('error-one')
    if(status.ready()) {
      test.fail("This should not pass!");
    }
  });

  Meteor.setTimeout(function() {
    sm.clear();
    c.stop();
    Meteor.defer(done);
  }, 100);
});