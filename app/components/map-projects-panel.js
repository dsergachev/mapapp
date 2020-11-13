import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import FilterObjectType from 'map/system/object';
import Api from 'map/api';

export default Ember.Component.extend({
    jstreeObject:'',
    objectreestr:[],
    loadProjects(filter)
    {
        //без фильтра не грузим
        return;
        if(filter===false) {filter='&id=0';}
        Ember.$.post((new Api()).getHost() + '/api/objects', {query: 'type_=territory&' + filter}).then(data => {

            //фильтруем на пустые
            var result = [];
            for(let object of data) {
                var indicators=object.indicators;
                var Name=FilterObjectType.findAttributeByName(indicators,'Название проекта');
                var Coordinates= FilterObjectType.findAttributeByName(indicators,'Координаты проекта');
                if(Name && Coordinates)
                    result.push(object);
            }

            this.set('projects', result);

            YandexMap.placeProjectsDots(result, this.get('countersService'));
        });
    },
    addProject(project)
    {
        console.log("ADD project", project);
        this.get('projectreestr').pushObject(project);
    },
    clearProjects()
    {
        this.set('projectreestr',[]);
    },
    showProjectsReestr(state)
    {
        console.log('Show reestr:'+state);
        this.set('showprojectreestr',state);
    },
    countersService: Ember.inject.service('counters'),
    filtersService: Ember.inject.service('filters'),
    listen: function() {
        this.get('countersService').on('showProjects', this, 'loadProjects');
        this.get('countersService').on('closeMapBaloons', this, 'closeMapBaloons');
    }.on('init'),
    listen2: function() {
        this.get('countersService').on('addProject', this, 'addProject');
    }.on('init'),
    listen3: function() {
        this.get('countersService').on('clearProjects', this, 'clearProjects');
    }.on('init'),
    listen4: function() {
        this.get('countersService').on('showProjectsReestr', this, 'showProjectsReestr');
    }.on('init'),
    listen5: function() {
        this.get('filtersService').on('loadFilter', this, 'loadFilter');
    }.on('init'),

    cleanup: function() {
        this.get('countersService').off('showProjects', this, 'loadProjects');
        this.get('countersService').off('closeMapBaloons', this, 'closeMapBaloons');
        this.get('countersService').off('addProject', this, 'addProject');
        this.get('countersService').off('clearProjects', this, 'clearProjects');
        this.get('countersService').off('showProjectsReestr', this, 'showProjectsReestr');
        this.get('filtersService').off('loadFilter', this, 'loadFilter');
    }.on('willDestroyElement'),

    data:{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'},
    themes:{"name":"default-dark","icons":false},
    plugins:'checkbox',
    showobjectreestr:0,
    fullinfo:[],
    showfullinfo:0,
    blockname: 'projects',
    isActive() {
        return Ember.$(".map-filter_box-item-"+this.blockname + ":visible").length;
    },
    actions:{
        handleGetNode(node)
        {
            if(this.get('preventEvents')) {
                //при загрузке фильтра раскрываем родительский элемент у каждого отмеченного узла дерева, иначе родительский не раскрывается, если внутри него отмечены все галочки
                this.get('jstreeActionReceiver').send('openNode', node.parent);
                ProjectFilter.addProjectOkved(node);
                return;
            }
            //console.log(node);
            if(node.state.selected)
            {
                ProjectFilter.addProjectOkved(node);
            }
            else
            {
                ProjectFilter.removeProjectOkved(node);
            }
        },
        handleSelectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.addProjectOkved(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('countersService'));
            this.set('showprojectreestr',1);


        },
        handleDeselectNodes(node){
            //console.log(node);
            if(this.get('preventEvents')) { return; }
            ProjectFilter.removeProjectOkved(node);
            for(var i=0;i<node.children_d.length;i++)
            {
                this.get('jstreeActionReceiver').send('getNode',node.children_d[i]);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('countersService'));
            this.set('showprojectreestr',1);

        },
        closeReestr()
        {
            this.set('showprojectreestr',0);
            setTimeout(() => {
                YandexMap.updateWidth();
                this.get('filtersService').trigger('updateTopFiltersWidth');
            }, 0);
        },

        showProjectCard(cardid)
        {
            console.log(cardid);
            var Dots=ProjectFilter.get('mapPointsProject');
            console.log("Dots", Dots);
            var dot = Dots[cardid];
            if(dot) {
                console.log("OPEN Project DOT", dot);
                geoMap.setCenter(dot.geometry.getCoordinates(),10).then(result => {
                    console.log(ProjectFilter.project_clusterer);
                    if(ProjectFilter.project_clusterer) {
                        let geoObjectState = ProjectFilter.project_clusterer.getObjectState(dot);
                        console.log("geoObjectState", geoObjectState);
                        if (geoObjectState.isClustered) {
                            geoObjectState.cluster.state.set('activeObject', dot);
                            ProjectFilter.project_clusterer.balloon.open(geoObjectState.cluster);
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
            ProjectFilter.clearProjectsOkved();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('countersService'));

            this.get('jstreeActionReceiver').send('deselectAll');

            this.set('filterdOkved',filterdOkved);
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1&name='+filterdOkved});
            //   this.get('jstreeActionReceiver').send('redraw');

        },
        clearFilterOKved()
        {
            ProjectFilter.clearProjectsOkved();
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('countersService'));

            this.get('jstreeActionReceiver').send('deselectAll');

            this.set('filterdOkved',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'});
        },
        reset() {
            ProjectFilter.clearProjectsOkved();

            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('countersService'));

            this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkved',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=okved&format=jstree&remove_parent=1'});
        },
        closeBallon() {
            this.closeMapBaloons();
        }
    },
    closeMapBaloons() {
        // this.set("showfullinfo",0);
        // var Dots=ProjectFilter.get('mapPointsProject');
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

        if(filter.project && filter.project.okveds) {
            for(let node of filter.project.okveds) {
                this.get('jstreeActionReceiver').send('getNode', node.id);
            }

            setTimeout(() => {
                for (let node of filter.project.okveds) {
                    this.get('jstreeActionReceiver').send('selectNode', node.id);
                }
            }, 100);
        }

        setTimeout(() => {
            var p=ProjectFilter.get('p');

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'p',this.get('counters'));

            this.set('preventEvents', false);
        }, 1000);
    }
});