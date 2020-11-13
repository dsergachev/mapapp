import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import Api from 'map/api';

export default Ember.Component.extend({
    jstreeObject:'',
    objectreestr:[],
    baseTemplateId: 467,
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
        if(filter===false) {
            filter=ProjectFilter.createFilterUrl('i');
        }

        Ember.$.getJSON((new Api()).getHost() + '/api/objects?type_=object&baseTemplateId=null|'+this.baseTemplateId+'&'+filter).then(data => {
            console.log("colorRegion 1");
            YandexMap.colorRegion(ProjectFilter.get('t'));
            YandexMap.placeObjectsDots(data,this.get('counters'));

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
        console.log('Show reestr:'+state);
        this.set('showobjectreestr',state);
    },
    init() {
        this._super(...arguments);
        var statuses=ProjectFilter.get('objectsStatuses');
        if(statuses.contains('703161')) {this.set('status_703161',1);}
        if(statuses.contains('703326')) {this.set('status_703326',1);}
        if(statuses.contains('703327')) {this.set('status_703327',1);}

    },

    countersService: Ember.inject.service('counters'),
    filtersService: Ember.inject.service('filters'),

    listen: function() {
        this.get('countersService').on('showObjects', this, 'loadObjects');
        this.get('countersService').on('closeMapBaloons', this, 'closeMapBaloons');
    }.on('init'),
    listen2: function() {
        this.get('countersService').on('addObject', this, 'addObject');
    }.on('init'),
    listen3: function() {
        this.get('countersService').on('clearObjects', this, 'clearObjects');
    }.on('init'),
    listen4: function() {
        this.get('countersService').on('showObjectsReestr', this, 'showObjectsReestr');
    }.on('init'),
    listen5: function() {
        this.get('filtersService').on('loadFilter', this, 'loadFilter');
    }.on('init'),

    cleanup: function() {
        this.get('countersService').off('showObjects', this, 'loadObjects');
        this.get('countersService').off('closeMapBaloons', this, 'closeMapBaloons');
        this.get('countersService').off('addObject', this, 'addObject');
        this.get('countersService').off('clearObjects', this, 'clearObjects');
        this.get('countersService').off('showObjectsReestr', this, 'showObjectsReestr');
        this.get('filtersService').off('loadFilter', this, 'loadFilter');
    }.on('willDestroyElement'),

    counters:Ember.inject.service(),
    data:{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'},
    themes:{"name":"default-dark","icons":false},
    plugins:'checkbox',
    statuses:[],
    status_703161:0, //проектируемый
    status_703326:0, //строящийся
    status_703327:0, // действующий
    statusesAvalilable: [703161, 703326, 703327],   //пока хардкор. надо брать /api/classificator?collection=sostoyanie-obyektov&remove_parent=1
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
                ProjectFilter.addObjectOkved(node);
                return;
            }
            //console.log(node);
            if(node.state.selected)
            {
                ProjectFilter.addObjectOkved(node);
            }
            else
            {
                ProjectFilter.removeObjectOkved(node);
            }
        },
        handleSelectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.addObjectOkved(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            this.set('showobjectreestr',1);


        },
        handleDeselectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.removeObjectOkved(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            this.set('showobjectreestr',1);

        },
        setStatus(id, text, skipRender, skipEvents)
        {
            this.set('status_'+id,1);
            ProjectFilter.addObjectStatus({id: id, text: text});
            console.log(ProjectFilter.get('objectsStatuses'));
            if(!skipRender) {
                YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'), skipEvents);
            }
            if(this.isActive()) {
                this.set('showobjectreestr', 1);
            }
        },
        dropStatus(id, text, skipRender)
        {
            this.set('status_'+id,0);
            ProjectFilter.removeObjectStatus({id: id, text: text});
            if(!skipRender) {
                YandexMap.placeObjects(ProjectFilter.createFilterUrl(), 'o', this.get('counters'));
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
            var Dots=ProjectFilter.get('mapPointsObject');
            console.log("Dots", Dots);
            var dot = Dots[cardid];
            if(dot) {
                console.log("OPEN OBJECT DOT", dot);
                geoMap.setCenter(dot.geometry.getCoordinates(),10).then(result => {
                    console.log(ProjectFilter.object_clusterer);
                    if(ProjectFilter.object_clusterer) {
                        let geoObjectState = ProjectFilter.object_clusterer.getObjectState(dot);
                        console.log("geoObjectState", geoObjectState);
                        if (geoObjectState.isClustered) {
                            geoObjectState.cluster.state.set('activeObject', dot);
                            ProjectFilter.object_clusterer.balloon.open(geoObjectState.cluster);
                        } else {
                            // Если объект не попал в кластер, открываем его собственный балун.
                            if(!dot.balloon.isOpen()) {
                                dot.balloon.open();
                            }
                        }
                    }
                });
            }

        },
        closeCard()
        {
            this.set('showfullinfo',0);
        },
        filterOKVED(filterdOkved)
        {
            ProjectFilter.clearObjectsOkved();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');

            // this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkved',filterdOkved);
            console.log(filterdOkved);
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1&name='+filterdOkved});
            //   this.get('jstreeActionReceiver').send('redraw');

        },
        clearFilterOKved()
        {
            ProjectFilter.clearObjectsOkved();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');

            //this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkved',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'});
            //  this.get('jstreeActionReceiver').send('redraw');

        },
        reset() {
            ProjectFilter.clearObjectsOkved();
            ProjectFilter.clearObjectStatus();

            for(let statusId of this.get("statusesAvalilable")) {
                this.actions.dropStatus.apply(this, [statusId, null, true]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));

            this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkved',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'});
        },
        closeBallon() {
            this.closeMapBaloons();
        }
    },
    closeMapBaloons() {
        // console.log("objects closeMapBaloons");
        // this.set("showfullinfo",0);
        // var Dots=ProjectFilter.get('mapPointsObject');
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

        for(let statusId of this.statusesAvalilable) {
            this.actions.dropStatus.apply(this, [statusId, null, true]);
        }

        if(filter.object && filter.object.okveds) {
            for(let node of filter.object.okveds) {
                this.get('jstreeActionReceiver').send('getNode', node.id);
            }

            setTimeout(() => {
                for (let node of filter.object.okveds) {
                    this.get('jstreeActionReceiver').send('selectNode', node.id);
                }
            }, 100);
        }

        if(filter.object && filter.object.statuses) {
            for(var i = 0; i < filter.object.statuses.length; i++) {
                let status = filter.object.statuses[i];
                let skipRender = i < filter.object.statuses.length - 1;
                this.actions.setStatus.apply(this, [status.id, status.text, skipRender, true]);
            }
        }

        setTimeout(() => {
            var o=ProjectFilter.get('o');

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            //this.set('showobjectreestr',1);

            this.set('preventEvents', false);
        }, 1000);
    }
});
