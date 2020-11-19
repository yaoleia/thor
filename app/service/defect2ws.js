const Service = require('egg').Service;
const _ = require('lodash')

class Defect2wsService extends Service {
  async index({ device_id, image_url, uid }) {
    const { service, helper, logger } = this.ctx

    const device = device_id && await service.device.getFromRedis(device_id)
    if (!device) {
      this.ctx.status = 400
      return {
        msg: "设备不存在! (请检查 device_id)"
      }
    }

    // TODO 查{device_id}当前使用的款式配置Style

    // 默认压缩图片质量60
    if (!_.get(this.ctx, 'request.body.quality')) {
      this.ctx.request.body.quality = 60
    }

    const time = helper.getDate()
    const [{ defect_items, size_items }, [image]] = await Promise.all([
      service.modelApi.defect(image_url),
      service.file.upload()
    ])
    // TODO 后处理，尺寸比较判断OK/NG
    const defectData = {
      uid,
      time,
      device,
      // style,
      image_url,
      thumbnail_url: _.get(image, 'url'),
      defect_items,
      size_items,
      is_defect: !!_.get(defect_items, 'length')
    }
    logger.debug(defectData)
    this.app.io.of('/').to(device.uid).emit('res', defectData)
    await service.record.create(defectData)
    return defectData
  }
}

module.exports = Defect2wsService;