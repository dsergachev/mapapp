import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import FilterObjectType from 'map/system/object';
import YandexMap from 'map/system/yandex';
import Api from 'map/api';

export default Ember.Component.extend({
    countersService: Ember.inject.service('counters'),
    filtersService: Ember.inject.service('filters'),
    indicatorService:Ember.inject.service('indicator'),
    year: "last",
    listen: function() {
        this.get('countersService').on('setRegionscount', this, 'setCount');
    }.on('init'),
    listen2: function() {
        this.get('filtersService').on('loadFilter', this, 'loadFilter');
    }.on('init'),
    listen3: function() {
        this.get('filtersService').on('updateIndicatorRanges', this, 'updateIndicatorRanges');
    }.on('init'),
    cleanup: function() {
        this.get('countersService').off('setRegionscount', this, 'setCount');
        this.get('filtersService').off('loadFilter', this, 'loadFilter');
        this.get('filtersService').off('updateIndicatorRanges', this, 'updateIndicatorRanges');
    }.on('willDestroyElement'),
    setCount(value)
    {
        var preferValue=this.get('regionscount');
        this.set('regionscount',value);
        console.log('regionscount:'+value);
        if( preferValue===0&&value>0)
        {
            if(this.get('indicators').length===0)
            {
                /*Ember.$.getJSON((new Api()).getHost() + '/api/indicators/territory?with_parents=1').then(data => {
                    this.set('indicators', data);
                });*/
                this.loadIndicators();
            }
        }
        if(value == 0) {
            this.get('countersService').trigger('changeCounters', {name: 'countindicators', value: 0});
        }
        else {
            var i=ProjectFilter.get('i');
            this.get('countersService').trigger('changeCounters',{name:'countindicators',value:i.length});
            //console.log("colorRegion 18");
            //YandexMap.colorRegion(ProjectFilter.get('t'), this.get('countersService'));
        }

    },
    regionscount:0,
    indicators:[],
    selectedTerritories: [],
    territoryValues: {},
    filterSrt: '',
    init() {
        this._super(...arguments);
        var countRegions=ProjectFilter.get('t').length;
        this.set('regionscount',countRegions);
        if(countRegions>0)
        {
            /*Ember.$.getJSON((new Api()).getHost() + '/api/indicators/territory?with_parents=1').then(data => {
                this.set('indicators', data);
            });*/
            this.loadIndicators();
        }



    },

    didRender() {
        this._super(...arguments);
        let self = this;

        if(!this.selectboxInited) {
            $('.js-indicator-year').selectbox();
            $('.js-indicator-year').on('change', function () {
                console.log("changed!", $('.js-indicator-year option[selected]').val());
                self.setYear($('.js-indicator-year option[selected]').val());

            });
            this.selectboxInited = true;
        }

    },

    setYear(year) {
        console.log('setYear!!!!!!!!!!!!', year);

        this.set("year", $('.js-indicator-year option[selected]').val());
        ProjectFilter.setIndicatorYear(this.get("year"));
        this.updateIndicatorRanges();

        this.get('filtersService').trigger('showLoader');

        var FilterUrl = ProjectFilter.createTerritoryByIndicatorsUrl();
        Ember.$.post((new Api()).getHost() + '/api/objects', {query: 'type_=territory&' + FilterUrl}).then(data => {
            ProjectFilter.setScope(data);
            console.log("setScope", data);
            console.log("colorRegion 23");
            YandexMap.colorRegion(ProjectFilter.get('t'), this.get('countersService'), null);
            this.get('filtersService').trigger('hideLoader');
        });

    },

    setYearSelectbox(year) {
        $('.js-indicator-year').find('option').removeAttr('selected');
        $('.js-indicator-year').find('option[value="'+year+'"]').attr('selected', 'selected');
        $('.js-indicator-year').val(year);
        $('.js-indicator-year').trigger('refresh');
        this.set("year", $('.js-indicator-year option[selected]').val());
        ProjectFilter.setIndicatorYear(this.get("year"));
    },

    loadIndicators() {
        this.set("territory-level", 3);
        Ember.$.getJSON((new Api()).getHost() + '/api/territory-indicators/' + this.get("territory-level")).then(data => {
            this.set('indicators', data);
            FilterObjectType.setTerritoryIndicators(data);
            this.applyIndicatorRanges();
        });
    },
    updateIndicatorRanges() {
        this.get('filtersService').trigger('showLoader');
        this.selectedTerritories = [];
        this.selectedTerritories = ProjectFilter.getSelectedTerritories();
        /*for(let t of ProjectFilter.t) {
            //пока грузим только для регионов
            if(t.original.level == 3) {
                this.selectedTerritories.push(t.original.osmid);
            }
        }
        for(let t_n of ProjectFilter.t_n) {
            //пока грузим только для регионов
            if(t.original.level == 3) {
                this.selectedTerritories.push(t_n.original.osmid);
            }
        }*/

        //territoryValues

        console.log("selectedTerritories", this.selectedTerritories);
        console.log("this.territoryValues", this.territoryValues);

        let loadOsmids = [];

        for(let osmid of this.selectedTerritories) {
            //console.log("this.territoryValues[osmid]", this.territoryValues[osmid]);
            if(this.territoryValues[osmid] === undefined) {
                loadOsmids.push(osmid);
            }
        }

        if(loadOsmids.length > 0) {
            console.log("loading osmids", loadOsmids);
            var territoryFilterUrl=ProjectFilter.createTerritoryFilterUrl(loadOsmids, false, false);
            console.log("territoryFilterUrl", territoryFilterUrl);
            Ember.$.post(ProjectFilter.getBaseUrl()+"objects", {query: 'type_=territory&' + territoryFilterUrl}).then(response => {
                console.log("territories loaded", response);
                if (response.length > 0) {
                    for(let territory of response) {
                        var osmidItem=FilterObjectType.findAttributeByName(territory.indicators,'OSMID','OSMID');
                        if(osmidItem) {
                            this.territoryValues[osmidItem.value] = territory;
                        }
                    }
                }
                this.applyIndicatorRanges();
            });
        }
        else {
            this.applyIndicatorRanges();
        }

        //this.loadTerritoryValue(territory.original.osmid "32235", territory.original.level = 3)
    },
    applyIndicatorRanges() {
        //console.log('applyIndicatorRanges this.indicators', this.indicators);
        for(let indicatorGroup of this.get("indicators")) {
            for(let indicator of indicatorGroup.indicators) {
                //console.log('apply indicator', indicator);
                var indicatorRange = this.getIndicatorRange(indicator.id);
                //console.log("indicatorRange", indicatorRange);
                if(indicatorRange.min !== null && indicatorRange.max !== null && indicatorRange.min !== indicatorRange.max) {
                    //console.log("this.get('indicatorService').trigger('setIndicatorMinMax", indicatorRange.min, indicatorRange.max);
                    this.get('indicatorService').trigger('setIndicatorMinMax', indicator.id, indicatorRange.min, indicatorRange.max);
                }
                else {
                    this.get('indicatorService').trigger('setIndicatorMinMax', indicator.id, null, null);
                }
            }
        }
        this.get('filtersService').trigger('hideLoader');
    },
    getIndicatorRange(id) {
        let min = null;
        let max = null;
        //console.log("getIndicatorRange for ", id);
        for(let osmid of this.selectedTerritories) {
            if(this.territoryValues[osmid]) {

                //console.log("grab territory", osmid, this.territoryValues[osmid]);
                let indicators = FilterObjectType.findIndicatorsById(this.territoryValues[osmid].indicators, id);
                //console.log("indicator", indicator);
                for(let indicator of indicators) {
                    let property = FilterObjectType.getIndicatorPropertyByName(indicator, 'Число');
                    let propertyYear = FilterObjectType.getIndicatorPropertyByNodelink(indicator, 'kalendarnyy-god');

                    //console.log("propertyYear", propertyYear, property);
                    //console.log("year", ProjectFilter.get("indicatorYear"));
                    //если option = last или value = год
                    if(propertyYear && (propertyYear.options == ProjectFilter.get("indicatorYear") || propertyYear.value == ProjectFilter.get("indicatorYear"))) {
                        //console.log("property", property);
                        if (min === null)
                            min = property.value_num;
                        if (max === null)
                            max = property.value_num;
                        if (property.value_num < min)
                            min = property.value_num;
                        if (property.value_num > max)
                            max = property.value_num;
                    }
                }
            }
        }
        return {
            min: min,
            max: max
        };
    },
    actions: {
        filter(filterSrt) {
            let filterMatchingIndicators = [];
            let filterMatchingGroups = [];
            console.log("filterStr", filterSrt);
            this.set("filterSrt", filterSrt);

            for(let indicatorGroup of this.get("indicators")) {
                for(let indicator of indicatorGroup.indicators) {
                    if(indicator.name.search(new RegExp(filterSrt,"i")) != -1) {
                        //console.log(indicator.name);
                        filterMatchingIndicators.push(indicator.id);
                        if(filterMatchingGroups.indexOf(indicatorGroup.id) == -1) {
                            filterMatchingGroups.push(indicatorGroup.id);
                        }
                    }
                }
            }
            ProjectFilter.set("filterIndicatorsStr", filterSrt);
            ProjectFilter.set("filterMatchingIndicators", filterMatchingIndicators);
            ProjectFilter.set("filterMatchingGroups", filterMatchingGroups);
            this.get('indicatorService').trigger('applyFilter');
        },
        resetSearch(){
            //this.set("filterSrt", "");
            this.actions.filter.apply(this, ['']);
        },
        reset(){
            this.resetIndicators(true);
        },
        selectYear() {
            let year = this.$(".js-indicator-year").val();
            console.log("select year", year);
            this.set("year", year);


        }
    },
    resetIndicators(redrawMap) {
        this.setYearSelectbox('last');
        ProjectFilter.set("filterMatchingIndicators", []);
        ProjectFilter.set("filterMatchingGroups", []);
        this.get('indicatorService').trigger('applyFilter');
        this.get('indicatorService').trigger('deselectIndicators');
        this.get('indicatorService').trigger('resetIndicators');
        ProjectFilter.clearRangedIndicator();

        this.get('countersService').trigger('changeCounters',{name:'countindicators',value:0});

        if(redrawMap) {
            console.log("colorRegion 19");
            YandexMap.colorRegion(ProjectFilter.get('t'), this.get('countersService'));
        }
    },
    loadFilter(filter) {
        if(filter.territory && filter.territory.indicatorYear) {
            this.setYearSelectbox(filter.territory.indicatorYear);
        }
    }
});
