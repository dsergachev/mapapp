import Ember from 'ember';
import Api from 'map/api';
import FilterObjectType from 'map/system/object';

export default Ember.Object.extend({
    /*init(data) {
        this._super(...arguments);
        if(data)
            this.data = data;
        console.log("new filter", this.data);
    },
    setData(data) {
        this.data = data;
    },*/
    setParam(key, value) {
        this[key] = value;

    },
    toggleParam(key) {
        this[key] = (this[key] ? 0 : 1);

    },
    save() {
        if(this._id) {
            return Ember.$.getJSON((new Api()).getHost() + '/api/filters/'+ this._id
                +'?ontop=' + (this.ontop?1:0)
                +'&my=' + (this.my?1:0)
            );
        }
        else {
            return new Promise(
                function (resolve, reject) {
                    reject("no data");
                }
            );
        }
    },
    getName: Ember.computed('territory', 'object', 'gos_object', 'project', function() {
        let groups = [];
        if(this.territory) {
            let territoryText = [];
            if(this.territory.treeItems && this.territory.treeItems.length) {
                if(this.territory.treeItems.length === 1) {
                    territoryText.push(this.territory.treeItems[0].text + (this.territory.neighbors ? ' с соседними': ''));
                }
                else {
                    let title = this.territory.treeItems.map(function (item) {
                        if(item)
                            return item.text;
                        else
                            return '';
                    }).join(', ');
                    territoryText.push('<span title="'+title+'">Выбрано: ' + this.territory.treeItems.length + '</span>');
                }

            }
            if(this.territory.indicators && this.territory.indicators.length) {
                let title = this.territory.indicators.map(function (item) {
                    return item.name + ': ' + FilterObjectType.formatNumber(item.min) + ' - ' + FilterObjectType.formatNumber(item.max);
                }).join(', ');
                territoryText.push('<span title="'+title+'">Индикаторы: ' + this.territory.indicators.length + '</span>');
            }
            if(this.territory.rangedIndicator) {
                territoryText.push('<span>Индикатор: ' + this.territory.rangedIndicator.name + '</span>');
            }
            if(this.territory.indicatorYear) {
                territoryText.push('<span>' + ((this.territory.indicatorYear == 'last')?('доступные'):('на ' + this.territory.indicatorYear + ' год')) + '</span>');
            }
            if(territoryText.length) {
                groups.push('Территории: ' + territoryText.join(', '));
            }
        }
        if(this.object) {
            let objectText = [];

            if(this.object.okveds && this.object.okveds.length) {
                let title = this.object.okveds.map(function (item) {
                    return item.text;
                }).join(', ');
                objectText.push('<span title="'+title+'">ОКВЭД: ' + this.object.okveds.length + '</span>');
            }

            if(this.object.statuses && this.object.statuses.length) {
                let title = this.object.statuses.map(function (item) {
                    return item.text;
                }).join(', ');
                objectText.push('<span title="'+title+'">Статусы: ' + this.object.statuses.length + '</span>');
            }

            if(objectText.length) {
                groups.push('Объекты: ' + objectText.join(', '));
            }
        }
        if(this.gos_object) {
            let gosObjectText = [];

            if(this.gos_object.okogu && this.gos_object.okogu.length) {
                let title = this.gos_object.okogu.map(function (item) {
                    return item.text;
                }).join(', ');
                gosObjectText.push('<span title="'+title+'">ОКОГУ: ' + this.gos_object.okogu.length + '</span>');
            }

            if(this.gos_object.urovniUpravleniya && this.gos_object.urovniUpravleniya.length) {
                let title = this.gos_object.urovniUpravleniya.map(function (item) {
                    return item.text;
                }).join(', ');
                gosObjectText.push('<span title="'+title+'">Уровни управления: ' + this.gos_object.urovniUpravleniya.length + '</span>');
            }

            if(gosObjectText.length) {
                groups.push('Участники: ' + gosObjectText.join(', '));
            }
        }
        if(this.project) {
            let projectText = [];

            if(this.project.okveds && this.project.okveds.length) {
                let title = this.project.okveds.map(function (item) {
                    return item.text;
                }).join(', ');
                projectText.push('<span title="'+title+'">ОКВЭД: ' + this.project.okveds.length + '</span>');
            }

            if(projectText.length) {
                groups.push('Проекты: ' + projectText.join(', '));
            }
        }
        //'имя ' + this.get('territory').neighbors;
        return groups.join('; ');
    })
});
