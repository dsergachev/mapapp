import Ember from 'ember';
import Api from 'map/api';
import User from 'map/models/user';
import Filter from 'map/models/filter';

export default Ember.Component.extend({
    filtersService: Ember.inject.service('filters'),
    listen: function() {
        this.get('filtersService').on('loadHistoryData', this, 'loadData');
    }.on('init'),
    cleanup: function() {
        this.get('filtersService').off('loadHistoryData', this, 'loadData');
    }.on('willDestroyElement'),
    init() {
        this._super(...arguments);
        this.user = User.create();
        this.loadData();

    },
    loadData() {
        Ember.$.getJSON((new Api()).getHost() + '/api/filters?user=' + this.user.getUserId()).then(data => {
            let result = [];
            for(let item of data) {
                let filter = Filter.create(item);
                result.push(filter);
            }
            this.set('filters', result);
            console.log(this.get('filters'));
        });
    }
});
