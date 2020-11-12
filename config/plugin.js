'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  session: true,
  assets: {
    enable: true,
    package: 'egg-view-assets',
  },
  io: {
    enable: true,
    package: 'egg-socket.io',
  },
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  sessionRedis: {
    enable: true,
    package: 'egg-session-redis',
  }
};
