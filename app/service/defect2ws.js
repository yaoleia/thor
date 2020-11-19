const Service = require('egg').Service;
const _ = require('lodash')

class Defect2wsService extends Service {
  async index({ device_id = 'default', image_url, uid }) {
    const { service, helper, logger } = this.ctx

    // 默认压缩图片质量60
    if (!_.get(this.ctx, 'request.body.quality')) {
      this.ctx.request.body.quality = 60
    }

    const time = helper.getDate()
    // TODO 查{device_id(找到设备device.uid)}的设备配置信息（服务地址等）
    // TODO 查{device_id}当前使用的款式配置Style
    const [{ defect_items, size_items }, [image]] = await Promise.all([
      service.modelApi.defect(image_url),
      service.file.upload()
    ])
    // TODO 后处理，尺寸比较判断OK/NG
    const defectData = {
      uid,
      time,
      // device,
      // style,
      image_url,
      thumbnail_url: _.get(image, 'url'),
      defect_items,
      size_items,
      is_defect: !!_.get(defect_items, 'length')
    }
    logger.debug(defectData)
    const nsp = this.app.io.of('/')
    const room = device_id ? nsp.to(device_id) : nsp
    room.emit('res', defectData)
    await service.record.create(defectData)
    return defectData
  }
}

module.exports = Defect2wsService;