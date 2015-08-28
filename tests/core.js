Tinytest.addAsync('core - init', function(test, done) {
  Meteor.call('init', done);
});

Tinytest.addAsync('core - single subscribe', function(test, done) {
  var sm = new SubsManager();

  Deps.autorun(function(c) {
    var status = sm.subscribe('posts');
    if(status.ready()) {
      var posts = Posts.find().fetch();
      test.equal(posts, [{_id: 'one'}]);

      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('core - multi subscribe', function(test, done) {
  var sm = new SubsManager();
  var subs = {};

  Session.set('sub', 'posts');

  Deps.autorun(function(c) {
    var sub = Session.get('sub');
    subs[sub] = true;
    var handler = sm.subscribe(sub);

    if(_.keys(subs).length == 2) {
      if(handler.ready()) {
        test.equal(Posts.find().count(), 1);
        test.equal(Comments.find().count(), 1);

        sm.clear();
        c.stop();
        Meteor.defer(done);
      }
    }
  });

  Meteor.call('wait', 200, function() {
    Session.set('sub', 'comments');
  });
});

Tinytest.addAsync('core - global ready method - basic usage', function(test, done) {
  var sm = new SubsManager();

  Deps.autorun(function(c) {
    sm.subscribe('posts');
    if(sm.ready()) {
      var posts = Posts.find().fetch();
      test.equal(posts, [{_id: 'one'}]);

      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('core - global ready method - and change it - aa', function(test, done) {
  var sm = new SubsManager();
  var readyCalledOnce = false;

  Deps.autorun(function(c) {
    sm.subscribe('posts');
    var readyState = sm.ready();

    if(readyState) {
      var posts = Posts.find().fetch();
      test.equal(posts, [{_id: 'one'}]);
      readyCalledOnce = true;

      // with this, ready status became false
      sm.subscribe('not-existing-sub');
    } else if(readyCalledOnce) {
      sm.clear();
      c.stop();
      Meteor.defer(done);
    }
  });
});

Tinytest.addAsync('core - global ready method - initial state', function(test, done) {
  var sm = new SubsManager();
  test.equal(sm.ready(), false);
  done();
});

Tinytest.addAsync('core - multi subscribe but single collection', function(test, done) {
  var sm = new SubsManager();
  var ids = {};

  Session.set('id', 'one');

  Deps.autorun(function(c) {
    var id = Session.get('id');
    ids[id] = true;
    var handler = sm.subscribe('singlePoint', id);

    if(_.keys(ids).length == 2) {
      if(handler.ready()) {
        test.equal(Points.find().count(), 2);
        c.stop();
        Meteor.defer(done);
      }
    }
  });

  Meteor.call('wait', 200, function() {
    Session.set('id', 'two');
  });
});

Tinytest.addAsync('core - resetting', function(test, done) {
  var sm = new SubsManager();
  var allowed = false;

  Meteor.call('postsOnlyAllowed.allow', false, function() {
    Deps.autorun(function(c) {
      var status = sm.subscribe('postsOnlyAllowed');
      var readyState = status.ready();

      if(!allowed) {
        if(readyState) {
          var posts = PostsOnlyAllowed.find().fetch();
          test.equal(posts, []);
          allowed = true;
          Meteor.call('postsOnlyAllowed.allow', true, function() {
            sm.reset();
          });
        }
      } else {
        var posts = PostsOnlyAllowed.find().fetch();
        if(posts.length == 1) {
          test.equal(posts, [{_id: 'one'}]);

          sm.clear();
          c.stop();
          Meteor.defer(done);
        }
      }
    });
  });
});

Tinytest.addAsync('core - clear subscriptions', function(test, done) {
  var sm = new SubsManager();

  Deps.autorun(function(c) {
    var status = sm.subscribe('posts');
    if(status.ready()) {
      var posts = Posts.find().fetch();
      test.equal(posts, [{_id: 'one'}]);

      sm.clear();
      c.stop();
      setTimeout(checkPostsAgain, 200);
    }
  });

  function checkPostsAgain() {
    var postCount = Posts.find({_id: "one"}).count();
    test.equal(postCount, 0);
    done();
  }
});