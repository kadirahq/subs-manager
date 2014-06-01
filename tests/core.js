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

  Session.set('sub', 'posts');
  setTimeout(function() {
    Session.set('sub', 'comments');
  }, 100);
});

Tinytest.addAsync('core - multi subscribe but single collection', function(test, done) {
  var sm = new SubsManager();
  var ids = {};

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

  Session.set('id', 'one');
  setTimeout(function() {
    Session.set('id', 'two');
  }, 100);
});
