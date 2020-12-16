const Service = require('egg').Service;
const _ = require('lodash')

class PusherService extends Service {
  async pushMq(body) {
    const { logger } = this.ctx
    const { device_id, image_url, uid } = body
    try {
      if (!device_id) throw 'no device_id!'
      if (!image_url) throw 'no image_url!'
      if (!uid) throw 'no uid!'
      const exists = await this.app.redis.get('cache').hexists("devices", device_id)
      if (!exists) throw "设备不存在! (请检查 device_id)"
      this.app.messenger.sendToAgent('wait_msg', device_id)
      let queue_length = await this.app.redis.get('mq').lpush(`list#${device_id}`, JSON.stringify(body))
      const { QUEUE_MAX } = this.config
      if (queue_length > QUEUE_MAX) {
        await this.app.redis.get('mq').ltrim(`list#${device_id}`, 0, QUEUE_MAX - 1)
        queue_length = QUEUE_MAX
      }
      return {
        queue_length,
        status: 'success',
        ...body
      }
    } catch (error) {
      this.ctx.status = 400
      const errorData = {
        status: 'failed',
        msg: error,
        ...body
      }
      logger.error(errorData)
      return errorData
    }
  }

  async defect2ws(body) {
    const { device_id, image_url, uid } = body
    const { service, helper, logger } = this.ctx
    try {
      const device = device_id && await service.device.getFromRedis(device_id)
      if (!device || !device.pattern) {
        this.ctx.status = 400
        if (device && !device.pattern) {
          throw {
            msg: "请选择该设备要检测的模板!",
            device
          }
        }
        throw {
          msg: "设备不存在! (请检查 device_id)"
        }
      }

      // 默认压缩图片质量60
      if (!body.quality) {
        body.quality = 60
      }

      const { pattern, ...baseDevice } = device
      const [modelData, [image]] = await Promise.all([
        service.modelApi.defect(image_url, device),
        service.file.upload(body)
      ])
      if (!image) {
        this.ctx.status = 400
        throw {
          device: baseDevice,
          pattern,
          msg: "图片获取失败，请检查图片地址！",
          body
        }
      }
      if (this.ctx.status === 504) {
        throw {
          device: baseDevice,
          pattern,
          ...modelData
        }
      }
      const { defect_items, size_items } = modelData
      // TODO 后处理，尺寸比较判断OK/NG
      // TODO 反馈给硬件接口
      const defectData = {
        uid,
        time: new Date().getTime(),
        device: baseDevice,
        pattern,
        image_url: image.original_url || image_url,
        thumbnail_url: image.url,
        defect_items,
        size_items,
        defect_alarm: !!_.get(defect_items, 'length'),
        size_alarm: false
      }
      await this.app.io.of('/').to(device.uid).emit('res', helper.parseMsg('product', defectData))
      await service.record.create(defectData)
      return defectData
    } catch (error) {
      this.app.io.of('/').to(device_id).emit('res', helper.parseMsg('error', error))
      logger.error(error)
      return error
    }
  }
}

module.exports = PusherService;