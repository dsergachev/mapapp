import Ember from 'ember';

export function formatNumberTriades(params) {
    let number = params[0];

    if(number) {

        let numberStr = number + '';
        let commaOffset = 0;
        if(numberStr.indexOf('.') !== -1) {
            commaOffset = numberStr.length - numberStr.indexOf('.');
        }
        if(numberStr.indexOf(',') !== -1) {
            commaOffset = numberStr.length - numberStr.indexOf(',');
        }



        let result = '';
        for(let i = 0; i < numberStr.length; i++) {
            result += numberStr[i];
            if((numberStr.length - commaOffset - i - 1) % 3 === 0 && numberStr.length - i - 1 > commaOffset) {
                result += ' ';
            }
        }
        return result;
    }
    return number;
}

export default Ember.Helper.helper(formatNumberTriades);
