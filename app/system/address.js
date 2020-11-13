import Ember from 'ember';
import Api from 'map/api';

const Address = Ember.Object.extend({
  items:[],  
  init()
  {

      /*Ember.$.getJSON('/ajax/x?f=test.invstup.com:8888/api/classificator&collection=address-classifier&format=jstree&remove_parent=1').then(data => {
          this.set('items', data);
      });*/
      Ember.$.getJSON( (new Api()).getHost() + '/api/classificator?collection=address-classifier&format=jstree&remove_parent=1').then(data => {
          this.set('items', data);
      });
  },
  findFullAddress(addressArray)
  {
      var items=this.get('items');
      var adress=[];
      //if(addressArray) {
          for (var i = 0; i < addressArray.length; i++) {
              for (var j = 0; j < items.length; j++) {
                  if (items[j].id === addressArray[i]) {
                      adress.push(items[j].text);
                      continue;
                  }
              }
          }
      //}
      return adress.join(',');
  }
  
});


let AddressClassifier = Address.create();

export default AddressClassifier;