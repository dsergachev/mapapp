import Ember from 'ember';

export function conditionStyle(params/*, hash*/) {
  let [arg1, arg2] = params;

  console.log(arg1); // => "hello"
  console.log(arg2); // => "world"
  return 'style=""';
}

export default Ember.Helper.helper(conditionStyle);
