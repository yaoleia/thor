/**
 * 生产环境配置
 *
 * 最终生效的配置为 prod + default（前者覆盖后者）
 */

module.exports = appInfo => {
  const config = {};

  const env = process.env

  config.BACKEND_SERVER = env.BACKEND_SERVER || 'http://10.18.144.239:7777/mock/5fab56600a3d6400244cb595/thor/api'
  config.UPLOAD_DIR = env.UPLOAD_DIR || '/upload'

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

  config.static = {
    prefix: '/public/',
    dir: [path.join(appInfo.baseDir, 'web/dist'), path.join(appInfo.baseDir, 'public'), config.UPLOAD_DIR]
  }

  return config;
};