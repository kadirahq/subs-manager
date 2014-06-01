# subs-manager
### Subscriptions Manager for Meteor

This is a general purpose Subscriptions Manager for Meteor. But this works pretty well with Iron Router.

## Why?

When you are subscribing inside a `Deps.autorun` computation all the subscriptions started on the previous computation will be stopped.
In Iron Router all the subscriptions are run inside a Deps.autorun computation, so this will affects to Iron Router.

With Iron Router, when you navigate into a new route, all the previous subscriptions will get stopped.
So, you need wait a bit even if you've visit that route previously. That's an UX issue.

But also, it will force Meteor server to resend data you already had in the client. It will [waste your server's CPU and network bandwidth](https://kadira.io/academy/reduce-bandwidth-and-cpu-waste/).

## Solution

Subscriptions Manager caches your subscriptions and run all the subscriptions that have been cached when a route gets changed. So when you are switching between routes you don't need to wait anymore. At the sametime Meteor do not resend data you are already have in the client.

In technical terms, Subscriptions Manager runs it's own Deps.autorun computation internally. So it does not interfere with Iron Router and works independently.

## Usage

Install from Atmosphere

~~~js
mrt add subs-manager
~~~

Using with Iron Router

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

Using with Deps.autorun

~~~js
var subs = new SubsManager();
Deps.autorun(function() {
  var postId = Session.get('postId');
  subs.subscribe('singlePost', postId);
});
~~~

## Cache Control

Since now you are caching subscriptions, Meteor server will also cache all your client data. But don't worry that's not a huge issue. See this [Kadira Academy article](https://kadira.io/academy/optimize-memory-usage/) to learn more about [V8 and Meteor memory usage](https://kadira.io/academy/optimize-memory-usage/).

But, you should have the capability to control the cache. Subscriptions Manager does that.

~~~js
var subs = new SubsManager({
    // maximum number of cache subscriptions
    cacheLimit: 10,
    // any subscription will be expire after 5 minute, if it's not subscribed again
    expireIn: 5
});
~~~

> above values are the default values for each option.

## Patterns for using SubsManager

### Using a global Subscription Manager

You can create a global subscription just like I shown in the previously on the Iron Router usage example. By doing that, all your subscriptions are handle alike.

### Using separate Subscription Managers

If you need more control over caching, you can create separate Subscription Managers for each set of subscriptions and manage them differently. For an example,

* you can cache home page subscriptions indefinitely
* But you can control the cache for other routes

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

With Subscription Manager you don't need to use it everywhere. Simply use it wherever you need while without changing other subscriptions.

For an example, I need to use Subscription Manager for the home page only.

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
      // and does not affects with the Subscription Manager subscriptions
      return Meteor.subscribe('singlePost', this.params.id);
    }
  });
})
~~~
