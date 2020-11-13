import Ember from 'ember';
import ProjectFilter from 'map/system/filter';

export default Ember.Component.extend({
    counters:Ember.inject.service(),
    indicatorService:Ember.inject.service('indicator'),
    init() {
        this._super(...arguments);
        /*if(this.get('indicators').length===0)
        {
            Ember.$.getJSON((new Api()).getHost() + '/api/indicators/territory?parent='+this.get('groupparent')).then(data => {
                this.set('indicators', data);
            });
        }*/
    },
    listen: function() {
        this.get('indicatorService').on('applyFilter', this, 'applyFilter');

    }.on('init'),
    cleanup: function() {
        this.get('indicatorService').off('applyFilter', this, 'applyFilter');
    }.on('willDestroyElement'),
    applyFilter() {
        if(ProjectFilter.get('filterMatchingGroups').length === 0) {
            this.set('indicatorheader.hideFromSearch', false);
        }
        else {
            if (ProjectFilter.get('filterMatchingGroups').indexOf(this.get('indicatorheader.id')) != -1) {
                this.set('indicatorheader.hideFromSearch', false);
                Ember.$('#collapse-' + this.get('indicatorheader.id')).addClass('in').attr('aria-expanded', true).css('height', 'auto');//collapse('show');
                //console.log('#collapse-' + this.get('indicatorheader.id'));
            }
            else {
                this.set('indicatorheader.hideFromSearch', true);
            }
        }
    },
});
