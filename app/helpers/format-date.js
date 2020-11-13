import Ember from 'ember';

export function formatDate(params) {
    let value = params[0];

    if(value) {
        let date = new Date(value);
        let str = date.getDate() + '.' + (('0' + (date.getMonth()+1)).slice(-2))  + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
        return str;
    }
    return '';
}

export default Ember.Helper.helper(formatDate);