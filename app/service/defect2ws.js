const Service = require('egg').Service;
const _ = require('lodash')

class Defect2wsService extends Service {
  async index({ device_id = 'default', image_url, uid }) {
    const { service, helper, logger } = this.ctx
    const time = helper.getDate()
    const [{ defect_items, size_items, model }, [image]] = await Promise.all([
      service.modelApi.defect(image_url),
      service.file.upload()
    ])
    const defectData = {
      uid,
      is_defect: !!_.get(defect_items, 'length'),
      defect_items,
      size_items,
      model,
      device_id,
      image_url,
      thumbnail_url: _.get(image, 'url'),
      time
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