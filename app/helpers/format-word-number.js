import Ember from 'ember';
import FilterObjectType from 'map/system/object';

export function formatWordNumber(params) {
  return FilterObjectType.formatWordNumber(params[0], params[1]);
}

export default Ember.Helper.helper(formatNumber);
