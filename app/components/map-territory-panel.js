import Ember from 'ember';
import ProjectFilter from 'map/system/filter';
import YandexMap from 'map/system/yandex';
import MetaSettings from 'map/system/data';
import FilterObjectType from 'map/system/object';
import Api from 'map/api';

export default Ember.Component.extend({
    counters:Ember.inject.service(),
    filtersService: Ember.inject.service('filters'),
    indicatorService:Ember.inject.service('indicator'),
    nodes:[],
    jstreeObject:'',
    data:{'url':(new Api()).getHost() + '/api/classificator?collection=address-classifier&format=jstree&remove_parent=1'},
    treeData: [],
    themes:{"name":"default-dark","icons":false},
    plugins:'checkbox',
    countreg:0,
    neighbors:false,
    showneighborsswith:1,
    lastlevel:0,
    listen: function() {
        this.get('filtersService').on('loadFilter', this, 'loadFilter');
        this.get('filtersService').on('loadTerritory', this, 'loadTerritory');
        this.get('filtersService').on('selectTerritory', this, 'selectTerritory');
        this.get('filtersService').on('deselectTerritory', this, 'deselectTerritory');
    }.on('init'),
    cleanup: function() {
        this.get('filtersService').off('loadFilter', this, 'loadFilter');
        this.get('filtersService').off('loadTerritory', this, 'loadTerritory');
        this.get('filtersService').off('selectTerritory', this, 'selectTerritory');
        this.get('filtersService').off('deselectTerritory', this, 'deselectTerritory');
    }.on('willDestroyElement'),
    init() {
        this._super(...arguments);
        this.checkNeighborsState();
        Ember.$.getJSON(this.data.url)
            .then(response => {
                this.set("treeData", response);
            });
    },

    colorSingleRegionWithNeghbors()
    {
        console.log('color single');

        var node=ProjectFilter.get('t')[0];

        if(!node) {
            return;
        }

        var territoryFilter=ProjectFilter.createTerritoryFilterUrl(node.original.osmid,true);
        // console.log(territoryFilterUrl);
        // console.log(ProjectFilter.getBaseUrl()+"combifilter?"+territoryFilterUrl);

        Ember.$.post(ProjectFilter.getBaseUrl()+"combifilter", {query: territoryFilter }).then(response => {
            console.log(response);
            if(response.territory!==undefined&&response.territory.length===1&&response.territory[0].indicators!==undefined)
            {
                var indicators=response.territory[0].indicators;
                var withregionsOSMIDS=FilterObjectType.findAttributeByName(indicators,'Соседние регионы').value;
                console.log('withregionsOSMIDS', withregionsOSMIDS);

                Ember.$.post(ProjectFilter.getBaseUrl()+"objects", {query: "?type_=territory&"+ProjectFilter.createTerritoryByAddrss(withregionsOSMIDS)}).then(response => {
                    
                    //console.log(response);
                    ProjectFilter.set('t_n',withregionsOSMIDS);
                    ProjectFilter.set('neighborItems',response);
                    var t=ProjectFilter.get('t');
                    var t_n=ProjectFilter.get('t_n');
                    console.log("colorRegion 7");
                    YandexMap.colorRegion(t,this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
                    this.get('filtersService').trigger('updateIndicatorRanges');

                    this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
                    this.get('counters').trigger('setRegionscount',t.length + t_n.length);
                });
            }
            else
            {
                console.log('ERROR IN NEIGHBORS REQUEST!');
            }
        });
    },
    checkNeighborsState()
    {
        var regcount=ProjectFilter.get('t').length;
        console.log("checkNeighborsState, regcount="+regcount, ProjectFilter.get('t'));
        let showNeighbors = false;
        if(regcount === 1) {
            //только если 1 регион
            if(ProjectFilter.get('t')[0] && ProjectFilter.get('t')[0].original && ProjectFilter.get('t')[0].original.level == 4) {
                showNeighbors = true;
            }
        }
        if(showNeighbors)
        {
            this.set('showneighborsswith',1);
            return this.get('neighbors');
        }
        else
        {
            this.set('showneighborsswith',0);
            return false;
        }
    },
    openNode(node) {
        if(this.get('preventEvents')) { return; }
        console.log("openNode", node);

        for(var i=0;i<node.children.length;i++)
        {
            this.get('jstreeActionReceiver').send('getNode',node.children[i]);
        }

        if(node.state.selected)
        {
            var t=ProjectFilter.get('t');


            if(this.checkNeighborsState())
            {
                ProjectFilter.includeNeighbors();
                this.colorSingleRegionWithNeghbors();
            }
            else
            {
                ProjectFilter.dropNeighbors();
                console.log("colorRegion 8");
                YandexMap.colorRegion(t,this.get('counters'),[]);
                this.get('filtersService').trigger('updateIndicatorRanges');
            }

            var t_n=ProjectFilter.get('t_n');
            this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
            this.get('counters').trigger('setRegionscount',t.length + t_n.length);

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
        }

    },
    actions:{
        handleSelectNodes(node){
            if(this.get('preventEvents')) { return; }

            ProjectFilter.addTerritory(node);
            var t=ProjectFilter.get('t');

            this.get('filtersService').trigger('setMainDashboardsTerritories', t);

            console.log("handleSelectNodes", node, t);
            this.set('nodes',t);
            /*if(node.parent==="#") {
                //console.log("parent = #");
                this.get('jstreeActionReceiver').send('openNode', node);
                this.openNode(node);
            }
            else*/
            {
                if(node.state.opened) {
                    for(var i=0;i<node.children.length;i++) {
                        this.get('jstreeActionReceiver').send('getNode',node.children[i]);
                    }
                }
                // Получаем регион и его соседей

                if(this.checkNeighborsState()) {
                    ProjectFilter.includeNeighbors();
                    this.colorSingleRegionWithNeghbors();
                }
                else {
                    ProjectFilter.dropNeighbors();
                    console.log("colorRegion 9");
                    YandexMap.colorRegion(t,this.get('counters'),[]);
                    this.get('filtersService').trigger('updateIndicatorRanges');
                }
                var t_n=ProjectFilter.get('t_n');
                this.set('countreg',t.length);
                this.set('lastlevel',node.original.level);
                this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
                this.get('counters').trigger('setRegionscount',t.length + t_n.length);
            }

            //console.log(ProjectFilter.createCombifilterUrl());
            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
        },
        handleDeselectNodes(node){
            if(this.get('preventEvents')) { return; }

            console.log("handleDeselectNodes", node);
            ProjectFilter.removeTerritory(node);

            //обновляем родительские элементы, если снята галочка
            for(let parentId of node.parents) {
                this.get('jstreeActionReceiver').send('getNode',parentId);
            }

            var t=ProjectFilter.get('t');

            this.get('filtersService').trigger('setMainDashboardsTerritories', t);

            this.set('nodes',t);

            if(node.state.opened)
            {
                for(var i=0;i<node.children.length;i++)
                {
                    this.get('jstreeActionReceiver').send('getNode',node.children[i]);
                    //this.get('jstreeActionReceiver').send('deselectNode',node.children[i]);
                }

                this.get('jstreeActionReceiver').send('closeNode',node);

                if(this.checkNeighborsState())
                {
                    ProjectFilter.includeNeighbors();
                    this.colorSingleRegionWithNeghbors();
                }
                else
                {
                    ProjectFilter.dropNeighbors();
                    console.log("colorRegion 10");
                    YandexMap.colorRegion(t,this.get('counters'));
                    this.get('filtersService').trigger('updateIndicatorRanges');
                }
            }
            else
            {
                if(this.checkNeighborsState())
                {
                    ProjectFilter.includeNeighbors();
                    this.colorSingleRegionWithNeghbors();
                }
                else
                {
                    ProjectFilter.dropNeighbors();
                    console.log("colorRegion 11");
                    YandexMap.colorRegion(t,this.get('counters'));
                    this.get('filtersService').trigger('updateIndicatorRanges');
                }
                var t_n=ProjectFilter.get('t_n');
                this.set('countreg',t.length);
                this.set('lastlevel',node.original.level);
                this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
                this.get('counters').trigger('setRegionscount',t.length + t_n.length);
            }

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
        },
        handleGetNode(node,target='t')
        {
            if(this.get('preventEvents')) {
                console.log("getnode", node);
                //при загрузке фильтра раскрываем родительский элемент у каждого отмеченного узла дерева, иначе ЦФО не раскрывается, если внутри него отмечены все галочки
                this.get('jstreeActionReceiver').send('openNode', node.parent);
                ProjectFilter.addTerritory(node);
                return;
            }
            if(target==='t')
            // console.log(node);
            {
                if(node.state.selected)
                {
                    ProjectFilter.addTerritory(node);
                }
                else
                {
                    ProjectFilter.removeTerritory(node);
                }
            }
            else
            {
                ProjectFilter.addNeighborTerritory(node);
            }
        },
        handleOpenNode(node)
        {
            if(this.get('preventEvents')) { return; }
            this.openNode(node);

        },
        handleCloseNode(node)
        {
            if(this.get('preventEvents')) { return; }
            console.log(node);

            for(var i=0;i<node.children.length;i++) {
                this.get('jstreeActionReceiver').send('getNode',node.children[i]);
            }
            var t=ProjectFilter.get('t');


            if(this.checkNeighborsState())
            {
                ProjectFilter.includeNeighbors();
                this.colorSingleRegionWithNeghbors();
            }
            else
            {
                ProjectFilter.dropNeighbors();
                console.log("colorRegion 12");
                YandexMap.colorRegion(t,this.get('counters'),[]);
                this.get('filtersService').trigger('updateIndicatorRanges');
            }
            var t_n=ProjectFilter.get('t_n');
            this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
            this.get('counters').trigger('setRegionscount',t.length + t_n.length);

            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
        },
        checkNeighbors(name)
        {
            var checkbox=Ember.$('.onoffswitch-checkbox[name="'+name+'"]');
            var switcher=Ember.$('#'+name+'-switcher');
            var state=this.get('neighbors');
            console.log("checkNeighbors " + name + " state " + state);
            if(state===false)
            {
                this.set('neighbors',true);
                checkbox.attr('checked','checked');
                switcher.animate({left:'15px'},50);
                switcher.css('background','#ff3823');
            }
            else
            {
                this.set('neighbors',false);
                checkbox.attr('checked',false);
                switcher.animate({left:'3px'},50);
                switcher.css('background','#444');
            }
            var t=ProjectFilter.get('t');

            if(t.length===1)
            {
                if(this.checkNeighborsState())
                {
                    ProjectFilter.includeNeighbors();
                    this.colorSingleRegionWithNeghbors();
                }
                else
                {
                    ProjectFilter.dropNeighbors();
                    console.log("colorRegion 13");
                    YandexMap.colorRegion(t,this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
                    YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
                    this.get('filtersService').trigger('updateIndicatorRanges');
                }
            }

            var t_n=ProjectFilter.get('t_n');
            this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
            this.get('counters').trigger('setRegionscount',t.length + t_n.length);
        },
        handleReady()
        {
            // this.treeDataStructure = this.get('jstreeObject').jstree(true).get_json(this.get('jstreeObject'), {
            //     flat: true
            // });
            this.treeLoaded = true;
            if(this.loadOsmid) {
                console.log("loadTerritory after load tree");
                this.loadTerritory(this.loadOsmid);
            }
        },
        filterOKATO(filterdOkato)
        {
            ProjectFilter.clearTerritory();
            console.log("colorRegion 14");
            YandexMap.colorRegion([],this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
            this.get('filtersService').trigger('updateIndicatorRanges');
            
            this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkato',filterdOkato);
            console.log(filterdOkato);  
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=address-classifier&format=jstree&remove_parent=1&name='+filterdOkato});
    
        },
        clearFilterOkato()
        {
            ProjectFilter.clearTerritory();
            ProjectFilter.dropNeighbors();
            ProjectFilter.clearScope();

            console.log("colorRegion 15");
            YandexMap.colorRegion([],this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl(),'o',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('o', 'gos'),'gos',this.get('counters'));
            YandexMap.placeObjects(ProjectFilter.createFilterUrl('p'),'p',this.get('counters'));
            this.get('filtersService').trigger('updateIndicatorRanges');
            
            this.get('jstreeActionReceiver').send('deselectAll');
            this.set('filterdOkato',"");
            this.set( 'data',{'url':(new Api()).getHost() + '/api/classificator?collection=address-classifier&format=jstree&remove_parent=1'});

            var t=ProjectFilter.get('t');
            var t_n=ProjectFilter.get('t_n');
            this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
            this.get('counters').trigger('setRegionscount',t.length + t_n.length);
        }
        
    },
    selectTerritory(osmid) {
        console.log("map-territory selectTerritory", osmid);
        let node = this.treeData.find(function(item){
            return item.osmid == osmid;
        });
        if(node) {
            this.get('jstreeActionReceiver').send('selectNode', node.id);
        }
    },
    deselectTerritory(osmid) {
        console.log("map-territory deselectTerritory", osmid);
        let node = this.treeData.find(function(item){
            return item.osmid == osmid;
        });
        if(node) {
            this.get('jstreeActionReceiver').send('deselectNode', node.id);
        }
    },
    loadTerritory(osmid) {
        this.loadOsmid = osmid;
        if(this.treeLoaded) {
            //console.log("this.treeDataStructure", this.treeDataStructure);
            console.log("this.treeData", this.treeData);
            let node = this.treeData.find(function(item){
                return item.osmid == osmid;
            });

            if(node) {
                this.get('jstreeActionReceiver').send('selectNode', node.id);

                //console.log("node to select", node);
                if(node.level === 3) {
                    this.get('jstreeActionReceiver').send('openNode', node.id);
                    // let regions = this.treeData.filter(function(item){
                    //     return item.parent == node.id;
                    // });
                    // for(let region of regions) {
                    //     //this.get('jstreeActionReceiver').send('selectNode', region.id);
                    // }
                    //console.log("regions", regions);
                }

            }
        }
        //console.log("load  territory filter", filter);
    },
    loadFilter(filter) {

        this.set('preventEvents', true);
        this.get('jstreeActionReceiver').send('deselectAll');
        this.get('jstreeActionReceiver').send('closeAll');
        if(filter.territory && filter.territory.treeItems) {

            console.log("data", this.get("data"));

            for(let node of filter.territory.treeItems) {
                this.get('jstreeActionReceiver').send('getNode', node.id);
            }

            setTimeout(() => {
                for (let node of filter.territory.treeItems) {
                    this.get('jstreeActionReceiver').send('selectNode', node.id);
                }
            }, 100);

            setTimeout(() => {
                //ставим значение наоборот, а потом вызываем чек
                this.set("neighbors", filter.territory.neighbors ? false : true);
                this.actions.checkNeighbors.apply(this, ['onoffswitch-neghbors']);

            }, 300);

        }

        if(filter.territory && filter.territory.indicators) {
            for (let indicator of filter.territory.indicators) {
                ProjectFilter.addIndicator(indicator);
            }
        }
        if(filter.territory && filter.territory.rangedIndicator) {
            ProjectFilter.set('rangedIndicator', filter.territory.rangedIndicator);
            this.get("counters").trigger('setMapGradientName', filter.territory.rangedIndicator.name);
        }

        var i=ProjectFilter.get('i');
        this.get('counters').trigger('changeCounters',{name:'countindicators',value:i.length});

        setTimeout(() => {

            var t=ProjectFilter.get('t');


            var FilterUrl=ProjectFilter.createTerritoryByIndicatorsUrl();
            if(FilterUrl || ProjectFilter.get('rangedIndicator')) {
                Ember.$.post((new Api()).getHost() + '/api/objects', {query: '?type_=territory&' + FilterUrl}).then(data => {
                    ProjectFilter.setScope(data);
                    console.log("colorRegion 16");
                    YandexMap.colorRegion(t, this.get('counters'));
                    this.get('filtersService').trigger('updateIndicatorRanges');
                });
            }
            else {
                console.log("colorRegion 17");
                YandexMap.colorRegion(t, this.get('counters'));
                this.get('filtersService').trigger('updateIndicatorRanges');
            }
            var t_n=ProjectFilter.get('t_n');
            this.get('counters').trigger('changeCounters',{name:'countterritory',value:t.length + t_n.length});
            this.get('counters').trigger('setRegionscount',t.length + t_n.length);
            this.checkNeighborsState();
            this.set('preventEvents', false);
        }, 1000);

        setTimeout(() => {
            //проставляем ползунки индикаторов после паузы - даем загрузиться территориям, чтобы после этого загрузуился список показателей
            this.get('indicatorService').trigger('deselectIndicators');
            this.get('indicatorService').trigger('resetIndicators');

            if(filter.territory && filter.territory.indicators) {
                for (let indicator of filter.territory.indicators) {
                    this.get('indicatorService').trigger('setIndicatorRange', indicator.indicator, indicator.min, indicator.max);
                }
            }
            if(filter.territory && filter.territory.rangedIndicator) {
                this.get('indicatorService').trigger('deselectIndicators');
                this.get('indicatorService').trigger('setRangedIndicator', filter.territory.rangedIndicator);
            }
        }, 3000);

    }
});

