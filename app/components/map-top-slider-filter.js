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
        this.get('filtersService').on('updateTopFilters', this, 'loadData');
    }.on('init'),
    listen2: function() {
        this.get('filtersService').on('updateTopFiltersWidth', this, 'updateWidth');
    }.on('init'),
    cleanup: function() {
        this.get('filtersService').off('updateTopFilters', this, 'loadData');
        this.get('filtersService').off('updateTopFiltersWidth', this, 'updateWidth');
    }.on('willDestroyElement'),
    initSwiper(width) {
        if(!width)
            width = 1000;
        let slidesPerView = Math.ceil(width / 250);
        if(this.swiper)
            this.swiper.destroy(true, true);
        this.swiper = new Swiper('.js-bp-template-slider', {
            paginationClickable: false,
            //nextButton: '.swiper-button-next',
            //prevButton: '.swiper-button-prev',
            slidesPerView: slidesPerView,
            spaceBetween: 5,
            freeMode: true,
            mousewheelControl: true,
            /*breakpoints: {
                1024: {
                    slidesPerView: 5,
                    spaceBetween: 4
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 3
                },
                640: {
                    slidesPerView: 2,
                    spaceBetween: 2
                },
                320: {
                    slidesPerView: 1,
                    spaceBetween: 1
                }
            }*/
        });
        setTimeout(() => {
            this.swiper.update();
        }, 10);

    },
    updateWidth() {

        //todo обновить расположение при отображении главной карты

        let leftPanelWidth = 0
            + $(".js-map-filter").outerWidth()
            + $(".js-map-filter_box:visible").outerWidth()
            + $(".map-filter-result:visible").outerWidth();

        let mapWidth = $(window).width() - leftPanelWidth;
        //console.log("setMapWidth", mapWidth);

        $(".js-map-home_slider").offset({left: leftPanelWidth});
        $(".js-map-home_slider").width(mapWidth + 'px');

        //if(this.width != mapWidth) {
        this.initSwiper(mapWidth);
        //}
        this.width = mapWidth;


    },
    loadData() {
        Ember.$.getJSON((new Api()).getHost() + '/api/filters?user=' + this.user.getUserId()+'&ontop=1').then(data => {
            let result = [];
            for (let item of data) {
                let filter = Filter.create(item);
                result.push(filter);
            }
            this.set('filters', result);
            this.updateWidth();
        });
    },
    actions:{
        loadFilter(filter) {
            console.log("loadFilter", filter);
            ProjectFilter.loadFilter(filter);
            this.get('filtersService').trigger('loadFilter',filter);
        }
    }
});
