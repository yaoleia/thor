const Service = require('egg').Service;
const _ = require('lodash')

class Defect2wsService extends Service {
  async index({ device_id, image_url, uid }) {
    const { service, helper, logger, request: { body } } = this.ctx
    const device = device_id && await service.device.getFromRedis(device_id)
    if (!device || !device.style) {
      this.ctx.status = 400
      if (device && !device.style) {
        const errDate = {
          msg: "请在系统中选择该设备要检测的产品类型!",
          device
        }
        this.app.io.of('/').to(device.uid).emit('res', errDate)
        logger.error(errDate)
        return errDate
      }
      return {
        msg: "设备不存在! (请检查 device_id)"
      }
    }

    // 默认压缩图片质量60
    if (!body.quality) {
      body.quality = 60
    }

    const { style, ...baseDevice } = device
    const time = helper.getDate()
    const [modelData, [image]] = await Promise.all([
      service.modelApi.defect(image_url, device),
      service.file.upload()
    ])
    if (!image) {
      this.ctx.status = 400
      const errDate = {
        device: baseDevice,
        style,
        code: this.ctx.status,
        msg: "图片获取失败，请检查图片地址！",
        body
      }
      this.app.io.of('/').to(device.uid).emit('res', errDate)
      logger.error(errDate)
      return errDate
    }
    if (this.ctx.status === 504) {
      const errDate = {
        device: baseDevice,
        style,
        ...modelData
      }
      this.app.io.of('/').to(device.uid).emit('res', errDate)
      logger.error(errDate)
      return errDate
    }
    const { defect_items, size_items } = modelData
    // TODO 后处理，尺寸比较判断OK/NG
    const defectData = {
      uid,
      time,
      device: baseDevice,
      style,
      image_url,
      thumbnail_url: image.url,
      defect_items,
      size_items,
      defect_alarm: !!_.get(defect_items, 'length'),
      size_alarm: false
    }
    this.app.io.of('/').to(device.uid).emit('res', defectData)
    await service.record.create(defectData)
    return defectData
  }
}

module.exports = Defect2wsService;