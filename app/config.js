//для прода
let config = {};

let restapiUrl = '';


switch(window.location.hostname) {
  case 'investup.ru':
  case 'www.investup.ru':
    //для прода
    restapiUrl = "https://investup.ru/restapi";
    config.nodejs = {
      "proto": "https://",
      "host": "investup.ru",
      "port": null
    };
    config.russiaTargetId = '1390956';

    break;
  case 'test.investup.ru':
  case 'release.investup.ru':
    //для теста
    restapiUrl = "http://restapi.investup.ru";
    config.nodejs = {
      "proto": "http://",
      "host": "test.investup.ru",
      "port": 8888
    };
    config.russiaTargetId = '1390957';
    break;
  default:
    //для локалки
    restapiUrl = "http://restapi.investup.ru";
    config.nodejs = {
      "proto": "http://",
      //"host": "localhost",
      "host": "test.investup.ru",
      "port": 8888
    };
    config.russiaTargetId = '1390957';
    break;
}

config.userId = $("#ember-mapapp").attr("data-user-id");

config.nodejsUrl = config.nodejs.proto + config.nodejs.host + (config.nodejs.port ? (':' + config.nodejs.port) : "") + "/api/";
config.restapi = {
  url: restapiUrl,
  testToken: "invstupRestApiToken"
};
config.appearance = {
  territoryColors: {
    '3': {
      fillColor: '#008db1',
      strokeColor: '#008db1',
      strokeWidth: 2,
      fillOpacity: 0.25
    },
    '4': {
      fillColor: '#ef5350',
      strokeColor: '#ef5350',
      strokeWidth: 2,
      fillOpacity: 0.25
    },
    '5': {
      strokeWidth: 2,
      fillColor: '#92d36e',
      strokeColor: '#92d36e',
      fillOpacity: 0.25
    },
    'neighbor': {
      fillColor: '#f3e4bb',
      strokeColor: '#f3e4bb',
      strokeWidth: 2,
      fillOpacity: 0.25
    },
    'disabled': {
      fillColor: '#AAAAAA',
      strokeColor: '#AAAAAA',
      strokeWidth: 2,
      fillOpacity: 0.25
    },
    'gradient': {
      fillColor: '#ef5350'
    }
  }
};

config.indicators = {
  codes: {
    baseNumeric: 3738,
    kalendarnyyGod: 2
  }
};



export default config;       
