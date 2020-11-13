import Eventer from 'map/system/eventer';

export function initialize(application) {
  application.register('object:eventer', Eventer);
}

export default {
  name: 'register-eventer',
  initialize
};
