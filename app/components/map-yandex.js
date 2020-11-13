import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import FilterObjectType from 'map/system/object';
import ValuesValidator from 'map/system/values';
import YandexMap from 'map/system/yandex';
import Eventer from 'map/system/eventer';
import Api from 'map/api';

export default Ember.Component.extend({
    data: { 'url': (new Api()).getHost() + '/api/knoema/datasets?format=jstree' },
    themes: { "name": "default-dark" },

    showregionballon: 0,
    showTerritorySelectBaloon: 0,
    showTemplatesBaloon: 0,
    showRegionTemplatesNoData: 0,
    ballonleft: 400,
    ballontop: 400,
    style: '',
    regioninfo: [],
    name: '',
    addressClasifierId: 0,
    id: 0,
    projectsCount: 0,
    objectsCount: 0,
    okvedTotal: 0,
    indicators: [],
    measures: [],
    showMeasures: 0,
    showNoData: 0,
    regionCode: '',
    selectedNode: '',
    indicatorData: '',
    indicatorvalues: [],
    noreginfo: 0,
    showgradient: 0,
    gradientValue: [],
    countersService: Ember.inject.service('counters'),
    filtersService: Ember.inject.service('filters'),
    listen: function () {
        this.get('countersService').on('showRegionData', this, 'showRegionData');
        this.get('countersService').on('closeMapBaloons', this, 'closeMapBaloons');
    }.on('init'),
    listen2: function () {
        this.get('countersService').on('setMapGradient', this, 'setMapGradient');
    }.on('init'),
    listen3: function () {
        this.get('countersService').on('hideMapGradient', this, 'hideMapGradient');
    }.on('init'),
    listen4: function () {
        this.get('countersService').on('showTerritoriesSelect', this, 'showTerritoriesSelect');
    }.on('init'),
    listen5: function () {
        this.get('countersService').on('setMapGradientName', this, 'setMapGradientName');
    }.on('init'),
    cleanup: function () {
        this.get('countersService').off('showRegionData', this, 'showRegionData');
        this.get('countersService').off('setMapGradient', this, 'setMapGradient');
        this.get('countersService').off('hideMapGradient', this, 'hideMapGradient');
        this.get('countersService').off('showTerritoriesSelect', this, 'showTerritoriesSelect');
        this.get('countersService').off('setMapGradientName', this, 'setMapGradientName');
    }.on('willDestroyElement'),
    init() {
        //$parent.offset().left;
        this._super(...arguments);
    },
    showTerritoriesSelect(properties) {
        Ember.$.getJSON((new Api()).getHost() + '/api/territories-by-coords/?x=' + properties.x + '&y=' + properties.y).then(data => {
            //return data;
            console.log(data);
            if (data.length > 0) {

                if (Eventer.getActiveMenu() === 'main') {
                    console.log("select territories: ", data);
                    if (data && data.length > 1) {
                        this.get('filtersService').trigger('selectTerritory', data[1].osmid);
                    }
                }
                else {

                    this.set("showregionballon", 0);
                    this.set("showTerritorySelectBaloon", 1);
                    this.set("selectTerritories", data);
                    this.set("style", 'position:absolute;left:' + properties.clientX + "px;top:" + (properties.clientY - Ember.$('#map').offset().top + $(window).scrollTop() - 50) + "px;");
                    setTimeout(function () {
                        $(".draggable").draggable();
                    }, 0);
                }

            }
            else {
                this.set("showTerritorySelectBaloon", 0);
            }
        });
    },


    didInsertElement() {
        this._super(...arguments);
        let self = this;
        $(window).on("resize", function () {
            self.updateHeight();
        });
        self.updateHeight();

    },
    updateHeight() {
        let height = $(window).height();
        if (height < 720) {
            height = 720;
        }
        $(".imap").height(height);

        console.log("imap height", $(".imap").height());
        YandexMap.updateWidth();
    },

    hideMapGradient() {
        this.set('showgradient', 0);
    },
    setMapGradient(values) {
        /*console.log("GR:");
        if((values.min || values.max) && values.pointvalue != 0) {
            var fromColor = FilterObjectType.decToHex(200, Math.round(values.min / values.pointvalue), 200);
            var toColor = FilterObjectType.decToHex(200, Math.round(values.max / values.pointvalue), 200);

            fromColor = '#FFFFF';
            toColor = '#ef5350';

            console.log('linear-gradient(to left, ' + fromColor + ', ' + toColor + ')');

            this.set('minGR', FilterObjectType.formatNumber(values.min));
            this.set('maxGR', FilterObjectType.formatNumber(values.max));
            this.set('styleGR', 'background:linear-gradient(to left, ' + fromColor + ', ' + toColor + ')');
            this.set('showgradient', 1);
            setTimeout(()=>{YandexMap.updateWidth();}, 10);

        }
        else {
            console.log("bad gradien values", values.min, values.max, values.pointvalue);
            this.set('showgradient', 0);
        }*/

        if (values.min && values.max) {
            let fromColor = '#FFFFFF';
            let toColor = '#ef5350';

            console.log('linear-gradient(to left, ' + fromColor + ', ' + toColor + ')');

            this.set('minGR', FilterObjectType.formatNumber(values.min));
            this.set('maxGR', FilterObjectType.formatNumber(values.max));
            this.set('styleGR', 'background:linear-gradient(to right, ' + fromColor + ', ' + toColor + ')');
            this.set('showgradient', 1);
            setTimeout(() => {
                YandexMap.updateWidth();
            }, 10);
        }
        else {
            this.set('showgradient', 0);
        }

    },

    setMapGradientName(indicatorName) {
        this.set('indicatorName', indicatorName);
    },

    showRegionData(data) {

        console.log(data);
        var territoryFilterUrl = ProjectFilter.createTerritoryFilterUrl(data.region);
        console.log(territoryFilterUrl);
        console.log(ProjectFilter.getBaseUrl() + "combifilter?" + territoryFilterUrl);

        Ember.$.post(ProjectFilter.getBaseUrl() + "combifilter",  {query:territoryFilterUrl}).then(response => {

            let year = ProjectFilter.getIndicatorYear();
            if (year == 'last')
                year = "последние доступные года";
            else
                year = year + " год";
            this.set('year', year);

            console.log(response);
            if (response.territory.length == 0) {
                console.log('no reg data');
                this.set("noreginfo", 1);
            }
            else {
                this.set("noreginfo", 0);

                this.set("name", ValuesValidator.checkValue(FilterObjectType.findAttributeByName(response.territory[0].indicators, 'Название территории')));
                this.set("addressClasifierId", ValuesValidator.checkValue(FilterObjectType.findAttributeByName(response.territory[0].indicators, 'ID узла адресного классификатора')));
                this.set("objectsCount", response.object.length);
                this.set("projectsCount", response.project.length);
                //this.set("indicators",FilterObjectType.findMesuredIndicators(response.territory[0].indicators,5));
                this.set("indicators", FilterObjectType.getTerritoryIndicatorsForCard(response.territory[0].indicators, 5, ProjectFilter.getIndicatorYear()));

                console.log({ 'name': this.get('name'), 'objectsCount': this.get('objectsCount'), 'projectsCount': this.get('projectsCount'), 'indicators': this.get('indicators') });
            }

            this.set("showregionballon", 1);
            this.set("regioninfo", data);
            this.set("ballonleft", data.x);
            this.set("ballontop", data.y);
            //this.set("style",'position:absolute;left:'+data.x+"px;top:"+(data.y-350)+"px;");

            this.set("style", 'position:absolute;left:' + data.x + "px;top:" + (data.y - Ember.$('#map').offset().top + $(window).scrollTop() - 100) + "px;");
            setTimeout(function () {
                $(".draggable").draggable();
            }, 0);

            this.findRegionCode();

            setTimeout(function () {
                $(".draggable").draggable();
            }, 0);
        });


    },
    findRegionCode() {
        Ember.$.getJSON((new Api()).getHost() + '/api/knoema/regions?name=' + this.get('name')).then(data => {
            if (data.length > 0) {
                this.set('regionCode', data);
            }
            else {
                this.set('showNoData', 1);
            }
        });
    },
    showIndicatorData(indicator, measure) {
        var regionCode = this.get('regionCode');


        var regionMeasure = regionCode[0].id;
        var indicatorCode = indicator.original.original_id;

        if (measure != undefined) {
            var measureId = measure.id;
        }
        else {
            var measureId = '';
        }


        Ember.$.getJSON('/ajax/x?f=release-1-9.invstup.com/ajax/z&time=2009-2015&members=' + regionMeasure + '&dataset=' + indicator.original.dataset + '&indicatormembers=' + indicatorCode + '&measuremembers=' + measureId).then(data => {

            console.log(data);
            this.set('preloader', 0);
            this.set('indicatorData', data.data);


        });
    },

    actions: {
        closeBallon() {
            this.closeMapBaloons();
        },
        regionShowMore() {
            this.set("showregionballon", 0);
            this.set("showfullinfo", 1);
            this.set('preloader', 1);
            Ember.$.getJSON((new Api()).getHost() + '/api/knoema/indicators?not_empty=1&region=' + this.get('name')).then(data => {

                var cleareddata = FilterObjectType.clearDataPath(data);
                this.set('indicatorvalues', cleareddata);
                this.set('preloader', 0);
            });
        },
        regionShowTemplates() {
            var addressClasifierId = this.get('addressClasifierId');
            this.set("showregionballon", 0);
            this.set("showTemplatesBaloon", 1);
            Ember.$.getJSON('/site/territory-print?id=' + addressClasifierId).then(response => {
                if (response.data.length > 0) {
                    this.set('regionTemlates', response.data);
                    this.set('showRegionTemplatesNoData', 0);
                }
                else {
                    this.set('showRegionTemplatesNoData', 1);
                }
                setTimeout(function () {
                    $(".draggable").draggable();
                }, 0);
            });
        },
        regionCloseTemplates() {
            this.set("showregionballon", 1);
            this.set("showTemplatesBaloon", 0);
        },
        regionCloseMore() {
            this.set("showfullinfo", 0);
        },
        handleSelectNodes(node) {
            this.set('preloader', 1);
            this.set('showMeasures', 0);
            this.set('indicatorData', []);
            console.log(node);
            Ember.$.getJSON((new Api()).getHost() + '/api/knoema/' + node.original.dataset + '/measure?format=jstree').then(data => {
                this.set('selectedNode', node);
                if (data.length > 0) {
                    this.set('measures', data);
                    this.set('showMeasures', 1);
                }
                else {
                    this.set('showMeasures', 0);
                    this.showIndicatorData(node);
                }

            });

        },
        handleDeselectNodes(node) {
            console.log(node);
        },
        showMeasuredData(measure) {
            this.set('preloader', 1);
            this.showIndicatorData(this.get('selectedNode'), measure);
        },
        selectTerritory(territory) {
            console.log("select", territory);
            this.set("showTerritorySelectBaloon", 0);
            this.get('filtersService').trigger('selectTerritory', territory);

        }
    },

    closeMapBaloons() {
        this.set("showregionballon", 0);
        this.set("showTerritorySelectBaloon", 0);
        this.set("showfullinfo", 0);
        this.set("showTemplatesBaloon", 0);
        geoMap.balloon.close();
    }
});
