import Ember from 'ember';
import ProjectFilter from 'map/system/filter';

export default Ember.Component.extend({
    filtersService: Ember.inject.service('filters'),
    actions:{
        loadFilter() {
            console.log("loadFilter", this.get("filter"));
            ProjectFilter.loadFilter(this.get("filter"));
            this.get('filtersService').trigger('loadFilter',this.get("filter"));
            this.get('filtersService').trigger('hideTopFilters');
        }
    }
});
