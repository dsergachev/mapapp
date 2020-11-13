import Ember from 'ember';
import ProjectFilter from 'map/system/filter';

export default Ember.Component.extend({
    show: true,
    filters: [],
    filtersService: Ember.inject.service('filters'),
    listen: function() {
        this.get('filtersService').on('showLoader', this, 'show_');
        this.get('filtersService').on('hideLoader', this, 'hide_');
    }.on('init'),
    cleanup: function() {
        this.get('filtersService').off('showLoader', this, 'show_');
        this.get('filtersService').off('hideLoader', this, 'hide_');
    }.on('willDestroyElement'),
    init() {
        this._super(...arguments);
        var self = this;
        ymaps.ready(function() {
            self.hideLoader.apply(self);
        });
    },
    show_() {
        this.set("show", true);
    },
    hide_() {
        this.set("show", false);
    },
    hideLoader() {
        this.set("show", false);
        // setTimeout((function () {
        //     this.loadDefaultTerritory();
        // }).bind(this), 5000);
        this.loadDefaultTerritory();
    },
    getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    },
    loadDefaultTerritory() {
        let osmid = this.getUrlParameter("_osmid");
        console.log("default osmid", osmid);
        if(osmid) {
            // let filter = {"territory":{"treeItems":[
            //     {id: "899101", text: "г. Москва"}]}};
            // ProjectFilter.loadFilter(filter);
            this.get('filtersService').trigger('loadTerritory',osmid);
        }
    }

});
