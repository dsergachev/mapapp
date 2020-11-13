import Ember from 'ember';
import ProjectFilter from 'map/system/filter';

export default Ember.Component.extend({
    filtersService: Ember.inject.service('filters'),
    actions:{
        filterOntopToggle() {
            console.log("filterOntopToggle", this.get("filter.ontop"));
            this.set("filter.ontop", this.get("filter.ontop") ? 0 : 1);

            //let filterObj = new Filter(this.get("filter"));
            //filterObj.save();
            this.get("filter").save().then(()=> {
                this.get('filtersService').trigger('updateTopFilters');
            });
        },
        remove() {
            console.log("delete");

            this.set("filter.my", 0);
            //let filterObj = new Filter(this.get("filter"));
            //filterObj.save()
            this.get("filter")
                .save()
                .then(data => {
                    this.get('filtersService').trigger('loadFiltersData',false);
                });
        },
        loadFilter() {
            console.log("loadFilter", this.get("filter"));
            ProjectFilter.loadFilter(this.get("filter"));
            this.get('filtersService').trigger('loadFilter',this.get("filter"));
        }
    }

});
