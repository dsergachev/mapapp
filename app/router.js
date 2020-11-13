import Ember from 'ember';

const Router = Ember.Router.extend({
  rootURL: '/site/newmap/',
});

Router.map(function() {
     this.route('index', { path: '/' });
});

export default Router;
