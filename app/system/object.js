import Ember from 'ember';

const FilterType = Ember.Object.extend({
    indicators:[],
    findAttributeByName(indicators,propertyName,indicatorName)
    {
        for(var i=0;i<indicators.length;i++)
        {
            if(indicatorName==undefined||indicatorName==indicators[i].name)
            {
                for(var propertyId in indicators[i].properties)
                {
                    if(indicators[i].properties[propertyId].name==propertyName||indicators[i].properties[propertyId].node_link_name==propertyName)
                    {
                        return {id:indicators[i].id,property:propertyId,value:indicators[i].properties[propertyId].value,name:indicators[i].properties[propertyId].name};
                    }
                }
            }
        }
        return false;
    },
    findIndicatorById(indicators,id)
    {
        for(var i=0;i<indicators.length;i++)
        {
            if(id == indicators[i].id)
            {
                return indicators[i];
            }
        }
        return null;
    },
    findIndicatorsById(indicators,id)
    {
        let result = [];
        for(var i=0;i<indicators.length;i++)
        {
            if(id == indicators[i].id)
            {
                result.push(indicators[i]);
            }
        }
        return result;
    },
    getIndicatorPropertyByName(indicator,propertyName)
    {
        for(var propertyId in indicator.properties)
        {
            if(indicator.properties[propertyId].name==propertyName) {
                return {
                    property:propertyId,
                    value:indicator.properties[propertyId].value,
                    value_num:indicator.properties[propertyId].value_num,
                    name:indicator.properties[propertyId].name
                };
            }
        }
        return null;
    },
    getIndicatorPropertyByCode(indicators,code,indicatorName)
    {
        for(var i=0;i<indicators.length;i++) {
            if (indicatorName == undefined || indicatorName == indicators[i].name) {
                for (var propertyId in indicators[i].properties) {
                    if (indicators[i].properties[propertyId].code == code) {
                        return {
                            value: indicators[i].properties[propertyId].value,
                            value_num: indicators[i].properties[propertyId].value_num,
                            name: indicators[i].properties[propertyId].name
                        };
                    }
                }
            }
        }
        return null;
    },
    getIndicatorsPropertyByNodelink(indicators,node_link,indicatorName) {
        for(var i=0;i<indicators.length;i++) {
            if (indicatorName == undefined || indicatorName == indicators[i].name) {
                for (var propertyId in indicators[i].properties) {
                    if (indicators[i].properties[propertyId].node_link == node_link) {
                        return {
                            value: indicators[i].properties[propertyId].value,
                            code: indicators[i].properties[propertyId].code,
                            option: indicators[i].properties[propertyId].option
                        };
                    }
                }
            }
        }
        return null;
    },
    getIndicatorPropertyByNodelink(indicator,node_link) {

        for (var propertyId in indicator.properties) {
            if (indicator.properties[propertyId].node_link == node_link) {
                return {
                    value: indicator.properties[propertyId].value,
                    code: indicator.properties[propertyId].code,
                    options: indicator.properties[propertyId].options
                };
            }
        }
        return null;

    },
    findIndicatorsValuesInScope(indicatorId,scope,selectedTerritories,year)
    {
        var rdata=[];
        console.log('regions in scope:'+scope.length);

        var OSMID='';var VALUE=0;

        for(var i=0;i<scope.length;i++)
        {
            OSMID='';VALUE=0;
            //console.log('scope id:'+scope[i].id);
            var indicators=scope[i].indicators;
            if(indicators==undefined)
            {
                console.log('NO INDICATORS FOUND!');
                continue;
            }
            for(var j=0;j<indicators.length;j++)
            {

                if(indicators[j].name=='OSMID')
                {
                    for(var propertyId in indicators[j].properties)
                    {
                        if(indicators[j].properties[propertyId].name=='OSMID')
                        {
                            OSMID=indicators[j].properties[propertyId].value;
                        }
                    }

                }
                if(indicators[j].id===indicatorId)
                {
                    if(indicators[j].properties!==undefined&&indicators[j].properties[3738]!=undefined)
                    {
                        //ищем значение для года
                        if(year && (indicators[j].properties[2].value === year || indicators[j].properties[2].options === year))
                            VALUE=indicators[j].properties[3738].value;
                    }
                }
            }
            if(OSMID!=='') {
                if(selectedTerritories.indexOf(OSMID) !== -1) {
                    rdata.pushObject({'osmid': OSMID, 'value': VALUE});
                }
            }
        }
        return rdata;
    },
    rangeIndicatorsValues(values)
    {
        var min=0;
        var max=0;
        for(var i=0;i<values.length;i++)
        {
            if(values[i].value!=undefined&&parseFloat(values[i].value)<min||min===0) {min=parseFloat(values[i].value);}
            if(values[i].value!=undefined&&parseFloat(values[i].value)>max) {max=parseFloat(values[i].value);}

        }
        //var pointvalue=parseFloat(max) / colorDimension;
        return {'min':min,'max':max/*,'pointvalue':parseFloat(pointvalue).toFixed(3)*/}

    },
    findMesuredIndicators(indicators,limit)
    {
        var masuredIndicators =[];

        console.log("card indicators", indicators);

        for(var i=0;i<indicators.length;i++)
        {
            if(limit!=undefined&&masuredIndicators.length==limit) continue;
            for(var propertyId in indicators[i].properties)
            {
                if(propertyId=='871') {
                    if(indicators[i].properties[3738].value!=undefined)
                    {
                        indicators[i].properties[3738].value=this.formatNumber(parseFloat(indicators[i].properties[3738].value));
                    }
                    masuredIndicators.push(indicators[i]);
                }
            }

        }
        return masuredIndicators;
    },

    setTerritoryIndicators(indicators) {
        this.set("setTerritoryIndicators", indicators);
    },
    getTerritoryIndicators() {
        return this.get("setTerritoryIndicators");
    },
    getTerritoryIndicatorsForCard(indicatorsValues, limit, year) {
        let result = [];
        let indicators = [];
        if(this.get("setTerritoryIndicators") && this.get("setTerritoryIndicators").length > 0) {

            for(var i = 0; i < this.get("setTerritoryIndicators").length; i++) {
                indicators = indicators.concat(this.get("setTerritoryIndicators")[i].indicators);
            }
        }
        //indicators = indicators.slice(0, limit);


        //console.log("indicators", indicators);
        //console.log("indicatorsValues", indicatorsValues);
        for(let indicatorValue of indicatorsValues) {
            if(indicators.findBy("id", indicatorValue.id)) {
                //добавляем в карточку значения по последнему году
                if(indicatorValue.properties[2] && (indicatorValue.properties[2].value == year || indicatorValue.properties[2].options == year)) {
                    if (indicatorValue.properties && indicatorValue.properties[3738] && indicatorValue.properties[3738].value !== undefined) {
                        indicatorValue.properties[3738].value = this.formatNumber(parseFloat(indicatorValue.properties[3738].value));
                    }
                    result.push(indicatorValue);
                }
            }
            if(result.length >= 5)
                break;
        }

        console.log("result!", result);
        return result;
        //return result;
    },

    getScopeOsmids(scope)
    {
        var osmids=[];
        //console.log('regions in scope:'+scope.length);
        for(var i=0;i<scope.length;i++)
        {
            //console.log('scope id:'+scope.id);
            var indicators=scope[i].indicators;
            if(indicators==undefined)
            {
                //console.log('NO INDICATORS FOUND!');
                continue;
            }
            //console.log('indicators:'+indicators.length);
            var hasOSMID=false;
            for(var j=0;j<indicators.length;j++)
            {

                if(indicators[j].name=='OSMID')
                {
                    hasOSMID=true;
                    var hasOSMIDValue=false;
                    for(var propertyId in indicators[j].properties)
                    {
                        if(indicators[j].properties[propertyId].name=='OSMID')
                        {
                            hasOSMIDValue=true;
                            osmids.push(indicators[j].properties[propertyId].value);
                            //console.log('OSMID:'+indicators[j].properties[propertyId].value);
                        }
                    }
                    //if(!hasOSMIDValue) console.log('NO OSMIDS value!');
                }
            }
            //if(!hasOSMID) console.log('no OSMID!');
        }
        return osmids;
    },
    findRegionInScope(regionOSMid,scope)
    {
        console.log('regions in scope:'+scope.length);
        for(var i=0;i<scope.length;i++)
        {
            var indicators=scope[i].indicators;
            for(var j=0;j<indicators.length;j++)
            {
                if(indicators[j].name=='OSMID')
                {
                    for(var propertyId in indicators[j].properties)
                    {
                        if(indicators[j].properties[propertyId].name=='OSMID'&&indicators[j].properties[propertyId].value==regionOSMid)
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },
    clearDataPath(data)
    {
        var prevalues=[];
        for(var i=0;i<data.length;i++)
        {
            for(var j=0;j<data[i].path.length;j++)
            {
                if(prevalues.contains(data[i].path[j]))
                {
                    data[i].path[j]='';
                }
                else
                {
                    if(j!=data[i].path.length-1)
                    {
                        prevalues.push(data[i].path[j]);
                    }
                }

            }
            for(var j=0;j<data[i].values.length;j++)
            {
                var timeArr=data[i].values[j].Time.split('-');
                data[i].values[j].Time=timeArr[0];
                data[i].values[j].Value=this.formatNumber(data[i].values[j].Value);

            }
        }
        return data;
    },
    formatNumber(value)
    {
        var minus=false;
        if(value<0)
        {
            minus=true;
            value=Math.abs(value);
        }
        var ret='';

        if (value == 0) return value;
        if (value > 0 && value <= 999) {
            value=parseFloat(value);
            ret= value.toFixed(1)+"";
        }
        if (value > 1000 && value <= 999999) {
            value=value / 1000;
            ret= value.toFixed(1)+" тыс";
        }
        if (value >= 1000000 && value <= 999999999) {
            value=value / 1000000;
            ret= value.toFixed(1) +" млн";
        }
        if (value >= 1000000000 && value <= 999999999999) {
            value=value / 1000000000;
            ret= value.toFixed(1) +" млрд";
        }
        if (value >= 1000000000000 && value <= 999999999999999) {
            value=value/1000000000000;
            ret= value.toFixed(1) + " трлн";
        }
        if(minus)
        {
            ret='-'+ret;
        }
        return ret;
    },
    declOfNum(number, titles) {
        //title=declOfNum(N,['арбуз','арбуза','арбузов']);
        let cases = [2, 0, 1, 1, 1, 2];
        let index = (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5];
        if(index >= 0 && index < cases.length)
            return titles[index];
        return '??';
    },
    formatWordNumber(number, word) {
        if(number === '')
            return '';
        let titles = [];

        if(word == 'Месяцев') {
            titles = ['месяц','месяца','месяцев'];
        }

        if(word == 'Лет') {
            titles = ['год','года','лет'];
        }

        if(titles.length > 0)
            return this.declOfNum(number, titles);
        return word;
    },
    decToHex(r,g,b)
    {
        return "#" + this.colorToHex(r) + this.colorToHex(g) + this.colorToHex(b);
    },
    colorToHex(c)
    {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


});

let FilterObjectType = FilterType.create();

export default FilterObjectType;


