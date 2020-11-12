/**
 * 生产环境配置
 *
 * 最终生效的配置为 prod + default（前者覆盖后者）
 */

module.exports = app => {
  const config = {};

  const env = process.env

  config.logger = {
    level: 'NONE',
    consoleLevel: 'INFO',
  };

  config.io = {
    redis: {
      host: env.THOR_REDIS || 'redis'
    }
  }

  config.redis = {
    client: {
      host: env.THOR_REDIS || 'redis'
    }
  }

  config.BACKEND_SERVER = env.BACKEND_SERVER || 'http://10.18.144.239:7777/mock/5fab56600a3d6400244cb595/thor/api'

  return config;
};