Posts = new Meteor.Collection('posts');
PostsOnlyAllowed = new Meteor.Collection('posts-only-allowed');
Comments = new Meteor.Collection('comments');
Points = new Meteor.Collection('points');

if(Meteor.isServer) {

  Meteor.publish('posts', function() {
    return Posts.find();
  });

  Meteor.publish('postsOnlyAllowed', function() {
    if(PostsOnlyAllowed._allowed) {
      return PostsOnlyAllowed.find();
    } else {
      this.ready();
    }
  });

  Meteor.publish('comments', function() {
    return Comments.find();
  });

  Meteor.publish('singlePoint', function(id) {
    return Points.find(id);
  });

  Meteor.publish('error-one', function(id) {
    throw new Meteor.Error(400, "dddd");
  });

  // using this method since PhantomJS does have support setTimeout
  Meteor.methods({
    "wait": function(millis) {
      Meteor.wrapAsync(function(done) {
        setTimeout(done, millis);
      })();
    },

    "init": function() {
      Posts.remove({});
      Comments.remove({});
      Points.remove({});
      PostsOnlyAllowed.remove({});

      Posts.insert({_id: "one"});
      Comments.insert({_id: "one"});
      Points.insert({_id: "one"});
      Points.insert({_id: "two"});

      PostsOnlyAllowed.insert({_id: "one"});
    },

    "postsOnlyAllowed.allow": function(allowed) {
      PostsOnlyAllowed._allowed = allowed;
    }
  });
}
