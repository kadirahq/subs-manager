Package.describe({
  "summary": "Subscription Manager for Meteor"
});

Package.on_use(function(api) {
  configurePackage(api);
  api.export(['SubsManager']);
});

Package.on_test(function(api) {
  configurePackage(api);

  api.use(['tinytest'], ['client', 'server']);
  api.add_files([
    'tests/sub_manager.js'
  ], ['client']);
});

function configurePackage(api) {
  api.use(['deps'], ['client', 'server']);
  api.add_files([
    'lib/sub_manager.js',
  ], ['client', 'server']);
}
