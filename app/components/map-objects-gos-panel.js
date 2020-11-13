import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import Api from 'map/api';

export default Ember.Component.extend({
    jstreeObject:'',
    objectreestr:[],
    baseTemplateId: 1605,
    exportLink: Ember.computed('objectreestr', function() {
        if(this.get('objectreestr').length > 0) {
            console.log("objectreestr", this.get('objectreestr'));
            let ids = this.get('objectreestr').map(item => { return item.id }).join(',');
            return '/ajax/export-objects?objectsIds='+ids+'&type=xlsx';
        }
        return null;
    }),
    loadObjects(filter)
    {
        // if(filter===false) {
        //     filter=ProjectFilter.createFilterUrl('i');
        // }
        //
        Ember.$.getJSON((new Api()).getHost() + '/api/objects?type_=object&baseTemplateId='+this.baseTemplateId+'&'+filter).then(data => {
            console.log("colorRegion 1");
            YandexMap.colorRegion(ProjectFilter.get('t'));
            YandexMap.placeGosObjectsDots(data,this.get('counters'));

        });
    },
    addObject(object)
    {
        //console.log('GOT OBJECT:');
        //console.log(object);
        this.get('objectreestr').pushObject(object);
    },
    clearObjects()
    {
        this.set('objectreestr',[]);
    },
    showObjectsReestr(state)
    {
        console.log('Show reestr gov:'+state);
        this.set('showobjectreestr',state);

    },
    init() {
        this._super(...arguments);
        var urovniUpravleniya=ProjectFilter.get('gosObjectsUrovniUpravleniya');
        if(urovniUpravleniya.contains('1218876')) {this.set('urovniUpravleniya_1218876',1);}
        if(urovniUpravleniya.contains('1218877')) {this.set('urovniUpravleniya_1218877',1);}
        if(urovniUpravleniya.contains('1218878')) {this.set('urovniUpravleniya_1218878',1);}

    },

    countersService: Ember.inject.service('counters'),
    filtersService: Ember.inject.service('filters'),

    listen: function() {
        this.get('countersService').on('showGosObjects', this, 'loadObjects');
        this.get('countersService').on('closeMapBaloons', this, 'closeMapBaloons');
    }.on('init'),
    listen2: function() {
        this.get('countersService').on('addGosObject', this, 'addObject');
    }.on('init'),
    listen3: function() {
        this.get('countersService').on('clearGosObjects', this, 'clearObjects');
    }.on('init'),
    listen4: function() {
        this.get('countersService').on('showObjectsGosReestr', this, 'showObjectsReestr');
    }.on('init'),
    listen5: function() {
        this.get('filtersService').on('loadFilter', this, 'loadFilter');
    }.on('init'),

    cleanup: function() {
        this.get('countersService').off('showGosObjects', this, 'loadObjects');
        this.get('countersService').off('closeMapBaloons', this, 'closeMapBaloons');
        this.get('countersService').off('addGosObject', this, 'addObject');
        this.get('countersService').off('clearGosObjects', this, 'clearObjects');
        this.get('countersService').off('showObjectsGosReestr', this, 'showObjectsReestr');
        this.get('filtersService').off('loadFilter', this, 'loadFilter');
    }.on('willDestroyElement'),

    counters:Ember.inject.service(),
    data:{'url':(new Api()).getHost() + '/api/classificator?collection=okogu&format=jstree&remove_parent=1'},
    themes:{"name":"default-dark","icons":false},
    plugins:'checkbox',
    urovniUpravleniya:[],
    urovniUpravleniya_1218876:0, //Федеральный
    urovniUpravleniya_1218877:0, //Региональный
    urovniUpravleniya_1218878:0, // Местный
    urovniUpravleniyaAvalilable: [1218876, 1218877, 1218878],   //пока хардкор. надо брать /api/classificator?collection=urovni-upravleniya&remove_parent=1
    showobjectreestr:0,
    fullinfo:[],
    showfullinfo:0,
    blockname: 'objects',
    isActive() {
        return Ember.$(".map-filter_box-item-"+this.blockname + ":visible").length;
    },
    actions:{
        handleGetNode(node)
        {
            if(this.get('preventEvents')) {
                console.log("getnode", node);
                //при загрузке фильтра раскрываем родительский элемент у каждого отмеченного узла дерева, иначе родительский не раскрывается, если внутри него отмечены все галочки
                this.get('jstreeActionReceiver').send('openNode', node.parent);
                ProjectFilter.addGosObjectOkogu(node);
                return;
            }
            //console.log(node);
            if(node.state.selected)
            {
                ProjectFilter.addGosObjectOkogu(node);
            }
            else
            {
                ProjectFilter.removeGosObjectOkogu(node);
            }
        },
        handleSelectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.addGosObjectOkogu(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            this.set('showobjectreestr',1);


        },
        handleDeselectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.removeGosObjectOkogu(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            this.set('showobjectreestr',1);

        },
        setUrovniUpravleniya(id, text, skipRender, skipEvents)
        {
            this.set('urovniUpravleniya_'+id,1);
            ProjectFilter.addGosObjectUrovniUpravleniya({id: id, text: text});
            console.log(ProjectFilter.get('gosObjectsUrovniUpravleniya'));
            if(!skipRender) {
                YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'), skipEvents);
            }
            if(this.isActive()) {
                this.set('showobjectreestr', 1);
            }
        },
        dropUrovniUpravleniya(id, text, skipRender)
        {
            this.set('urovniUpravleniya_'+id,0);
            ProjectFilter.removeGosObjectUrovniUpravleniya({id: id, text: text});
            if(!skipRender) {
                YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'), 'gos', this.get('counters'));
                this.set('showobjectreestr', 1);
            }

        },
        closeReestr()
        {
            this.set('showobjectreestr',0);
            setTimeout(() => {
                YandexMap.updateWidth();
                this.get('filtersService').trigger('updateTopFiltersWidth');
            }, 0);
        },
        showObjectCard(cardid)
        {
            console.log(cardid);
            var Dots=ProjectFilter.get('mapPointsGosObject');
            console.log("Dots", Dots);
            var dot = Dots[cardid];
            if(dot) {
                console.log("OPEN GOS OBJECT DOT", dot);
                geoMap.setCenter(dot.geometry.getCoordinates(),10).then(result => {
                    console.log(ProjectFilter.gos_object_clusterer);
                    if(ProjectFilter.gos_object_clusterer) {
                        let geoObjectState = ProjectFilter.gos_object_clusterer.getObjectState(dot);
                        console.log("geoObjectState", geoObjectState);
                        if (geoObjectState.isClustered) {
                            geoObjectState.cluster.state.set('activeObject', dot);
                            ProjectFilter.gos_object_clusterer.balloon.open(geoObjectState.cluster);
                        } else {
                            // Если объект не попал в кластер, открываем его собственный балун.
                            if(!dot.balloon.isOpen()) {
                                dot.balloon.open();
                            }
                        }
                    }
                    //dot.balloon.open();


                });
            }

        },
        closeCard()
        {
            this.set('showfullinfo',0);
        },
        filterOkogu(filterdOkogu)
        {
            ProjectFilter.clearGosObjectsOkogu();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o','gos'),'gos',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');

            // this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkogu',filterdOkogu);
            console.log(filterdOkogu);
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okogu&format=jstree&remove_parent=1&name='+filterdOkogu});
            //this.get('jstreeActionReceiver').send('redraw');

        },
        clearFilterOkogu()
        {
            ProjectFilter.clearGosObjectsOkogu();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o','gos'),'gos',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');

            //this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkogu',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okogu&format=jstree&remove_parent=1'});
            //  this.get('jstreeActionReceiver').send('redraw');

        },
        reset() {
            ProjectFilter.clearGosObjectsOkogu();
            ProjectFilter.clearGosObjectsUrovniUpravleniya()
            //
            for(let urovniUpravleniyaId of this.get("urovniUpravleniyaAvalilable")) {
                this.actions.dropUrovniUpravleniya.apply(this, [urovniUpravleniyaId, null, true]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkogu',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okogu&format=jstree&remove_parent=1'});
        },
        closeBallon() {
            this.closeMapBaloons();
        }
    },

    closeMapBaloons() {
        // console.log("objectsgos closeMapBaloons");
        // this.set("showfullinfo",0);
        // var Dots=ProjectFilter.get('mapPointsGosObject');
        // for(let dot of Dots) {
        //     if(dot.balloon) {
        //         dot.balloon.close();
        //     }
        // }
    },
    loadFilter(filter) {
        this.set('preventEvents', true);
        this.get('jstreeActionReceiver').send('deselectAll');
        this.get('jstreeActionReceiver').send('closeAll');

        for(let urovniUpravleniyaId of this.urovniUpravleniyaAvalilable) {
            this.actions.dropUrovniUpravleniya.apply(this, [urovniUpravleniyaId, null, true]);
        }

        if(filter.gosObject && filter.gosObject.okogu) {
            for(let node of filter.gosObject.okogu) {
                this.get('jstreeActionReceiver').send('getNode', node.id);
            }

            setTimeout(() => {
                for (let node of filter.gosObject.okogu) {
                    this.get('jstreeActionReceiver').send('selectNode', node.id);
                }
            }, 100);
        }

        if(filter.gos_object && filter.gos_object.urovniUpravleniya) {
            for(var i = 0; i < filter.gos_object.urovniUpravleniya.length; i++) {
                let urovniUpravleniya = filter.gos_object.urovniUpravleniya[i];
                let skipRender = i < filter.gos_object.urovniUpravleniya.length - 1;
                this.actions.setUrovniUpravleniya.apply(this, [urovniUpravleniya.id, urovniUpravleniya.text, skipRender, true]);
            }
        }

        setTimeout(() => {
            var gos=ProjectFilter.get('gos');

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            //this.set('showobjectreestr',1);

            this.set('preventEvents', false);
        }, 1000);
    }
});
