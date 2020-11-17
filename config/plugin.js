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
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  assets: {
    enable: false,
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
  session: true,
  sessionRedis: {
    enable: true,
    package: 'egg-session-redis',
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  }
}
