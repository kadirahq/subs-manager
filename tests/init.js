Posts = new Meteor.Collection('posts');
Comments = new Meteor.Collection('comments');
Points = new Meteor.Collection('points');

if(Meteor.isServer) {

  Meteor.publish('posts', function() {
    return Posts.find();
  });

  Meteor.publish('comments', function() {
    return Comments.find();
  });

  Meteor.publish('singlePoint', function(id) {
    return Points.find(id);
  });

  // using this method since PhantomJS does have support setTimeout
  Meteor.methods({
    "wait": function(millis) {
      Meteor._wrapAsync(function(done) {
        setTimeout(done, millis);
      })();
    },

    "init": function() {
      Posts.remove({});
      Comments.remove({});
      Points.remove({});

      Posts.insert({_id: "one"});
      Comments.insert({_id: "one"});
      Points.insert({_id: "one"});
      Points.insert({_id: "two"});
    }
  });
}
