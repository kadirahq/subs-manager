# SubsManager [![Build Status](https://travis-ci.org/meteorhacks/subs-manager.svg?branch=master)](https://travis-ci.org/meteorhacks/subs-manager)

####  Subscriptions Manager for Meteor

This is a general-purpose subscriptions manager for Meteor. It also works pretty well with [Iron Router](https://github.com/EventedMind/iron-router), with some limitations.

## Why?

When you are subscribing inside a `Tracker.autorun` computation, all the subscriptions started on the previous computation will be stopped.

Iron Router runs all subscriptions inside a `Tracker.autorun` computation, so this will affect Iron Router too: when you navigate to a new route, all the previous subscriptions will be stopped. The user will have to wait a bit even if they've visited that route previously. That's an UX issue.

Also, this will force the Meteor server to resend data you already had in the client. It will [waste your server's CPU and network bandwidth](https://kadira.io/academy/reduce-bandwidth-and-cpu-waste/).

## Solution

Subscriptions Manager caches your subscriptions and runs all the subscriptions that have been cached when a route is changed. This means that when switching between routes, the user will no longer have to wait. Also, Meteor won't need to re-send data that's already in the client.

In technical terms, Subscriptions Manager runs it's own `Tracker.autorun` computation internally. It does not interfere with Iron Router and works independently.

> Subscriptions Manager does not cache your individual data. It tells Meteor to cache the whole subscription. So, your data will get updated in the background as usual.

## Usage

Installation

~~~js
meteor add meteorhacks:subs-manager
// if you've not yet migrated to Meteor 0.9, apply following:
// mrt add subs-manager
~~~

Usage with Iron Router: just replace `Meteor.subscribe()` calls with `subs.subscribe()`, where `subs` is a `new SubsManager()`.

~~~js
var subs = new SubsManager();

Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return subs.subscribe('postList');
    }
  });

  this.route('singlePost', {
    path: '/post/:id',
    waitOn: function() {
      return subs.subscribe('singlePost', this.params.id);
    }
  });
})
~~~

Using with Tracker.autorun:

~~~js
var subs = new SubsManager();
Tracker.autorun(function() {
  var postId = Session.get('postId');
  subs.subscribe('singlePost', postId);
});
~~~

### Resetting

Sometime, we need to re-run our subscriptions may be after some major activity in the app.

> Eg:- After a user has update the plan.

In those situations, you can reset Subscription Manager.

~~~js
var subs = new SubsManager();

// later in some other place
subs.reset();
~~~

### Clear Subscriptions

In somecases, we need to clear the all the subscriptions we cache. So, this is how we can do it.

~~~js
var subs = new SubsManager();

// later in some other place
subs.clear();
~~~

## Limitations

Subscription Manager aims to be a drop-in replacement for [`Meteor.subscribe`](http://docs.meteor.com/#meteor_subscribe) (or `this.subscribe()` in Iron Router). At the moment, the following functionality doesn't work (patches welcome):

* `onError` and `onReady` callbacks ([issue](https://github.com/meteorhacks/subs-manager/issues/7))
* chained [`.wait()`](https://github.com/EventedMind/iron-router/blob/devel/DOCS.md#waiting-on-subscriptions-wait) call in Iron Router ([issue](https://github.com/meteorhacks/subs-manager/issues/6) - you can use `waitOn` instead)

## Cache Control

Since now you are caching subscriptions, the Meteor server will also cache all your client data. But don't worry - that's not a huge issue. See this [Kadira Academy article](https://kadira.io/academy/optimize-memory-usage/) to learn more about [V8 and Meteor memory usage](https://kadira.io/academy/optimize-memory-usage/).

But, you should have the capability to control the cache. Subscriptions Manager does that.

~~~js
var subs = new SubsManager({
    // maximum number of cache subscriptions, use 0 for unlimited
    cacheLimit: 10,
    // any subscription will be expire after 5 minute, if it's not subscribed again, use 0 to never expire
    expireIn: 5
});
~~~

The above values are the default values for each option.

## Patterns for using SubsManager

### Using a global Subscription Manager

You can create a global subscription manager as shown in the Iron Router example. By doing that, all your subscriptions are handled the same way.

### Using separate Subscription Managers

If you need more control over caching, you can create separate Subscription Managers for each set of subscriptions and manage them differently. For example,

* you can cache home page subscriptions indefinitely
* but you can control the cache for other routes

~~~js
var homeSubs = new SubsManager({cacheLimit: 9999, expireIn: 9999});
var singleSubs = new SubsManager({cacheLimit: 20, expireIn: 3});

Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return homeSubs.subscribe('postList');
    }
  });

  this.route('singlePost', {
    path: '/post/:id',
    waitOn: function() {
      return singleSubs.subscribe('singlePost', this.params.id);
    }
  });
})
~~~

### Cache subscriptions you only need

With Subscription Manager you don't need to use it everywhere. Simply use it wherever you need without changing other subscriptions.

For example, to only use Subscription Manager for the home page:

~~~js
var subs = new SubsManager();
Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return subs.subscribe('postList');
    }
  });

  this.route('singlePost', {
    path: '/post/:id',
    waitOn: function() {
      // These subscriptions will be handled by Iron Router
      // and do not interfere with the Subscription Manager subscriptions
      return Meteor.subscribe('singlePost', this.params.id);
    }
  });
})
~~~

### Using global ready checking

You can also check the ready status of all the subscriptions at once like this:

~~~js
var subs = new SubsManager();
subs.subscribe('postList');
subs.subscribe('singlePost', 'id1');

Tracker.autorun(function() {
  if(subs.ready()) {
    // all the subscriptions are ready to use.
  }
});
~~~
