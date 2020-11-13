import Ember from 'ember';
import config from 'map/config';

export default Ember.Object.extend({
    getUserId() {
        if(config && config.userId) {
            return config.userId;
        }
        if (!localStorage.getItem("user")) {
            localStorage.setItem("user", Math.ceil(Math.random() * 100000000));
        }
        return localStorage.getItem("user");
    }
});
