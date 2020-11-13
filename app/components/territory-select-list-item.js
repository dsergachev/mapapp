import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        selectTerritory: function(territory) {
            this.sendAction('selectTerritory', territory);
        }
    }
});
