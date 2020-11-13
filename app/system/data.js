import Ember from 'ember';
import Api from 'map/api';

const Settings = Ember.Object.extend({
    init()
    {
        /*Ember.$.getJSON('/ajax/x?f=test.invstup.com:8888/api/indicators/system').then(data => {
         this.set('configs', data);
         });*/
        Ember.$.getJSON((new Api()).getHost() + '/api/indicators/system').then(data => {
            this.set('configs', data);
        });
    }
  
});

let MetaSettings = Settings.create();

export default MetaSettings;