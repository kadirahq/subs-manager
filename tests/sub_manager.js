Tinytest.add('options cacheLimit - exceed', function(test) {
  var sm = new SubsManager({cacheLimit: 2});
  sm._addSub({id: 1});
  sm._addSub({id: 2});
  sm._addSub({id: 3});

  sm._applyCacheLimit();
  test.equal(sm._cacheList.length, 2);

  var subsIds = sm._cacheList.map(function(sub) {
    return sub.args.id;
  });
  test.equal(subsIds, [2, 3]);
});

Tinytest.add('options cacheLimit - not-exceed', function(test) {
  var sm = new SubsManager({cacheLimit: 10});
  sm._addSub({id: 1});
  sm._addSub({id: 2});
  sm._addSub({id: 3});

  sm._applyCacheLimit();
  test.equal(sm._cacheList.length, 3);

  var subsIds = sm._cacheList.map(function(sub) {
    return sub.args.id;
  });
  test.equal(subsIds, [1, 2, 3]);
});

Tinytest.addAsync('options expireIn - expired', function(test, done) {
  // expireIn 100 millis
  var sm = new SubsManager({cacheLimit: 20, expireIn: 1/60/10});
  sm._addSub({id: 1});
  sm._addSub({id: 2});

  test.equal(sm._cacheList.length, 2);
  setTimeout(function() {
    sm._applyExpirations();
    test.equal(sm._cacheList.length, 0);
    done();
  }, 200);
});

Tinytest.addAsync('options expireIn - not expired', function(test, done) {
  // expireIn 2 minutes
  var sm = new SubsManager({cacheLimit: 20, expireIn: 2});
  sm._addSub({id: 1});
  sm._addSub({id: 2});

  test.equal(sm._cacheList.length, 2);
  setTimeout(function() {
    sm._applyExpirations();
    test.equal(sm._cacheList.length, 2);
    done();
  }, 200);
});
