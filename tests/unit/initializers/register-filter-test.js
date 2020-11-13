import Ember from 'ember';
import RegisterFilterInitializer from 'map/initializers/register-filter';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | register filter', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  RegisterFilterInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
