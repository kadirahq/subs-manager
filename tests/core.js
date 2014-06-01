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
        c.stop();
        Meteor.defer(done);
      }
    }
  });

  Meteor.call('wait', 200, function() {
    Session.set('sub', 'comments');
  });
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
