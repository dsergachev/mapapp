import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import Api from 'map/api';
import User from 'map/models/user';
import Filter from 'map/models/filter';

export default Ember.Component.extend({
    filtersService: Ember.inject.service('filters'),
    show: true,
    filters: [],
    init() {
        this._super(...arguments);
        this.user = User.create();
        this.loadData();
    },
    listen: function() {
        this.get('filtersService').on('hideTopFilters', this, 'hide');
    }.on('init'),
    cleanup: function() {
        this.get('filtersService').off('hideTopFilters', this, 'hide');
    }.on('willDestroyElement'),
    actions: {
        hide() {
            this.hide();
        }
    },
    hide() {
        this.set('show', false);
    },
    loadData() {
        Ember.$.getJSON((new Api()).getHost() + '/api/filters?user=' + this.user.getUserId()+'&ontop=1').then(data => {
            if(data.length == 0) {
                this.hide();
                console.log("no top filters. hide panel");
            }
            else {
                let result = [];
                for (let item of data) {
                    let filter = Filter.create(item);
                    result.push(filter);
                }

                this.set('filters', result);
                console.log(this.get('filters'));
            }

        });
    }
});
