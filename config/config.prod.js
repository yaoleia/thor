/**
 * 生产环境配置
 *
 * 最终生效的配置为 prod + default（前者覆盖后者）
 */
module.exports = appInfo => {
  const config = {};

  const { MODEL_SERVER, NETWORK, THOR_REDIS, THOR_MONGO } = process.env

  const isHost = NETWORK === 'host'

  config.MODEL_SERVER = MODEL_SERVER || 'http://10.18.144.239:7777/mock/5fab56600a3d6400244cb595/thor'

  config.logger = {
    level: 'NONE',
    consoleLevel: 'INFO',
  }

  config.io = {
    redis: {
      host: isHost ? '127.0.0.1' : THOR_REDIS || 'redis'
    }
  }

  config.redis = {
    clients: {
      cache: {
        host: isHost ? '127.0.0.1' : THOR_REDIS || 'redis'
      },
      mq: {
        host: isHost ? '127.0.0.1' : THOR_REDIS || 'redis'
      }
    }
  }

  config.mongoose = {
    url: `mongodb://${isHost ? '127.0.0.1' : THOR_MONGO || 'mongo'}/thor`,
    options: {}
  }

  return config;
};