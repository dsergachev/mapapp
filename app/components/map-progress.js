import Ember from 'ember';

export default Ember.Component.extend({
    loaderService: Ember.inject.service('loader'),
    listen: function() {
        this.get('loaderService').on('start', this, 'start');
    }.on('init'),
    listen2: function() {
        this.get('loaderService').on('stop', this, 'stop');
    }.on('init'),
    width: 0,
    init() {
        this._super(...arguments);

    },
    start() {
        if(this.timer)
            clearInterval(this.timer);
        if(this.get("width") >= 100)
            this.set('width', 0);
        this.timer = setInterval(() => {
            this.animate();
        }, 500);
    },
    stop() {
        this.set("width", 0);
        if(this.timer)
            clearInterval(this.timer);
    },
    animate() {
        let width = this.get("width");
        if(width < 100) {
            this.set('width', ++width);
        }
    }

});
