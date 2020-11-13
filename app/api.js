import config from 'map/config';

export default class Api {
    constructor() {
        //this.name = name;
    }

    getHost() {
        return config.nodejs.proto + config.nodejs.host + (config.nodejs.port ? (':' + config.nodejs.port):'');
    }

}