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

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1604639726575_3480';

  // add your middleware config here
  config.middleware = [];

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

  config.middleware = ['auth', 'proxy']

  config.proxy = {
    match: '/api/proxyurl'
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

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
