const Service = require('egg').Service;
const _ = require('lodash')

class PusherService extends Service {
  async pushMq(body) {
    try {
      const { device_id, image_url, uid } = body
      if (!device_id) throw 'no device_id!'
      if (!image_url) throw 'no image_url!'
      if (!uid) throw 'no uid!'
      this.app.messenger.sendToAgent('wait_msg', device_id)
      let queue_length = await this.app.redis.get('mq').lpush(`list#${device_id}`, JSON.stringify(body))
      const { QUEUE_MAX } = this.config
      if (queue_length > QUEUE_MAX) {
        await this.app.redis.get('mq').ltrim(`list#${device_id}`, 0, QUEUE_MAX - 1)
        queue_length = QUEUE_MAX
      }
      return {
        queue_length,
        status: 'success'
      }
    } catch (error) {
      return {
        status: 'failed',
        msg: error
      }
    }
  }

  async defect2ws(body) {
    const { device_id, image_url, uid } = body
    const { service, helper, logger } = this.ctx
    try {
      const device = device_id && await service.device.getFromRedis(device_id)
      if (!device || !device.style) {
        this.ctx.status = 400
        if (device && !device.style) {
          throw {
            msg: "请选择该设备要检测的产品类型!",
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

      const { style, ...baseDevice } = device
      const [modelData, [image]] = await Promise.all([
        service.modelApi.defect(image_url, device),
        service.file.upload(body)
      ])
      if (!image) {
        this.ctx.status = 400
        throw {
          device: baseDevice,
          style,
          msg: "图片获取失败，请检查图片地址！",
          body
        }
      }
      if (this.ctx.status === 504) {
        throw {
          device: baseDevice,
          style,
          ...modelData
        }
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
      this.app.io.of('/').to(device.uid).emit('res', helper.parseMsg('result', defectData))
      await service.record.create(defectData)
      return defectData
    } catch (error) {
      this.app.io.of('/').to(device_id).emit('res', helper.parseMsg('error', error))
      logger.error(error)
    }
  }
}

module.exports = PusherService;