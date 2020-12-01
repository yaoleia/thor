const Service = require('egg').Service;
const _ = require('lodash')

class PusherService extends Service {
  async pushMq(body) {
    try {
      const { device_id, image_url, uid } = body
      if (!device_id) throw 'no device_id!'
      if (!image_url) throw 'no image_url!'
      if (!uid) throw 'no uid!'
      let queue_length = await this.app.redis.get('mq').lpush(`list#${device_id}`, JSON.stringify(body))
      const { QUEUE_MAX } = this.config
      if (queue_length > QUEUE_MAX) {
        await this.app.redis.get('mq').ltrim(`list#${device_id}`, 0, QUEUE_MAX - 1)
        queue_length = QUEUE_MAX
      }
      this.app.messenger.sendToAgent('wait_msg', device_id)
      return {
        queue_length,
        code: 'success'
      }
    } catch (error) {
      return {
        code: 'failed',
        msg: error
      }
    }
  }

  async defect2ws(body) {
    const { device_id, image_url, uid } = body
    const { service, helper, logger } = this.ctx
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
    const [modelData, [image]] = await Promise.all([
      service.modelApi.defect(image_url, device),
      service.file.upload(body)
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
    // TODO 反馈给硬件接口
    const defectData = {
      uid,
      time: helper.getDate(),
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

module.exports = PusherService;