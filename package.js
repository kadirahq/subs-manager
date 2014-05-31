Package.describe({
  "summary": "Subscription Manager for Meteor"
});

Package.on_use(function(api) {
  configurePackage(api);
  api.export(['SubManager']);
});

function configurePackage(api) {
  api.use(['deps'], ['client', 'server']);
  api.add_files([
    'lib/sub-manager.js',
  ], ['client', 'server']);
}