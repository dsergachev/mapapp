import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import Eventer from 'map/system/eventer';

export default Ember.Component.extend({
    //countersService: Ember.inject.service('counters'),
    filters: Ember.inject.service(),
    counters:Ember.inject.service(),
    loader:Ember.inject.service(),
    listen: function() {
        this.get('counters').on('changeCounters', this, 'setCounter');
    }.on('init'),
    init() {
        this._super(...arguments);
        YandexMap.setFiltersService(this.get("filters"));
        YandexMap.setCountersEvent(this.get("counters"));
        YandexMap.setLoaderEvent(this.get("loader"));
    },
    didRender() {
        this._super(...arguments);
        YandexMap.updateWidth();
        this.get('filters').trigger('updateTopFiltersWidth');
    },
    setCounter(counterData)
    {
        this.set(counterData.name,counterData.value);
    },
    countterritory:0,
    countindicators:0,
    blockname:'',
    dropAllActive() {
        this.set('active_main',false);
        this.set('active_territory',false);
        this.set('active_objects_gos',false);
        this.set('active_indicators',false);
        this.set('active_objects',false);
        this.set('active_finance',false);
        this.set('active_documents',false);
        this.set('active_history',false);
        this.set('active_filters',false);
        this.set('active_projects',false);
    },
    actions: {
        showBlock(blockname) {
            var showProjects = false;
            var state='';
            if(this.get('active_'+blockname)) {
                state='off';
                this.set('active_'+blockname,false);
                Ember.$(".map-filter_box-item").hide();
            }
            else {
                state='on';
                this.dropAllActive();
                this.set('active_'+blockname,blockname);

                Ember.$(".map-filter_box-item").hide();
                Ember.$(".map-filter_box-item-"+blockname).show();
            }

            Eventer.setActiveMenu((state === 'on') ? blockname : null);

            //if(blockname==='main') {
                if(state==='on'){
                    console.log("trigger closeMapBaloons");
                    this.get('counters').trigger('closeMapBaloons');
                }
            //}



            if(blockname==='projects')
            {
                showProjects = true;
                this.get('counters').trigger('showProjects','');
            }
            if(blockname==='objects')
            {
                if(state==='on'){
                    this.get('counters').trigger('showObjectsReestr',1);
                }
                else
                {
                    this.get('counters').trigger('showObjectsReestr',0);
                }

            }
            else
            {
                this.get('counters').trigger('showObjectsReestr',0);
            }

            console.log("blockname", blockname, "state", state);

            if(blockname==='objects_gos')
            {

                if(state==='on'){
                    console.log("blockname_GOS_on");
                    this.get('counters').trigger('showObjectsGosReestr',1);
                }
                else
                {
                    console.log("blockname_GOS_off");
                    this.get('counters').trigger('showObjectsGosReestr',0);
                }

            }
            else
            {
                console.log("blockname_GOS_off!");
                this.get('counters').trigger('showObjectsGosReestr',0);
            }

            if(blockname==='projects')
            {
                if(state==='on'){
                    this.get('counters').trigger('showProjectsReestr',1);
                }
                else
                {
                    this.get('counters').trigger('showProjectsReestr',0);
                }

            }
            else
            {
                this.get('counters').trigger('showProjectsReestr',0);
            }

            if(blockname!=='indicators')
            {
                this.get('counters').trigger('hideMapGradient',false);
            }
            if(blockname==='filters') {
                if(state==='on'){
                    this.get('filters').trigger('loadFiltersData');
                }
            }
            if(blockname==='history') {
                if(state==='on'){
                    this.get('filters').trigger('loadHistoryData');
                }
            }

            if(!showProjects) {
                this.get('counters').trigger('showProjects', false);
            }

            if(blockname==='finance')
            {
               this.get('counters').trigger('showDashboards',state==='on');
            }
            else {
                this.get('counters').trigger('showDashboards',false);
            }

            if(blockname==='main')
            {
                this.get('counters').trigger('showMain',state==='on');
            }
            else {
                this.get('counters').trigger('showMain',false);
            }

            setTimeout(() => {
                YandexMap.updateWidth(blockname, state);
                this.get('filters').trigger('updateTopFiltersWidth');
            }, 0);

            this.get('filters').trigger('hideTopFilters');

        }
    }
});

