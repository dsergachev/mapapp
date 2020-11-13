import Ember from 'ember';
import FilterObjectType from 'map/system/object';

export function formatNumber(params/*, hash*/) {
  return FilterObjectType.formatNumber(params);
}

export default Ember.Helper.helper(formatNumber);
