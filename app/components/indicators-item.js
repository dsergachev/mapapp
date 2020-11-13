import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import Api from 'map/api';

export default Ember.Component.extend({
    init() {
        this._super(...arguments);

        let item = this.get('indicatorItem');


        this.globalMin = null;
        this.globalMax = null;

        if(item.uses && item.uses.territory && item.uses.territory.min_value !== null && item.uses.territory.max_value !== null) {
            this.globalMin = item.uses.territory.min_value;
            this.globalMax = item.uses.territory.max_value;
        }

        if(this.globalMin === null)
            this.globalMin = 0;
        if(this.globalMax === null)
            this.globalMax = 0;

        this.set('indicatorItem.value', [this.globalMin, this.globalMax]);

        item.min = this.globalMin;
        item.max = this.globalMax;

        //this.set('indicatorItem.value', 0);
    },
    counters:Ember.inject.service(),
    filtersService: Ember.inject.service('filters'),
    indicatorService:Ember.inject.service('indicator'),
    listen: function() {
        this.get('indicatorService').on('deselectIndicators', this, 'deselectIndicator');
        this.get('indicatorService').on('resetIndicators', this, 'resetIndicator');
        this.get('indicatorService').on('setIndicatorRange', this, 'setIndicatorRange');
        this.get('indicatorService').on('setIndicatorMinMax', this, 'setIndicatorMinMax');
        this.get('indicatorService').on('setRangedIndicator', this, 'setRangedIndicator');
        this.get('indicatorService').on('applyFilter', this, 'applyFilter');

    }.on('init'),
    cleanup: function() {
        this.get('indicatorService').off('deselectIndicators', this, 'deselectIndicator');
        this.get('indicatorService').off('resetIndicators', this, 'resetIndicator');
        this.get('indicatorService').off('setIndicatorRange', this, 'setIndicatorRange');
        this.get('indicatorService').off('setIndicatorMinMax', this, 'setIndicatorMinMax');
        this.get('indicatorService').off('setRangedIndicator', this, 'setRangedIndicator');
        this.get('indicatorService').off('applyFilter', this, 'applyFilter');
    }.on('willDestroyElement'),
    actions:{
        handleSliderChange(value,object){

            this.get('filtersService').trigger('showLoader');
            //console.log(value);
            //console.log(object);
            //console.log(object.oldValue);

            let indicatorItem = this.get('indicatorItem');
            let indicatorName = '';
            if(indicatorItem) {
                indicatorName = indicatorItem.name;
            }

            ProjectFilter.removeIndicator({indicator:indicatorItem.id});
            //добавляем индикатор только если ползунок не в мин и макс значениях
            if(!(Math.round(indicatorItem.min) === Math.round(value[0]) && Math.round(indicatorItem.max) === Math.round(value[1]))) {
                ProjectFilter.addIndicator({
                    indicator: indicatorItem.id,
                    name: indicatorName,
                    param: 3738,
                    min: value[0],
                    max: value[1]
                });
                //console.log("add Indicator!", indicatorItem.min, value[0], indicatorItem.max, value[1]);
            }

            ProjectFilter.saveFilter();

            var FilterUrl=ProjectFilter.createTerritoryByIndicatorsUrl();

            /*if(this.get('indicatorItem.selected')) {
                var FilterUrl = ProjectFilter.createTerritoryByIndicatorsUrl();

                Ember.$.getJSON((new Api()).getHost() + '/api/objects?type_=territory&' + FilterUrl).then(data => {
                    ProjectFilter.setScope(data);
                    console.log("colorRegion 2");
                    YandexMap.colorRegion(ProjectFilter.get('t'), this.get('counters'), null);
                });
            }
            else {*/
                //console.log("FilterUrl", FilterUrl);
                if(FilterUrl) {
                   Ember.$.post((new Api()).getHost() + '/api/objects', {query: 'type_=territory&' + FilterUrl}).then(data => {
                        ProjectFilter.setScope(data);
                        //console.log("setScope", data);
                        //console.log("colorRegion 3");
                        YandexMap.colorRegion(ProjectFilter.get('t'), this.get('counters'), null);
                        this.get('filtersService').trigger('hideLoader');
                    });
                }
                else {
                    console.log("colorRegion 4");
                    YandexMap.colorRegion(ProjectFilter.get('t'), this.get('counters'));
                    ProjectFilter.setScope([]);
                    console.log("setScope []");
                    this.get('filtersService').trigger('hideLoader');
                }
            //}



            var i=ProjectFilter.get('i');
            this.get('counters').trigger('changeCounters',{name:'countindicators',value:i.length});
            this.get('counters').trigger('hideMapGradient', false);


        },
        selectIndicator(indicator)
        {
            this.get('filtersService').trigger('showLoader');
            this.get("counters").trigger('setMapGradientName', this.get('indicatorItem.name'));
            console.log(indicator);
            if(!this.get('indicatorItem.selected')) {
                this.get('indicatorService').trigger('deselectIndicators');
                this.set('indicatorItem.selected',true);
                ProjectFilter.setRangedIndicator({
                    id: this.get('indicatorItem').id,
                    name: this.get('indicatorItem').name
                });
                //если выбран индикатор для градиента, но не ищем по его диапазону нему, то добавляем его с мин макс диапазоном
                /*if(!ProjectFilter.findIndicator({indicator:indicator})) {
                    ProjectFilter.addIndicator({
                        indicator: indicatorItem.id,
                        name: indicatorName,
                        param: 9,
                        min: value[0],
                        max: value[1]
                    });
                }*/
            }
            else {
                this.get('indicatorService').trigger('deselectIndicators');
                ProjectFilter.clearRangedIndicator();
            }

            ProjectFilter.saveFilter();

            if(this.get('indicatorItem.selected')) {
                var FilterUrl = ProjectFilter.createTerritoryByIndicatorsUrl();

                Ember.$.post((new Api()).getHost() + '/api/objects', {query: 'type_=territory&' + FilterUrl}).then(data => {
                    ProjectFilter.setScope(data);
                    console.log("colorRegion 5");
                    YandexMap.colorRegion(ProjectFilter.get('t'), this.get('counters'), null);
                    this.get('filtersService').trigger('hideLoader');
                });
            }
            else {
                console.log("colorRegion 6");
                YandexMap.colorRegion(ProjectFilter.get('t'), this.get('counters'));
                ProjectFilter.setScope([]);
                this.get('filtersService').trigger('hideLoader');
            }
        }
    },
    deselectIndicator() {
        this.set('indicatorItem.selected', false);
    },
    resetIndicator() {
        this.setValue(null, null);
        ProjectFilter.removeIndicator({indicator:this.get("indicatorItem.id")});
    },
    setIndicatorRange(id, from, to) {
        if(this.get('indicatorItem.id') == id) {
            this.setValue(from, to);
        }
    },
    setIndicatorMinMax(id, min, max) {
        //console.log("setIndicatorMinMax", id, min, max);
        if(this.get('indicatorItem.id') == id) {
            if(min === null)
                min = this.globalMin;
            if(max === null)
                max = this.globalMax;
            let from = this.get("indicatorItem.value")[0];
            let to = this.get("indicatorItem.value")[1];

            // console.log("this.max == to", this.get("indicatorItem.max"), to);
            // console.log("this.min == from", this.get("indicatorItem.min"), from);

            //если ползунок был в мин или макс положениях - смещаем в новое крайнее положение
            if(Math.round(this.get("indicatorItem.min")) == Math.round(from)) {
                from = min;
            }
            if(Math.round(this.get("indicatorItem.max")) == Math.round(to)) {
                to = max;
            }

            //если ползунок стоит за новыми границами min,max, то двигаем
            //если значения были за пределами новых min max, то обнуляем
            if (from < min || from > max)
                from = min;
            if(to > max || to < min)
                to = max;


            this.set("indicatorItem.value", [from, to]);

            //console.log("set", min, max);
            this.set("indicatorItem.min", min);
            this.set("indicatorItem.max", max);

        }
    },
    setRangedIndicator(indicator) {
        if(indicator && indicator.id && indicator.id == this.get('indicatorItem.id')) {
            this.set('indicatorItem.selected', true);
        }
    },
    applyFilter() {
        if(ProjectFilter.get('filterIndicatorsStr')) {
            if (ProjectFilter.get('filterMatchingIndicators').length === 0) {
                this.set('indicatorItem.hideFromSearch', true);
            }
            else {
                if (ProjectFilter.get('filterMatchingIndicators').indexOf(this.get('indicatorItem.id')) != -1) {
                    this.set('indicatorItem.hideFromSearch', false);
                }
                else {
                    this.set('indicatorItem.hideFromSearch', true);
                }
            }
        }
        else {
            this.set('indicatorItem.hideFromSearch', false);
        }
    },
    setValue(from, to) {

        let indicatorItem = this.get("indicatorItem");

        /*if(!(indicatorItem.uses && indicatorItem.uses.territory &&
            indicatorItem.uses.territory.min_value !== null && indicatorItem.uses.territory.min_value !== undefined &&
            indicatorItem.uses.territory.max_value !== null && indicatorItem.uses.territory.max_value !== undefined)) {
            return;
        }*/

        if(from === undefined || from === null || to === undefined || to === null) {
            //from = indicatorItem.uses.territory.min_value;
            from =  indicatorItem.min;
            //to = indicatorItem.uses.territory.max_value;
            to = indicatorItem.max;
        }

        if (!(from >= indicatorItem.min && from <= indicatorItem.max)) {
            from = indicatorItem.min;
        }
        if (!(to >= indicatorItem.min && to <= indicatorItem.max)) {
            to = indicatorItem.max;
        }

        this.set("indicatorItem.value", [from, to]);
    }
});
