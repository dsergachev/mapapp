import Ember from 'ember';
import Helper from 'map/system/helper';

export function formatNumber3(params) {
    let number = params[0];

    if(number) {
        return Helper.formatNumber3(number);
    }
    return number;
}

export default Ember.Helper.helper(formatNumber3);
