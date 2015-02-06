Tinytest.add('options cacheLimit - exceed', function(test) {
  var sm = new SubsManager({cacheLimit: 2});
  sm._addSub(['posts']);
  sm._addSub(['comments']);
  sm._addSub(['singlePoint', 'one']);

  sm._applyCacheLimit();
  test.equal(sm._cacheList.length, 2);

  var subsIds = sm._cacheList.map(function(sub) {
    return sub.args[0];
  });
  test.equal(subsIds, ['comments', 'singlePoint']);
  sm.clear();
});

Tinytest.add('options cacheLimit - not-exceed', function(test) {
  var sm = new SubsManager({cacheLimit: 10});
  sm._addSub(['posts']);
  sm._addSub(['comments']);
  sm._addSub(['singlePoint', 'one']);

  sm._applyCacheLimit();
  test.equal(sm._cacheList.length, 3);

  var subsIds = sm._cacheList.map(function(sub) {
    return sub.args[0];
  });
  test.equal(subsIds, ['posts', 'comments', 'singlePoint']);
  sm.clear();
});

Tinytest.addAsync('options expireIn - expired', function(test, done) {
  // expireIn 100 millis
  var sm = new SubsManager({cacheLimit: 20, expireIn: 1/60/10});
  sm._addSub(['posts']);
  sm._addSub(['comments']);

  test.equal(sm._cacheList.length, 2);
  Meteor.call('wait', 200, function() {
    sm._applyExpirations();
    test.equal(sm._cacheList.length, 0);
    sm.clear();
    done();
  });
});

Tinytest.addAsync('options expireIn - not expired', function(test, done) {
  // expireIn 2 minutes
  var sm = new SubsManager({cacheLimit: 20, expireIn: 2});
  sm._addSub(['posts']);
  sm._addSub(['comments']);

  test.equal(sm._cacheList.length, 2);
  Meteor.call('wait', 200, function() {
    sm._applyExpirations();
    test.equal(sm._cacheList.length, 2);
    sm.clear();
    done();
  });
});
