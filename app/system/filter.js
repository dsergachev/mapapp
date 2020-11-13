import Ember from 'ember';
import MetaSettings from 'map/system/data';
import Api from 'map/api';
import User from 'map/models/user';
import FilterObjectType from 'map/system/object';
import config from 'map/config';
import _ from 'lodash';

const Filter = Ember.Object.extend({
    t: [],
    t_n:[],
    i: [],
    scope: null,
    objectsOkveds:[],
    gosObjectsOkogu:[],
    gosObjectsUrovniUpravleniya:[],
    projectsOkveds:[],
    objectsStatuses:[],
    mapPointsObject:[],
    mapPointsGosObject:[],
    mapPointsProject:[],
    rangedIndicator:null,
    neighbors: 0,
    indicatorYear: 'last',
    prevSavedFilter: null,  //ранее сохраненный фильтр - для проверки, чтобы не слать повторный запрос на сохранение, если сработал лишний триггер
    init() {
        this._super(...arguments);
        this.user = User.create();

    },
    clearAll() {
        this.clearTerritory();
        this.dropNeighbors();
        this.clearIndicators();
        this.clearObjectsOkved();
        this.clearObjectStatus();
        this.clearGosObjectsOkogu();
        this.clearGosObjectsUrovniUpravleniya();
        this.clearProjectsOkved();
        this.dropmapPointsObject();
        this.dropmapPointsGosObject();
        this.dropmapPointsProject();
        this.clearRangedIndicator();
        this.clearScope();
    },
    clearTerritory() {
        this.set('t',[]);
    },
    clearObjectsOkved() {
        this.set('objectsOkveds',[]);
    },
    clearGosObjectsOkogu() {
        this.set('gosObjectsOkogu',[]);
    },
    clearGosObjectsUrovniUpravleniya() {
        this.set('gosObjectsUrovniUpravleniya',[]);
    },
    clearProjectsOkved() {
        this.set('projectsOkveds',[]);
    },
    getSelectedTerritories() {
        let selectedTerritories = [];
        for(let t of this.t) {
            //пока грузим только для регионов
            if(t.original && t.original.level == 4) {
                selectedTerritories.push(t.original.osmid);
            }
        }

        //for(let t_n of this.t_n) {
            //пока грузим только для регионов
            //if(t_n.original && t_n.original.level == 3) {
            //selectedTerritories.push(t_n);
            //}
            //withregionsOSMID=FilterObjectType.getScopeOsmids(withregions);
        let withregions = ProjectFilter.get('neighborItems');
        if(withregions) {
            let withregionsOSMID = FilterObjectType.getScopeOsmids(withregions);
            for (let osmid of withregionsOSMID) {
                selectedTerritories.push(osmid);
            }
        }
        //}
        console.log("selectedTerritories", selectedTerritories);
        return selectedTerritories;
    },
    addTerritory(territory) {
        //чтобы не добавлять дублированные записи, удаляем если такая есть. или if(exists) сделать
        this.removeTerritory(territory);
        this.get('t').pushObject(territory);
    },
    addmapPointObject(point) {
        this.get('mapPointsObject').pushObject(point);
    },
    addmapPointGosObject(point) {
        this.get('mapPointsGosObject').pushObject(point);
    },
    addmapPointProject(point) {
        this.get('mapPointsProject').pushObject(point);
    },
    dropmapPointsObject() {
        this.set('mapPointsObject',[]);
    },
    dropmapPointsGosObject() {
        this.set('mapPointsGosObject',[]);
    },
    dropmapPointsProject() {
        this.set('mapPointsProject',[]);
    },
    addNeighborTerritory(territory) {
        console.log("add neightbor", territory);
        this.get('t_n').pushObject(territory);
        this.set('neighbors', true);
    },
    includeNeighbors() {
        this.set('neighbors', 1);
    },
    dropNeighbors() {
        this.set('t_n',[]);
        this.set('neighborItems', null);
        this.set('neighbors', 0);
    },
    addObjectStatus(status)
    {
        this.get('objectsStatuses').pushObject(status);
    },
    removeObjectStatus(status)
    {
        let obj = this.get('objectsStatuses').findBy('id', status.id);
        this.get('objectsStatuses').removeObject(obj);
        //console.log("this.get('objectsStatuses')", this.get('objectsStatuses'), status);
    },
    clearObjectStatus()
    {
        this.set('objectsStatuses', []);
    },
    removeTerritory(territory)
    {
        this.get('t').removeObject(territory);
    },
    addProjectOkved(okved) {
        this.get('projectsOkveds').pushObject(okved);
    },
    removeProjectOkved(okved)
    {
        let obj = this.get('projectsOkveds').findBy('id', okved.id);
        this.get('projectsOkveds').removeObject(obj);
    },
    addObjectOkved(okved) {
        this.get('objectsOkveds').pushObject(okved);
    },
    removeObjectOkved(okved)
    {
        let obj = this.get('objectsOkveds').findBy('id', okved.id);
        this.get('objectsOkveds').removeObject(obj);
    },
    addGosObjectOkogu(okogu) {
        this.get('gosObjectsOkogu').pushObject(okogu);
    },
    addGosObjectUrovniUpravleniya(urovniUpravleniya) {
        this.get('gosObjectsUrovniUpravleniya').pushObject(urovniUpravleniya);
    },
    removeGosObjectOkogu(okogu)
    {
        let obj = this.get('gosObjectsOkogu').findBy('id', okogu.id);
        this.get('gosObjectsOkogu').removeObject(obj);
    },
    removeGosObjectUrovniUpravleniya(urovniUpravleniya)
    {
        let obj = this.get('gosObjectsUrovniUpravleniya').findBy('id', urovniUpravleniya.id);
        this.get('gosObjectsUrovniUpravleniya').removeObject(obj);
    },
    addIndicator(data)
    {
        //console.log("addIndicator", data);
        this.get('i').pushObject(data);
    },
    removeIndicator(data)
    {
        var elem=this.get('i').findBy('indicator',data.indicator);
        this.get('i').removeObject(elem);
        if(this.get('i').length == 0 && !this.get('rangedIndicator')) {
            this.clearScope();
        }
    },
    findIndicator(data)
    {
        return this.get('i').findBy('indicator',data.indicator);
    },
    setIndicatorYear(year) {
        this.set("indicatorYear", year);
    },
    getIndicatorYear() {
        return this.get("indicatorYear");
    },
    clearIndicators() {
        this.set('i', []);
        this.clearScope();
    },
    setRangedIndicator(data) {
        this.set('rangedIndicator', data);
    },

    clearRangedIndicator() {
        //console.log("clearRangedIndicator");
        this.set('rangedIndicator', null);
        if(this.get('i').length == 0) {
            this.clearScope();
        }
    },
    setScope(data) {
        this.set('scope', data);
    },
    clearScope() {
        //console.log("clearScope");
        this.set('scope', null);
    },
    //пока не надо
    /*createCombifilterUrl() {
        let result = '';
        var t=this.get('t');
        //console.log("original.parent = 890825", t.findBy("original.parent", 890825));
        if(t.length>0) {
            for(let territory of t) {
                if(!t.findBy("original.parent", territory.original.id)) {

                }
            }
        }
    },*/
    createFilterUrl(type='o', filter)
    {
        // ПО АДРЕСАМ
        // Объекты
        var indexes=[];
        var tparam='';
        var indx;
        var code='';

        var okvedId = 0;
        var okvedCode = 0;
        var okoguId = 0;
        var okoguCode = 0;
        var urovniUpravleniyaId = 0;
        var urovniUpravleniyaCode = 0;
        var addressId = 0;
        var addressCode = 0;

        // По окведу
        var okveds=[];
        var okogu=[];

        switch (type) {
            case 'o':
                addressId=MetaSettings.configs.object.address.id;
                addressCode=MetaSettings.configs.object.address.code;
                okvedCode=MetaSettings.configs.object.okved.code;
                okvedId = MetaSettings.configs.object.okved.id;
                okveds=this.get('objectsOkveds');
                tparam = type + '[baseTemplateId]=null|467&';
                if(filter === 'gos') {
                    okogu=this.get('gosObjectsOkogu');
                    okoguCode=MetaSettings.configs.gosObject.okogu.code;
                    okoguId = MetaSettings.configs.gosObject.okogu.id;
                    urovniUpravleniyaCode=MetaSettings.configs.gosObject.urovniUpravleniya.code;
                    urovniUpravleniyaId = MetaSettings.configs.gosObject.urovniUpravleniya.id;
                    tparam = type + '[baseTemplateId]=1605&';
                }
                break;
            case 'p':
                addressId=MetaSettings.configs.project.address.id;
                addressCode=MetaSettings.configs.project.address.code;
                okvedCode=MetaSettings.configs.project.okved.code;
                okvedId = MetaSettings.configs.project.okved.id;
                okveds=this.get('projectsOkveds');
                break;
        }

        var t=this.get('t');
        var t_n=this.get('t_n');
        if(t.length>0)
        {
            tparam += type+'[i]['+addressId+']['+addressCode+']=';
            for(indx=0;indx<t.length;indx++)
            {
                indexes.push(t[indx].id);
            }
            // добавляем в выборку соседние регионы если есть
            if(t_n.length>0)
            {
                for(indx=0;indx<t_n.length;indx++)
                {
                    indexes.push(t_n[indx]);
                }
            }
            tparam += indexes.join('|');
            tparam += '&';
        }
        else {
            tparam += '';
        }
        //  по статусу

        var statuses = [];
        var urovniUpravleniya = [];

        if(type == 'o') {

            if(filter === 'gos') {
                urovniUpravleniya = this.get('gosObjectsUrovniUpravleniya').map(function (item) {
                    return item.id;
                });

                if (urovniUpravleniya && urovniUpravleniya.length > 0) {
                    code = MetaSettings.configs.gosObject.urovniUpravleniya.code;
                    if (code < 23) code = '0' + code;
                    tparam += type + '[i][' + MetaSettings.configs.gosObject.urovniUpravleniya.id + '][' + code + ']=';
                    tparam += urovniUpravleniya.join('|');
                    tparam += '&';
                }

                if(okogu && okogu.length>0)
                {
                    if(okoguCode<23) okoguCode='0'+okoguCode;
                    tparam += type+'[i]['+okoguId+']['+okoguCode+']=';
                    indexes=[];
                    for(indx=0;indx<okogu.length;indx++)
                    {
                        indexes.push(okogu[indx].id);
                    }
                    tparam += indexes.join('|');
                    tparam += '&';
                }
            }
            else {
                statuses = this.get('objectsStatuses').map(function (item) {
                    return item.id;
                });

                //console.log('statuses:');
                //console.log(statuses);

                if (statuses && statuses.length > 0) {
                    code = MetaSettings.configs.object.status.code;
                    if (code < 23) code = '0' + code;
                    tparam += type + '[i][' + MetaSettings.configs.object.status.id + '][' + code + ']=';
                    tparam += statuses.join('|');
                    tparam += '&';
                }

                if(okvedCode<23) okvedCode='0'+okvedCode;

                if(okveds.length>0)
                {
                    tparam += type+'[i]['+okvedId+']['+okvedCode+']=';
                    indexes=[];
                    for(indx=0;indx<okveds.length;indx++)
                    {
                        indexes.push(okveds[indx].id);
                    }
                    tparam += indexes.join('|');
                    tparam += '&';
                }
            }
        }

        if(type == 'p') {
            if(okvedCode<23) okvedCode='0'+okvedCode;

            if(okveds.length>0) {
                tparam += type+'[i]['+okvedId+']['+okvedCode+']=';
                indexes=[];
                for(indx=0;indx<okveds.length;indx++)
                {
                    indexes.push(okveds[indx].id);
                }
                tparam += indexes.join('|');
                tparam += '&';
            }
        }



        //console.log('okveds:');
        //console.log(okveds);



        //tparam=tparam+"&save=0&user=" + this.user.getUserId();

        //если не заданы ни статусы, ни окведы, то передадим status='', чтобы была пустая выборка. Чтобы по умолчанию выводить всм объекты - раскоментировать:
        if(type == 'o') {
            if(filter === 'gos') {
                if (urovniUpravleniya.length == 0 && okogu.length === 0) {
                    tparam = '';
                }
            }
            else {
                if (statuses.length == 0 && okveds.length === 0) {
                    tparam = '';
                }
            }

        }
        if(type === 'p') {
            if (okveds.length === 0) {
                tparam = '';
            }
            else {
                tparam += type+'[public_visible]=accepted';
            }
        }
        //
        return tparam;
    },
    createTerritoryFilterUrl(territoryOSMid,neighbors=false,combifilter = true)
    {
        // ПО АДРЕСАМ
        // Объекты
        //var indexes=[];
        if(territoryOSMid && territoryOSMid.length>0 && territoryOSMid.join) {
            territoryOSMid=territoryOSMid.join('|');
        }
        var tparam=(combifilter?'t[i]':'i') + '['+MetaSettings.configs.territory.osmid.id+']['+MetaSettings.configs.territory.osmid.code+']='+territoryOSMid;
        if(neighbors)
        {
            tparam += '&neighbor=1';
        }

        if(this.get("indicatorYear")) {
            tparam += this.getFilterYear(combifilter);
        }

        return tparam;
    },
    createTerritoryByAddrss(adressesId,prefix='i')
    {
        let result = '';
        if(adressesId) {
            var adressesParams = adressesId.join('|');
            var tparam = prefix + '[' + MetaSettings.configs.territory.address.id + '][' + MetaSettings.configs.territory.address.code + ']=' + adressesParams;
            result += tparam;
        }

        if(this.get("indicatorYear")) {
            result += this.getFilterYear();
        }

        return result;
    },
    getFilterYear(combifilter) {
        let field = 'filterYear';
        if(combifilter) {
            field = 't[filterYear]'
        }
        if(this.get("indicatorYear")) {
            return "&" + field + "[code]="+config.indicators.codes.kalendarnyyGod+"&" + field + "[node_link]=kalendarnyy-god&" + field + "[value]="+this.get("indicatorYear") + "&" + field + "[field]="
                + ((this.get("indicatorYear") === 'last') ? 'options' : 'value');
        }
    },
    createTerritoryByIndicatorsUrl()
    {
        console.log("createTerritoryByIndicatorsUrl year", this.get("indicatorYear"));
        let result = '';
        var indicator=[];
        var i=this.get('i');
        //console.log(i);
        if(i.length>0)
        {
            for(var j=0;j<i.length;j++)
            {
                var param=i[j].param;
                if(param<23) {param="0"+param;}
                indicator.push("i["+i[j].indicator+"]["+param+"][from]="+i[j].min);
                indicator.push("i["+i[j].indicator+"]["+param+"][to]="+i[j].max);
                if(this.get("indicatorYear")) {
                    indicator.push("i["+i[j].indicator+"]["+config.indicators.codes.kalendarnyyGod+"][value]="+this.get("indicatorYear"));
                }

            }
            //indicator.push('save=1');
            indicator.push('user=' + this.user.getUserId());

            result += indicator.join('&');

        }

        if(this.get("indicatorYear")) {
            result += this.getFilterYear();
        }

        return result;
    },
    getBaseUrl()
    {
        //return "/ajax/x?f=test.invstup.com:8888/api/";
        return (new Api()).getHost() + '/api/';
    },
    showRegionInfo(a)
    {
        console.log(a);
    },
    saveFilter() {

        let filter = this.exportFilter();
        let filterJSON = JSON.stringify(filter);
        //console.log("exportFilter", filter);
        if(this.prevSavedFilter === filterJSON) {
            //console.log("filter already saved");
        }
        else {
            /*let params = [];
            params.push('user=' + this.user.getUserId());
            params.push('t=' + filter.t);
            params.push('o=' + filter.o);
            params.push('p=' + filter.p);*/

            if(!this.isLoading()) {

                if(!(filter.t.treeItems.length || filter.o.statuses.length || filter.o.okveds.length || filter.gos.okogu.length || filter.gos.urovniUpravleniya.length)) {
                    //console.log("empty filter");
                    return;
                }

                filter.user = this.user.getUserId();
                Ember.$.ajax({
                    url: (new Api()).getHost() + '/api/filters/add',
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(filter),
                    success: data => {
                        //console.log("filter saved", data);
                    }
                });
            }
        }
        this.prevSavedFilter = filterJSON;

    },
    exportFilter() {
        let result = {
            t: {
                treeItems: [],
                neighbors: this.neighbors,
                indicators: [],
                rangedIndicator: this.rangedIndicator,
                indicatorYear: this.indicatorYear
            },
            o: {
                statuses: [],
                okveds: []
            },
            gos: {
                urovniUpravleniya: [],
                okogu: []
            },
            p: {
                okveds: []
            }
        };

        for(let t of this.t) {
            result.t.treeItems.push({
                "id": t.id,
                "text": t.text
            });
        }

        for(let i of this.get('i')) {
            result.t.indicators.push({
                "indicator": i.indicator,
                "name": i.name,
                "max": i.max,
                "min": i.min,
                "param": i.param
            });
        }

        for(let okved of this.objectsOkveds) {
            result.o.okveds.push({
                "id": okved.id,
                "text": okved.text
            });
        }

        for(let status of this.objectsStatuses) {
            result.o.statuses.push({
                "id": status.id,
                "text": status.text
            });
        }

        for(let urovniUpravleniya of this.gosObjectsUrovniUpravleniya) {
            result.gos.urovniUpravleniya.push({
                "id": urovniUpravleniya.id,
                "text": urovniUpravleniya.text
            });
        }

        for(let okogu of this.gosObjectsOkogu) {
            result.gos.okogu.push({
                "id": okogu.id,
                "text": okogu.text
            });
        }

        for(let okved of this.projectsOkveds) {
            result.p.okveds.push({
                "id": okved.id,
                "text": okved.text
            });
        }

        return result;

    },
    loadFilter(filter) {
        this.set('loading', true);
        setTimeout(() => {
            this.set('loading', false);
            //console.log("loading complete........");
        }, 4000);
        //console.log('system\\filter load filter', filter);
        this.clearAll();
    },
    isLoading() {
        return this.get('loading') === true;
    }

});

let ProjectFilter = Filter.create();

export default ProjectFilter;
