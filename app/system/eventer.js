import Ember from 'ember';

let EventerObject = Ember.Component.extend({
    activeMenu: null,
    init() {
        this._super(...arguments);
    },
    setActiveMenu(item) {
        this.activeMenu = item;
        console.log("setActiveMenu", this.getActiveMenu());
    },
    getActiveMenu() {
        return this.activeMenu;
    }

});

let Eventer = EventerObject.create();

export default Eventer;