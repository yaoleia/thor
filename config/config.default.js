/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
const path = require('path');

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.io = {
    namespace: {
      '/': {
        connectionMiddleware: ['auth'],
        packetMiddleware: ['filter'],
      }
    },
    redis: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    }
  }

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    }
  }

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1604639726575_3480';

  // add your middleware config here
  config.middleware = ['proxy', 'gzip', 'auth']

  config.proxy = {
    match: '/api/proxyurl'
  }

  config.gzip = {
    threshold: 1024 // 小于 1k 的响应体不压缩
  }

  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/view'),
      path.join(appInfo.baseDir, 'web/dist'),
    ].join(','),
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    }
  }

  config.static = {
    prefix: '/public/',
    dir: [path.join(appInfo.baseDir, 'web/dist'), path.join(appInfo.baseDir, 'public')]
  }

  config.session = {
    key: 'EGG_SESS',
    maxAge: 7 * 24 * 3600 * 1000,
    renew: true
  }

  config.security = {
    csrf: {
      enable: false
    },
    xframe: {
      enable: false
    }
  }

  config.assets = {
    devServer: {
      debug: true,
      command: 'umi dev',
      port: 8000,
      env: {
        MOCK: 'none',
        APP_ROOT: process.cwd() + '/web',
        BROWSER: 'none',
        ESLINT: 'none',
        SOCKET_SERVER: 'http://127.0.0.1:8000',
        PUBLIC_PATH: 'http://127.0.0.1:8000',
      },
    },
  };

  config.logger = {
    level: 'DEBUG',
    consoleLevel: 'DEBUG'
  }

  // add your user config here
  const userConfig = {
    mockServer: 'https://proapi.azurewebsites.net'
  };

  return {
    ...config,
    ...userConfig,
  };
};
