import Ember from 'ember';

const ValuesClass = Ember.Object.extend({
    checkValue(data) {
        if(data==undefined) return "";
        else
        {
            if(data.value!=undefined)
                return data.value;
            else return "";
        }
    },

    checkValueNum(data) {
        if(data==undefined) return "";
        else
        {
            if(data.value_num!=undefined)
                return data.value_num;
            else return "";
        }
    },

    checkCode(data)
    {
        if(data==undefined) return "";
        else {
            if(data.code!=undefined)
                return data.code;
            else return "";
        }

    }


});


let ValuesValidator = ValuesClass.create();

export default ValuesValidator;