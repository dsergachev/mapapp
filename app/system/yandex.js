import Ember from 'ember';
import FilterObjectType from 'map/system/object';
import AddressClassifier from 'map/system/address';
import ValuesValidator from 'map/system/values';
import ProjectFilter from 'map/system/filter';
import Eventer from 'map/system/eventer';
import Api from 'map/api';
import config from 'map/config';


let Yandex = Ember.Component.extend({
    init() {
        this._super(...arguments);
        var self = this;
        ymaps.ready(function() {
            self.initEvents.apply(self);
        });
        //var self = this;
        //setTimeout(function() { self.initEvents(); }, 10000);
    },
    initEvents() {
        console.log("MAP init events", this);
        //geoMap.events.add('click', YandexMap.clickMapEvent);
        geoMap.events.add('click', this.clickMapEvent);

        /*geoMap.events.add('contextmenu', function (e) {
         var coords = e.get('coords');
         console.log("right click", coords);
         });*/
    },

    setBounds(currentBounds)
    {
        var bounds=currentBounds;
        geoMap.setBounds(bounds, {
            checkZoomRange: true,
            duration: 500
        });
    },
    updateWidth(blockname, state) {

        //console.log("updateYandexWidth", blockname, state);
        let mapWidth = 500;
        // if(blockname === "main") {
        //     let leftPanelWidth = 0 + $(".js-map-filter").outerWidth();
        //     let rightPanelWidth = 0 + $(".js-imap__main-dashboards").outerWidth();
        //     mapWidth = $(window).width() - leftPanelWidth - rightPanelWidth;
        //
        //     $("#map").offset({left: leftPanelWidth});
        //     $("#map").width(mapWidth + 'px');
        //     $(".map-gradient").offset({left: 10 + leftPanelWidth});
        //     $(".map-gradient").width((mapWidth < 500 ? mapWidth : 500) + 'px');
        //     console.log("redraw map");
        //     if(typeof geoMap !== 'undefined') {
        //         geoMap.container.fitToViewport();
        //     }
        // }
        // else {
            let leftPanelWidth = 0 + $(".js-map-filter").outerWidth() +
                $(".js-map-filter_box:visible").outerWidth() +
                $(".map-filter-result:visible").outerWidth();
            let rightPanelWidth = 0 + $(".js-imap__main-dashboards:visible").outerWidth();
            mapWidth = $(window).width() - leftPanelWidth - rightPanelWidth;
            //console.log("setMapWidth", mapWidth);

            $("#map").offset({left: leftPanelWidth});
            $("#map").width(mapWidth + 'px');

            $(".map-gradient").offset({left: 10 + leftPanelWidth});
            $(".map-gradient").width((mapWidth < 500 ? mapWidth : 500) + 'px');
        //}

        if(this.width !== mapWidth) {
            console.log("redraw map");
            if(typeof geoMap !== 'undefined') {
                geoMap.container.fitToViewport();
            }
        }
        this.width = mapWidth;


    },
    showRegionInformation(regionId)
    {
        console.log("RRR:"+regionId);
    },

    getPositionByAddress(address)
    {
        Ember.$.getJSON('//geocode-maps.yandex.ru/1.x/?format=json&geocode='+address).then(data => {

            return data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;

        });
    },
    getAddressByIds(ids)
    {
        var idsString=ids.join('|');
        Ember.$.getJSON((new Api()).getHost() + '/api/classificator?collection=address-classifier&id='+idsString).then(data => {

            return data;

        });
    },
    placeObjectsDots(objects,event=false)
    {
        var i=0;
        ProjectFilter.dropmapPointsObject();
        if(event!==false){ event.trigger('clearObjects');}
        console.log("Place OBJECTS on map");
        console.log(objects);
        

        
        if (regions) {


            // geoMap.geoObjects.remove(dots);

            //var dots = ProjectFilter.get('mapPoints');
            var dots = [];

            let dotObjects = [];
            geoMap.geoObjects.each(function (obj) {
                if (obj.properties && obj.properties.get('type') === 'object') {
                    dotObjects.push(obj);
                }
                if(obj.type === 'object_clusterer') {
                    dotObjects.push(obj);
                }
            });
            for(let obj of dotObjects) {
                geoMap.geoObjects.remove(obj);
            }

            /*geoMap.geoObjects.each(function (obj) {
                if(obj.properties.get('type')==='dot') {geoMap.geoObjects.remove(obj);}
            });
            */

            if (objects.length > 0)
            {

                for (i = 0; i < objects.length; i++)
                {
                    //console.log('object=========');
                    //console.log(objects[i]);
                    //console.log('object<<<<<<<<<');

                    var indicators=objects[i].indicators;

                    var Name=FilterObjectType.findAttributeByName(indicators,'Название объекта');
                    var Address=FilterObjectType.findAttributeByName(indicators,'Основной адрес');
                    var Status=FilterObjectType.findAttributeByName(indicators,'Состояние объектов');
                    var Okved=FilterObjectType.findAttributeByName(indicators,'ОКВЭД');
                    var Founddate=FilterObjectType.findAttributeByName(indicators,'Дата основания');
                    var Contacts=FilterObjectType.findAttributeByName(indicators,'Контактные лица');
                    var Personals=FilterObjectType.findAttributeByName(indicators,'Численность персонала');
                    var Values=FilterObjectType.findAttributeByName(indicators,'Объемы');
                    var Product=FilterObjectType.findAttributeByName(indicators,'Основная продукция');
                    var Chief=FilterObjectType.findAttributeByName(indicators,'Руководитель предприятия');
                    var Actual=FilterObjectType.findAttributeByName(indicators,'Дата/Время создания объекта');
                    var Coordinates= FilterObjectType.findAttributeByName(indicators,'Координаты объекта');

                    var coorditanes=[];
                    if(Coordinates && Coordinates.value) {
                        coorditanes = Coordinates.value.split(',');
                    }
                    else {
                        continue;
                    }
                    if(!Address.value) {
                        continue;
                    }
                    var AddressLine=AddressClassifier.findFullAddress(Address.value);

                    if(event!==false)
                    {
                        event.trigger('addObject',{
                            'id': objects[i].id,
                            'Name':ValuesValidator.checkValue(Name),
                            'Address':AddressLine,
                            'Status':ValuesValidator.checkValue(Status),
                            'Okved':ValuesValidator.checkValue(Okved),
                            'Founddate':ValuesValidator.checkValue(Founddate),
                            'Contacts':ValuesValidator.checkValue(Contacts),
                            'Personals':ValuesValidator.checkValue(Personals),
                            'Values':ValuesValidator.checkValue(Values),
                            'Product':ValuesValidator.checkValue(Product),
                            'Chief':ValuesValidator.checkValue(Chief),
                            'Actual':ValuesValidator.checkValue(Actual),
                            'Coordinates':ValuesValidator.checkValue(Coordinates)

                        });
                    }

                    //console.log(Name);
                    //console.log(Address);
                    //console.log(Status);

                    //console.log('Point:' + Name.value + " " +AddressLine);

                    var preset='';

                    if(Status!==undefined)
                    {

                        switch(Status.value)
                        {
                            case 'Проектируемый':{preset='islands#blueStretchyIcon';break;}
                            case 'Строящийся':{preset='islands#yellowStretchyIcon';break;}
                            case 'Действующий':{preset='islands#greenStretchyIcon';break;}
                            default:{preset='islands#brownStretchyIcon';}
                        }
                    }

                    var myPlacemark = new ymaps.Placemark([parseFloat(coorditanes[1]), parseFloat(coorditanes[0])], {
                        name: ValuesValidator.checkValue(Name),
                        clusterCaption: ValuesValidator.checkValue(Name),
                        balloonContent: [
                            " <div class='project-card-item'>",
                            "  <div class='project-card_inner'>",
                            "    <div class='project-card-item__head' style='text-align:center;background-color:#f0f0f0;'>",
                            "      <i class='fa fa-industry' aria-hidden='true'></i>",
                            "      <h3>"+ValuesValidator.checkValue(Name)+"</h3>",
                            "      <span>"+AddressLine+"</span>",
                            "    </div>        ",
                            "  </div>  ",
                            "  <div class='project-card-item__inner'> ", 
                            "  <div class='project-card-item__inner-prop' style='text-align:center;'>",
                            "    <div>Оквэд</div>",
                            "    <p style='color:#008db1'>"+ValuesValidator.checkValue(Okved)+"</p>",
                            "    <span>Вид деятельности</span>",
                            "  </div> ",
                            "    <ul class='project-card-item__inner-list'>",
                            "      <li>",
                            "        <span><i class='fa fa-birthday-cake' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Founddate)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Дата основания</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-black-tie' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Chief)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Руководитель</span>",
                            "     </li>",
                            "      <li>",
                            "        <span><i class='fa fa-male' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Personals)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Численность персонала</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-list-ul' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Product)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Основная продукция</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-phone' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Contacts)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Контактные лица</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-tint' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Values)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Объемы производства</span>",
                            "      </li>",
                            "    </ul>",
                            "  </div>",
                            "  <div class='project-card-item__bottom'>",
                            "    <div class='text-center'>",
                            "        Дата актуальности анкеты",
                            "        <span>"+ValuesValidator.checkValue(Actual)+"</span>",
                            "    </div>",
                            "  </div>",
                            "  </div>",
                            "</div>",
                        ].join(''),
                        type:'object'
                    }, {
                        preset: preset,
                        balloonMinWidth: 350,
                        balloonMinHeight: 300,
                        balloonMaxHeight: 700
                    });


                    dots.push(myPlacemark);

                    ProjectFilter.addmapPointObject(myPlacemark);

                    myPlacemark.balloon.events.add('open', e => {
                        console.log("opened baloon!");
                        YandexMap.cutCardText();
                    });


                }

                ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
                    console.log("PieChartClusterer loaded");
                    let clusterer = new PieChartClusterer({
                        clusterDisableClickZoom: true,
                        clusterBalloonSidebarWidth: 100,
                        clusterBalloonWidth: 550,
                        clusterBalloonHeight: 500,
                        clusterBalloonContentLayoutHeight: 500
                    });
                    clusterer.add(dots);
                    clusterer.type = "object_clusterer";
                    geoMap.geoObjects.add(clusterer);
                    ProjectFilter.object_clusterer = clusterer;

                    clusterer.balloon.events.add('open', e => {
                        var clusterPlacemark = e.get('cluster');
                        console.log("opened cluster!");
                        YandexMap.cutCardText();

                        if(!clusterPlacemark.activeObjectMonitor) {
                            clusterPlacemark.activeObjectMonitor = new ymaps.Monitor(clusterPlacemark.state);

                            clusterPlacemark.activeObjectMonitor.add('activeObject', function () {
                                var objectId = clusterPlacemark.activeObjectMonitor.get('activeObject');
                                console.log("monitor activeObject", objectId);
                                setTimeout(function () {
                                    YandexMap.cutCardText();
                                }, 10)

                            });
                        }
                        else {
                            console.log("monitor exists");
                        }
                    });
                });


            }
        }

        if(event!==false&&objects!==undefined)
        {
            //event.trigger('changeCounters',{name:'countobjects',value:objects.length});
            event.trigger('changeCounters',{name:'countobjects',value: ProjectFilter.mapPointsObject.length});
        }
    },
    placeGosObjectsDots(objects,event=false)
    {
        var i=0;
        ProjectFilter.dropmapPointsGosObject();
        if(event!==false){ event.trigger('clearGosObjects');}
        console.log("Place GOS OBJECTS on map");
        console.log(objects);

        // if(event!==false&&objects!==undefined) {
        //     event.trigger('changeCounters',{name:'countgosobjects',value:objects.length});
        // }

        if (regions) {


            // geoMap.geoObjects.remove(dots);

            //var dots = ProjectFilter.get('mapPoints');
            var dots = [];

            let dotObjects = [];
            geoMap.geoObjects.each(function (obj) {
                if (obj.properties && obj.properties.get('type') === 'gos_object') {
                    dotObjects.push(obj);
                }
                if(obj.type === 'gos_object_clusterer') {
                    dotObjects.push(obj);
                }
            });
            for(let obj of dotObjects) {
                geoMap.geoObjects.remove(obj);
            }

            /*geoMap.geoObjects.each(function (obj) {
             if(obj.properties.get('type')==='dot') {geoMap.geoObjects.remove(obj);}
             });
             */



            if (objects.length > 0)
            {

                for (i = 0; i < objects.length; i++)
                {
                    //console.log('object=========');
                    //console.log(objects[i]);
                    //console.log('object<<<<<<<<<');

                    var indicators=objects[i].indicators;

                    var Name=FilterObjectType.findAttributeByName(indicators,'Название объекта');
                    var Address=FilterObjectType.findAttributeByName(indicators,'Основной адрес');
                    var UrovniUpravleniya=FilterObjectType.findAttributeByName(indicators,'Уровни управления');
                    var Okogu=FilterObjectType.findAttributeByName(indicators,'ОКОГУ');
                    var LegalName=FilterObjectType.findAttributeByName(indicators,'Название юридического лица');
                    var LegalName2=FilterObjectType.findAttributeByName(indicators,'Организационно-правовая форма');
                    var Chief=FilterObjectType.findAttributeByName(indicators,'Руководитель предприятия');
                    var Email= FilterObjectType.findAttributeByName(indicators,'Электронная почта');
                    var Phone= FilterObjectType.findAttributeByName(indicators,'Контактный телефон');
                    var Site= FilterObjectType.findAttributeByName(indicators,'Ссылка на сайт');
                    var Coordinates= FilterObjectType.findAttributeByName(indicators,'Координаты объекта');

                    //Юрлицо бывает в поле организационно-правовая форма, а бывает в Юрлице
                    var LegalNameStr = ValuesValidator.checkValue(LegalName);
                    if(!LegalNameStr) {
                        LegalNameStr = ValuesValidator.checkValue(LegalName2);
                    }

                    var coorditanes=[];
                    if(Coordinates && Coordinates.value) {
                        coorditanes = Coordinates.value.split(',');
                    }
                    else {
                        continue;
                    }
                    if(!Address.value) {
                        continue;
                    }
                    var AddressLine=AddressClassifier.findFullAddress(Address.value);

                    if(event!==false)
                    {
                        event.trigger('addGosObject',{
                            'id': objects[i].id,
                            'Name':ValuesValidator.checkValue(Name),
                            'Address':AddressLine,
                            'UrovniUpravleniya':ValuesValidator.checkValue(UrovniUpravleniya),
                            'Okogu':ValuesValidator.checkValue(Okogu),
                            'LegalName':LegalNameStr,
                            'Chief':ValuesValidator.checkValue(Chief),
                            'Phone': ValuesValidator.checkValue(Phone),
                            'Coordinates':ValuesValidator.checkValue(Coordinates)

                        });
                    }

                    //console.log(Name);
                    //console.log(Address);
                    //console.log(Status);

                    //console.log('Point:' + Name.value + " " +AddressLine);

                    var preset='';

                    if(UrovniUpravleniya!==undefined)
                    {

                        switch(UrovniUpravleniya.value)
                        {
                            case 'Федеральный':{preset='islands#darkBlueStretchyIcon';break;}
                            case 'Региональный':{preset='islands#redStretchyIcon';break;}
                            case 'Местный':{preset='islands#darkGreenStretchyIcon';break;}
                            default:{preset='islands#brownStretchyIcon';}
                        }
                    }

                    var myPlacemark = new ymaps.Placemark([parseFloat(coorditanes[1]), parseFloat(coorditanes[0])], {
                        name: ValuesValidator.checkValue(Name),
                        clusterCaption: ValuesValidator.checkValue(Name),
                        balloonContent: [
                            " <div class='project-card-item'>",
                            "  <div class='project-card_inner'>",
                            "    <div class='project-card-item__head' style='text-align:center;background-color:#f0f0f0;'>",
                            "      <i class='fa fa-industry' aria-hidden='true'></i>",
                            "      <h3>"+ValuesValidator.checkValue(Name)+"</h3>",
                            "      <span>"+AddressLine+"</span>",
                            "    </div>        ",
                            "  </div>  ",
                            "  <div class='project-card-item__inner'> ",
                            "  <div class='project-card-item__inner-prop' style='text-align:center;'>",
                            "    <div>Уровни управления</div>",
                            "    <p style='color:#008db1'>"+ValuesValidator.checkValue(UrovniUpravleniya)+"</p>",
                            "  </div> ",
                            "    <ul class='project-card-item__inner-list'>",
                            "      <li>",
                            "        <span><i class='fa fa-university' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Okogu)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>ОКОГУ</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-black-tie' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Chief)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Руководитель</span>",
                            "     </li>",
                            "      <li>",
                            "        <span><i class='fa fa-male' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+LegalNameStr+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Название юридического лица</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-envelope' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Email)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Электронная почта</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-phone' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Phone)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Контактный телефон</span>",
                            "      </li>",
                            "      <li>",
                            "        <span><i class='fa fa-globe' aria-hidden='true'></i></span>",
                            "        <span class='project-card-item__inner-list-name'>"+ValuesValidator.checkValue(Site)+"</span>",
                            "        <span class='project-card-item__inner-list-desc'>Ссылка на сайт</span>",
                            "      </li>",
                            "    </ul>",
                            "  </div>",
                            // "  <div class='project-card-item__bottom'>",
                            // "    <div class='text-center'>",
                            // "        Дата актуальности анкеты",
                            // "        <span>"+ValuesValidator.checkValue(Actual)+"</span>",
                            // "    </div>",
                            // "  </div>",
                            "  </div>",
                            "</div>",
                        ].join(''),
                        type:'gos_object'
                    }, {
                        preset: preset,
                        balloonMinWidth: 350,
                        balloonMinHeight: 300,
                        balloonMaxHeight: 700
                    });


                    dots.push(myPlacemark);

                    ProjectFilter.addmapPointGosObject(myPlacemark);

                    //geoMap.geoObjects.add(myPlacemark);
                    myPlacemark.balloon.events.add('open', e => {
                        console.log("opened baloon!");
                        YandexMap.cutCardText();
                    });

                }

                ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
                    console.log("PieChartClusterer loaded");
                    let clusterer = new PieChartClusterer({
                        clusterDisableClickZoom: true,
                        clusterBalloonSidebarWidth: 100,
                        clusterBalloonWidth: 550,
                        clusterBalloonHeight: 500,
                        clusterBalloonContentLayoutHeight: 500
                    });
                    clusterer.add(dots);
                    clusterer.type = "gos_object_clusterer";
                    geoMap.geoObjects.add(clusterer);
                    ProjectFilter.gos_object_clusterer = clusterer;

                    clusterer.balloon.events.add('open', e => {
                        var clusterPlacemark = e.get('cluster');
                        console.log("opened cluster!");
                        YandexMap.cutCardText();

                        if(!clusterPlacemark.activeObjectMonitor) {
                            clusterPlacemark.activeObjectMonitor = new ymaps.Monitor(clusterPlacemark.state);

                            clusterPlacemark.activeObjectMonitor.add('activeObject', function () {
                                var objectId = clusterPlacemark.activeObjectMonitor.get('activeObject');
                                console.log("monitor activeObject", objectId);
                                setTimeout(function () {
                                    YandexMap.cutCardText();
                                }, 10)

                            });
                        }
                        else {
                            console.log("monitor exists");
                        }
                    });

                    // clusterer.balloon.events.add('close', e => {
                    //     activeObjectMonitor.removeAll();
                    // })
                });


            }
        }
        if(event!==false&&objects!==undefined)
        {
            //event.trigger('changeCounters',{name:'countobjects',value:objects.length});
            event.trigger('changeCounters',{name:'countgosobjects',value: ProjectFilter.mapPointsGosObject.length});
        }
    },
    cutCardText() {
        $(".project-card-item__inner-list-name").dotdotdot({
            ellipsis: '...',
            wrap: 'letter',
            fallbackToLetter: true,
            watch: false,
            callback: function (isTrancated, orgContent) {
                if(isTrancated) {
                    $(this).attr('title', orgContent.text()).tooltip();
                }
                // else {
                //     $(this).tooltip('destroy').removeAttr('title');
                // }
            }
        });
    },
    placeProjectsDots(objects,event=false)
    {
        //return;
        console.log("Place PROJECTS on map!");
        console.log(objects);

        var indicators;
        var Name;
        var Coordinates;

        //фильтруем на пустые
        var result = [];
        for(let object of objects) {
            indicators=object.indicators;
            Name=FilterObjectType.findAttributeByName(indicators,'Название проекта');
            Coordinates= FilterObjectType.findAttributeByName(indicators,'Координаты проекта');
            if(Name && Coordinates) {
                result.push(object);
            }
        }
        objects = result;

        this.set('projects', result);



        //var i=0;
        ProjectFilter.dropmapPointsProject();
        if(event!==false){ event.trigger('clearProjects');}

        // if(event!==false&&objects!==undefined)
        // {
        //     event.trigger('changeCounters',{name:'counttprojects',value:objects.length});
        // }
        if (regions) {


            var dots = [];

            let dotObjects = [];
            geoMap.geoObjects.each(function (obj) {
                if (obj.properties && obj.properties.get('type') === 'project') {
                    dotObjects.push(obj);
                }
                if(obj.type === 'project_clusterer') {
                    dotObjects.push(obj);
                }
            });
            for(let obj of dotObjects) {
                geoMap.geoObjects.remove(obj);
            }

            if (objects.length > 0)
            {

                 //var placemarks = [];
                 for (var i = 0; i < objects.length; i++)
                 {

                     indicators=objects[i].indicators;

                     Name=FilterObjectType.findAttributeByName(indicators,'Название проекта');
                     var Address=FilterObjectType.findAttributeByName(indicators,'Полный адрес проекта');
                     //var Okved=FilterObjectType.findAttributeByName(indicators,'ОКВЭД','Основная экономическая деятельность');
                     var Initial=FilterObjectType.findAttributeByName(indicators,'Инициатор проекта');

                     //var Contacts=FilterObjectType.findAttributeByName(indicators,'Контактные лица');
                     //var Personals=FilterObjectType.findAttributeByName(indicators,'Численность персонала');
                     //var Values=FilterObjectType.findAttributeByName(indicators,'Объемы');
                     //var Product=FilterObjectType.findAttributeByName(indicators,'Основная продукция');
                     //var Chief=FilterObjectType.findAttributeByName(indicators,'Руководитель предприятия');
                     //var Actual=FilterObjectType.findAttributeByName(indicators,'Дата/Время создания объекта');
                     Coordinates= FilterObjectType.findAttributeByName(indicators,'Координаты проекта');
                     var ImageUrl = FilterObjectType.findAttributeByName(indicators,'Изображение');

                     var Okved = FilterObjectType.getIndicatorsPropertyByNodelink(indicators, 'okved');
                     var ProjectPaybackPeriodUnit = FilterObjectType.getIndicatorPropertyByCode(indicators, 'project-payback-period-unit');
                     var ProjectPaybackPeriodAmount = FilterObjectType.getIndicatorPropertyByCode(indicators, 'project-payback-period-amount');
                     var ProjectInvestmentsUnit = FilterObjectType.getIndicatorPropertyByCode(indicators, 'project-investments-unit');
                     var ProjectInvestmentsAmount = FilterObjectType.getIndicatorPropertyByCode(indicators, 'project-investments-amount');

                     let ProjectPaybackPeriodAmountVal = ValuesValidator.checkValueNum(ProjectPaybackPeriodAmount);
                     let ProjectPaybackPeriodUnitVal = ValuesValidator.checkValue(ProjectPaybackPeriodUnit);
                     let ProjectInvestmentsAmountVal = ValuesValidator.checkValueNum(ProjectInvestmentsAmount);
                     let ProjectInvestmentsUnitVal = ValuesValidator.checkValue(ProjectInvestmentsUnit);

                     if(ProjectInvestmentsAmountVal === '') {
                         ProjectInvestmentsAmount=FilterObjectType.findAttributeByName(indicators, 'Число', 'IC (Invested Capital) -  Начальная инвестиция');
                         ProjectInvestmentsAmountVal=ValuesValidator.checkValueNum(ProjectInvestmentsAmount);
                         console.log("ProjectInvestmentsAmount", ProjectInvestmentsAmount);
                         if(ProjectInvestmentsAmountVal !== '') {
                             ProjectInvestmentsUnitVal = 'руб';
                         }
                     }

                     if(ProjectPaybackPeriodAmountVal === '') {
                         ProjectPaybackPeriodAmount=FilterObjectType.findAttributeByName(indicators, 'Число', 'PBP (Pay-Back Period)  - Период окупаемости проекта');
                         ProjectPaybackPeriodAmountVal=ValuesValidator.checkValueNum(ProjectPaybackPeriodAmount);
                         console.log("ProjectPaybackPeriodAmount", ProjectPaybackPeriodAmount);
                         ProjectPaybackPeriodUnitVal='Месяцев';
                     }

                     var Founddate=FilterObjectType.getIndicatorPropertyByCode(indicators,'project-start-date');

                     console.log("оквэд", Okved);

                     if(Coordinates===undefined) {continue;} // без координат совсем беда

                     var coorditanes=[];
                     if(Coordinates && Coordinates.value) {
                         coorditanes = Coordinates.value.split(',');
                     }
                     else {
                         continue;
                     }
                     //if(!Address.value)
                     //    continue;

                     //var AddressLine=AddressClassifier.findFullAddress(Address.value);

                     if(event!==false)
                     {
                         let project = {
                             'Name':ValuesValidator.checkValue(Name),
                             'Address':ValuesValidator.checkValue(Address),
                             'Okved':ValuesValidator.checkValue(Okved),
                             'OkvedCode':ValuesValidator.checkCode(Okved),
                             'ProjectPaybackPeriodAmount':ValuesValidator.checkValue(ProjectPaybackPeriodAmount),
                             'ProjectPaybackPeriodUnit':FilterObjectType.formatWordNumber(ValuesValidator.checkValue(ProjectPaybackPeriodAmount), ValuesValidator.checkValue(ProjectPaybackPeriodUnit)),
                             'ProjectInvestmentsAmount':FilterObjectType.formatNumber(ProjectInvestmentsAmountVal),
                             'ProjectInvestmentsUnit':ProjectInvestmentsUnitVal.toLowerCase(),
                             'Coordinates':ValuesValidator.checkValue(Coordinates)
                         };
                         event.trigger('addProject',project);
                     }
                     var preset='islands#brownFactoryIcon';
                     preset = 'islands#brownDotIcon';

                     //var counter=0;

                     var myPlacemark = new ymaps.Placemark([parseFloat(coorditanes[1]), parseFloat(coorditanes[0])], {
                         name: ValuesValidator.checkValue(Name),
                         clusterCaption: ValuesValidator.checkValue(Name),
                         balloonContent: [
                         '<div class="project-card-item" style="width: 100%;">',
                         '<div class="project-card_inner">',
                     '<div class="project-card-item__head">',
                     '<div class="project-card-item__head-fav pull-left"><i class="fa fa-star-o" aria-hidden="true"></i></div>',
                     '<div class="project-card-item__head-date text-center"><i class="fa fa-calendar-check-o" aria-hidden="true"></i>'+ValuesValidator.checkValue(Founddate)+'</div>',
                 //'<div class="project-card-item__head-view pull-right"><i class="fa fa-eye" aria-hidden="true"></i>5</div>',
                     '</div>',
                     '<div class="project-card-item__img">',
                     '<div class="project-card-item__image" style="background-image: url(\''+config.nodejs.proto + config.nodejs.host + ValuesValidator.checkValue(ImageUrl)+'\')"></div>',
                     '<div class="project-card-item__cover">',
                     '<h3><a target="blank" href="' + config.nodejs.proto + config.nodejs.host + '/site/project?id='+objects[i].id+'" >'+ValuesValidator.checkValue(Name)+'</a></h3>',
                 '<span class="project-card-item__cover-marker">',
                     '<i class="fa fa-map-marker"></i>' + ValuesValidator.checkValue(Address),
                 '</span>',
                 '</div>',
                 '</div>',
                 '<div class="project-card-item__inner">',
                     '<ul class="project-card-item__inner-list">',
                     '<li>',
                     '<span><i class="fa fa-qrcode" aria-hidden="true"></i></span>',
                     '<span class="project-card-item__inner-list-name" title="'+ValuesValidator.checkValue(Okved)+'">'+ValuesValidator.checkCode(Okved)+'</span>',
                     '<span class="project-card-item__inner-list-desc">Код <br>ОКВЭД</span>',
                     '</li>',
                     '<li>',
                     '<span><i class="fa fa-university" aria-hidden="true"></i></span>',
                     '<span class="project-card-item__inner-list-name">'+ValuesValidator.checkValue(Initial)+'</span>',
                '<span class="project-card-item__inner-list-desc">Инициатор <br>проекта</span>',
                     '</li>',
                     '<li>',
                     '<span><i class="fa fa-history" aria-hidden="true"></i></span>',
                     '<span class="project-card-item__inner-list-name">'+ProjectPaybackPeriodAmountVal+ ' ' + FilterObjectType.formatWordNumber(ProjectPaybackPeriodAmountVal, ProjectPaybackPeriodUnitVal) +'</span>',
                     '<span class="project-card-item__inner-list-desc">Срок <br>окупаемости</span>',
                     '</li>',
                     '</ul>',
                     '<div class="project-card-item__inner-invest"><i class="fa fa-database" aria-hidden="true"></i> ',
                     '<span>'+FilterObjectType.formatNumber(ProjectInvestmentsAmountVal)+ ' ' + ProjectInvestmentsUnitVal.toLowerCase()+'</span>',
                 '<p class="project-card-item__inner-invest-desc">Сумма инвестиций</p>',
                 '</div>',
                 '<div class="project-card-item__inner-control">',
                     '<div class="project-card-item__inner-control-id pull-left">ID '+objects[i].id+'</div>',
                 '<div class="project-card-item__inner-button">',
                     '<a class="btn btn-exsmall btn-siel" target="blank" href="' + config.nodejs.proto + config.nodejs.host + '/site/project?id='+objects[i].id+'" role="button">Подробно</a>',
                     '</div>',
                     //'<div class="project-card-item__inner-control-share pull-right"><i class="fa fa-share-alt" aria-hidden="true"></i>Поделиться</div>',
                     '</div>',
                     '</div>',
                     '<div class="project-card-item__bottom">',
                     //'<div class="pull-left">',
                     //'<i class="fa fa-user" aria-hidden="true"></i>Admin</div>',
                     //'<div class="pull-right">',
                     //'Статус проекта',
                     //'</div>',
                 '</div>',
                 '</div>',
                 '</div>'

                         ].join(''),
                         type:'project',


                     }, {
                         preset: preset,
                         balloonMinWidth: 350,
                         balloonMinHeight: 300,
                         balloonMaxHeight: 700
                     });
                     //dots.push(myPlacemark);

                     dots.push(myPlacemark);

                     ProjectFilter.addmapPointProject(myPlacemark);

                     myPlacemark.balloon.events.add('open', e => {
                         console.log("opened baloon!");
                         YandexMap.cutCardText();
                     });

                 }

                ymaps.modules.require(['PieChartClusterer'], function (PieChartClusterer) {
                    console.log("PieChartClusterer loaded");
                    let clusterer = new PieChartClusterer({
                        clusterDisableClickZoom: true,
                        clusterBalloonSidebarWidth: 100,
                        clusterBalloonWidth: 550,
                        clusterBalloonHeight: 500,
                        clusterBalloonContentLayoutHeight: 500
                    });
                    clusterer.add(dots);
                    clusterer.type = "project_clusterer";
                    geoMap.geoObjects.add(clusterer);
                    ProjectFilter.project_clusterer = clusterer;

                    clusterer.balloon.events.add('open', e => {
                        var clusterPlacemark = e.get('cluster');
                        console.log("opened cluster!");
                        YandexMap.cutCardText();

                        if(!clusterPlacemark.activeObjectMonitor) {
                            clusterPlacemark.activeObjectMonitor = new ymaps.Monitor(clusterPlacemark.state);

                            clusterPlacemark.activeObjectMonitor.add('activeObject', function () {
                                var objectId = clusterPlacemark.activeObjectMonitor.get('activeObject');
                                console.log("monitor activeObject", objectId);
                                setTimeout(function () {
                                    YandexMap.cutCardText();
                                }, 10)

                            });
                        }
                        else {
                            console.log("monitor exists");
                        }
                    });
                });

            }
        }
        if(event!==false&&objects!==undefined)
        {
            event.trigger('changeCounters',{name:'counttprojects',value:ProjectFilter.mapPointsProject.length});
        }
    },
    placeObjects(query,type,event,skipEvents)
    {
        //console.log(url);
        Ember.$.post((new Api()).getHost() + '/api/combifilter', {query: query}).then(data => {
            console.log(data);

                switch (type) {
                    case 'o': {
                        this.placeObjectsDots(data.object, event);
                        break;
                    }
                    case 'gos': {
                        this.placeGosObjectsDots(data.object, event);
                        break;
                    }
                    case 'p': {
                        this.placeProjectsDots(data.project, event);
                        break;
                    }
                }
                // this.colorRegion(ProjectFilter.get('t'));

            });
            ProjectFilter.saveFilter();
        //}
    },
    dropRegionColors()
    {
        console.log('Clear regions colors');
        /*if (regions) {
            regions.each(function (reg) {
                reg.options.set('preset', {
                    fillColor: '#fff',
                    strokeColor: '#ddd',
                    strokeWidth: 0,
                    fillOpacity: 0.5
                });

            });
        }*/
    },
    colorDistrict(data)
    {
        console.log(data);
    },
    colorRegion(data,countersEvent) {
        console.log("colorRegion", data);
        let withregions = ProjectFilter.get('neighborItems');
        let scope = ProjectFilter.get('scope');
        ProjectFilter.saveFilter();

        this.set('countersEvent',countersEvent);
        if(data===undefined)  {return; }

        var gradientByIndicator=ProjectFilter.get('rangedIndicator');
        var valuedOsmids='';
        var rengedValues=[];

        if(gradientByIndicator && scope !== null)
        {
            console.log('gradient By ', gradientByIndicator);
            valuedOsmids=FilterObjectType.findIndicatorsValuesInScope(
                gradientByIndicator.id,
                scope,
                ProjectFilter.getSelectedTerritories(),
                ProjectFilter.getIndicatorYear()
            );
            console.log("valuedOsmids", valuedOsmids);
            rengedValues=FilterObjectType.rangeIndicatorsValues(valuedOsmids);
            console.log(rengedValues);
            countersEvent.trigger('setMapGradient',rengedValues);
        }
        else {
            console.log('no gradient');
            countersEvent.trigger('hideMapGradient');
        }



        var scopeOSMID=[];
        var withregionsOSMID=[];

        //выдергиваем OSMID из scope
        if(scope !== null/*&& scope.length>0*/)
        {
            console.log(scope);

            scopeOSMID=FilterObjectType.getScopeOsmids(scope);
            console.log("OSMIDS:");
            console.log(scopeOSMID);
        }
        if(withregions!==undefined&&withregions!==null&&withregions.length>0)
        {
            withregionsOSMID=FilterObjectType.getScopeOsmids(withregions);
            console.log("withregions:");
            console.log(withregionsOSMID);
        }

        var bx1 = 0;
        var by1 = 0;
        var bx2 = 0;
        var by2 = 0;

        let osmids = [];
        for(let regionData of data) {
            if(regionData && regionData.original && regionData.original.osmid) {
                osmids.push(regionData.original.osmid);
            }
        }

        var loadOsmids = [];

        //ищем какие нужно догрузить районы
        if(this.regionBoundaries && this.regionBoundaries.length) {
            for (let osmid of osmids) {
                if (!this.regionBoundaries[osmid]) {
                    loadOsmids.push(osmid);
                }
            }
            for (let osmid of withregionsOSMID) {
                if (!this.regionBoundaries[osmid]) {
                    loadOsmids.push(osmid);
                }
            }
        }
        else {
            loadOsmids = osmids;
        }

        let allOsmid = osmids.concat(withregionsOSMID);

        console.log('all osmisd', allOsmid);

        //удаляем все территории (фед округа, регионы, районы)
        let territoryObjects = {};
        geoMap.geoObjects.each(function (obj) {
            if(obj.properties) {
                if(obj.properties.get('type') === 'territory') {
                    //territoryObjects.push(obj);
                    territoryObjects[obj.properties.get('osmId')] = obj;
                    //obj.options.set('fillColor', '#222222');
                    //alert(myPolygon.properties.get('fillColor'));
                }
            }
        });


        //this.getListToDelete();

        this.get("loaderEvent").trigger("start");

        console.log("this.ajaxBoundaryQuery", this.ajaxBoundaryQuery);

        if(this.ajaxBoundaryQuery) {
            this.ajaxBoundaryQuery.abort();
        }

        this.ajaxBoundaryQuery = $.ajax({url: (new Api()).getHost() + '/api/boundaries?osmid='+loadOsmids.join(',')});
        this.ajaxBoundaryQuery.then(retdata => {

            if(!this.regionBoundaries) {
                this.regionBoundaries = [];
            }

            //сохраняем JSON границы в кеш
            for(var i=0;i<retdata.length;i++) {
                this.regionBoundaries[retdata[i].osmid] = retdata[i].boundaries.coordinates;
            }

            var myPolygon;

            //сначала рисуем соседние, чтобы не перетирали своим бледным цветом границу выбранного региона
            //если нет индикакторов территорий, то показываем соседнеи регионы бледным
            if(!(scope !== null/*&& scope.length>0*/)) {
                if (data.length === 1 && withregionsOSMID !== undefined) {//только если регион 1 и у него есть соседи
                    for(let osmid of withregionsOSMID) {

                        let properties = config.appearance.territoryColors['neighbor'];

                        /*myPolygon = new ymaps.Polygon(
                            this.regionBoundaries[osmid],
                            {
                                hintContent: '',
                                osmId: osmid,
                                type: 'territory'
                            },
                            properties
                        );

                        // Добавляем многоугольник на карту.
                        geoMap.geoObjects.add(myPolygon);*/




                        //уже есть на карте. не перерисовыем. меняем свойства
                        if(territoryObjects[osmid]) {
                            myPolygon = territoryObjects[osmid];
                            myPolygon.options.set('fillColor', properties.fillColor);
                            myPolygon.options.set('strokeColor', properties.strokeColor);
                            myPolygon.options.set('strokeWidth', properties.strokeWidth);
                            myPolygon.options.set('fillOpacity', properties.fillOpacity);
                        }
                        else {

                            myPolygon = new ymaps.Polygon(
                                this.regionBoundaries[osmid],
                                {
                                    hintContent: '',
                                    osmId: osmid,
                                    type: 'territory'
                                },
                                properties
                            );
                            // Добавляем многоугольник на карту.
                            geoMap.geoObjects.add(myPolygon);
                        }


                        if(myPolygon.geometry) {
                            var mboundsP = myPolygon.geometry.getBounds();
                            var x1p = mboundsP[0][0];
                            var y1p = mboundsP[0][1];
                            var x2p = mboundsP[1][0];
                            var y2p = mboundsP[1][1];

                            if (x1p < bx1 || bx1 === 0) {
                                bx1 = x1p;
                            }
                            if (y1p < by1 || by1 === 0) {
                                by1 = y1p;
                            }
                            if (x2p > bx2 || bx2 === 0) {
                                bx2 = x2p;
                            }
                            if (y2p > by2 || by2 === 0) {
                                by2 = y2p;
                            }
                        }

                    }
                }
            }

            let territories = [];

            for (let territory of data) {
                territories.push(territory);
            }

            if(scope !== null/* && scope.length>0*/) {
                //ищем среди соседних регионов
                for (let osmid of withregionsOSMID) {
                    territories.push({
                        original: {
                            osmid: osmid,
                            level: 4
                        }
                    });
                }
            }

            for (let territoryData of territories) {

                var colorForFill=config.appearance.territoryColors[territoryData.original.level].fillColor;
                var strokeColor=config.appearance.territoryColors[territoryData.original.level].strokeColor;
                var fillOpacity = config.appearance.territoryColors[territoryData.original.level].fillOpacity;
                var strokeWidth = config.appearance.territoryColors[territoryData.original.level].strokeWidth;
                // var inScope=false;

                console.log('!! scopeOSMID', scopeOSMID, 'territoryData.original.osmid', territoryData.original.osmid, 'contains', scopeOSMID.contains(territoryData.original.osmid));

                if(scope !== null/*&& scope.length>0*/) {
                    if(scopeOSMID.contains(territoryData.original.osmid))
                    {
                        if(gradientByIndicator) {
                            if ((rengedValues.max || rengedValues.min)/* && rengedValues.pointvalue !== 0*/) {
                                var OSMIDValue = valuedOsmids.findBy('osmid', territoryData.original.osmid);
                                //var colorShift=(parseFloat(rengedValues.max) - parseFloat(OSMIDValue.value)) / rengedValues.pointvalue;
                                //console.log('colorShift:'+colorShift+" max:"+rengedValues.max+" val:"+OSMIDValue.value);

                                if (parseFloat(OSMIDValue.value) < parseFloat(rengedValues.min) || parseFloat(OSMIDValue.value) > parseFloat(rengedValues.max)) {
                                    colorForFill = config.appearance.territoryColors['disabled'].fillColor;
                                    strokeColor = config.appearance.territoryColors['disabled'].strokeColor;
                                    fillOpacity = config.appearance.territoryColors['disabled'].fillOpacity;
                                    strokeWidth = config.appearance.territoryColors['disabled'].strokeWidth;
                                }
                                else {
                                    let range = parseFloat(rengedValues.max) - parseFloat(rengedValues.min);
                                    if(range > 0) {
                                        fillOpacity = (parseFloat(OSMIDValue.value) - parseFloat(rengedValues.min)) / (range);
                                    }
                                    else {
                                        fillOpacity = 1;
                                    }
                                    console.log("range", range);
                                    console.log("fillOpacity", fillOpacity);
                                    if(fillOpacity > 1) {
                                        fillOpacity = 1;
                                    }
                                    if(fillOpacity < 0) {
                                        fillOpacity = 0;
                                    }
                                    fillOpacity = fillOpacity / 1.5 + 0.1;
                                    console.log("fillOpacity mod", fillOpacity);
                                    colorForFill = config.appearance.territoryColors['gradient'].fillColor;
                                }

                            }
                        }
                        console.log('in scope!');
                    }
                    else
                    {
                        console.log('not in scope!');
                        colorForFill = config.appearance.territoryColors['disabled'].fillColor;
                        strokeColor = config.appearance.territoryColors['disabled'].strokeColor;
                        fillOpacity = config.appearance.territoryColors['disabled'].fillOpacity;
                        strokeWidth = config.appearance.territoryColors['disabled'].strokeWidth;
                    }
                }


                let properties = {
                    fillColor: colorForFill,
                    strokeColor: strokeColor,
                    strokeWidth: strokeWidth,
                    fillOpacity: fillOpacity
                };

                //уже есть на карте. не перерисовыем. меняем свойства
                if(territoryObjects[territoryData.original.osmid]) {
                    myPolygon = territoryObjects[territoryData.original.osmid];
                    myPolygon.options.set('fillColor', properties.fillColor);
                    myPolygon.options.set('strokeColor', properties.strokeColor);
                    myPolygon.options.set('strokeWidth', properties.strokeWidth);
                    myPolygon.options.set('fillOpacity', properties.fillOpacity);
                }
                else {

                    myPolygon = new ymaps.Polygon(
                        this.regionBoundaries[territoryData.original.osmid],
                        {
                            hintContent: '',
                            osmId: territoryData.original.osmid,
                            type: 'territory'
                        },
                        properties
                    );
                    // Добавляем многоугольник на карту.
                    geoMap.geoObjects.add(myPolygon);
                }


                if(myPolygon.geometry) {
                    var mboundsP = myPolygon.geometry.getBounds();
                    var x1p = mboundsP[0][0];
                    var y1p = mboundsP[0][1];
                    var x2p = mboundsP[1][0];
                    var y2p = mboundsP[1][1];

                    if (x1p < bx1 || bx1 === 0) {
                        bx1 = x1p;
                    }
                    if (y1p < by1 || by1 === 0) {
                        by1 = y1p;
                    }
                    if (x2p > bx2 || bx2 === 0) {
                        bx2 = x2p;
                    }
                    if (y2p > by2 || by2 === 0) {
                        by2 = y2p;
                    }
                }
            }
                    // console.log("BOU:" + bx1 + " " + by1 + " " + bx2 + " " + by2);
            if(bx1 !== 0 && by1 !== 0 && bx2 !== 0 && by2 !== 0) {
                this.setBounds([[bx1, by1], [bx2, by2]]);
                console.log("setBounds:" + bx1 + "," + by1 + " " + bx2 + "," + by2);
            }

            console.log("delete regions", territoryObjects);

            for(let key in territoryObjects) {
                //geoMap.geoObjects.remove(territoryObjects[key]);
                if(allOsmid.indexOf(key) === -1) {
                    //если объекта на карте нет среди всех osmid, то удаляем
                    geoMap.geoObjects.remove(territoryObjects[key]);
                    console.log("delete region ", key);
                }
            }
            this.get("loaderEvent").trigger("stop");

        });



        geoMap.geoObjects.events.remove('click', this.clickEvent);
        geoMap.geoObjects.events.add('click', this.clickEvent);


    },
    clickEvent(e) {
        //тут свой scope, поэтому YandexMap.get вместо this.get
        var countersEvent = YandexMap.get("countersEvent");
        var region = e.get('target');
        console.log("CLICK REGION EVENT", region);
        console.log("map click getActiveMenu", Eventer.getActiveMenu());
        if(countersEvent != undefined && region.properties.get('osmId')) {
            //на главной странице при клике по выбранной территории снимает выделение с территории
            if(Eventer.getActiveMenu() === 'main') {
                YandexMap.get('filtersService').trigger('deselectTerritory',region.properties.get('osmId'));
            }
            else {
                countersEvent.trigger('showRegionData',
                    {
                        'region': region.properties.get('osmId'),
                        'x': event.clientX,
                        'y': event.clientY
                    }
                );
            }
        }

    },
    clickMapEvent(e) {
        var coords = e.get('coords');
        //var eType = e.get('type');
        //var ctrlKey = e.get('domEvent').originalEvent.ctrlKey;
        //console.log(e, event, e.get('domEvent'), event.clientX, event.clientY, eType, "ctrl= ", ctrlKey);
        var countersEvent = YandexMap.get("countersEvent");
        //console.log("countersEvent", countersEvent);
        if(countersEvent!=undefined) {
            countersEvent.trigger('showTerritoriesSelect',{
                "x": coords[0].toPrecision(6),
                "y": coords[1].toPrecision(6),
                "clientX": event.clientX,
                "clientY": event.clientY
            });
        }
    },
    setFiltersService(filtersService) {
        this.set("filtersService", filtersService);
    },
    setCountersEvent(countersEvent) {
        this.set("countersEvent", countersEvent);
    },
    setLoaderEvent(loaderEvent) {
        this.set("loaderEvent", loaderEvent);
    }

});

let YandexMap = Yandex.create();

export default YandexMap;