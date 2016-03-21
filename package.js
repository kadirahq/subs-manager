Package.describe({
  "summary": "Subscriptions Manager for Meteor",
  "version": "1.6.4",
  "git": "https://github.com/meteorhacks/subs-manager.git",
  "name": "meteorhacks:subs-manager"
});

Package.on_use(function(api) {
  configurePackage(api);
  api.export(['SubsManager']);
});

Package.on_test(function(api) {
  configurePackage(api);

  api.use(['tinytest', 'mongo-livedata', 'session'], ['client', 'server']);
  api.add_files([
    'tests/init.js',
  ], ['server', 'client']);

  api.add_files([
    'tests/options.js',
    'tests/core.js',
    'tests/error.js'
  ], ['client']);
});

function configurePackage(api) {
  if(api.versionsFrom) {
    api.versionsFrom('METEOR@0.9.0');
  }
  
  api.use(['deps', 'underscore', 'ejson'], ['client', 'server']);
  api.use('meteorhacks:fast-render@2.7.0', 'client', {weak: true});
  
  api.add_files([
    'lib/sub_manager.js',
  ], ['client', 'server']);
}
