const Service = require('egg').Service;
const _ = require('lodash')

class Defect2wsService extends Service {
  async index({ device_id, image_url }) {
    const { service, helper, logger } = this.ctx
    const date = helper.getDate()
    const [{ defect_items }, [image]] = await Promise.all([
      service.modelApi.defect(image_url),
      service.file.upload()
    ])
    const defectData = {
      is_defect: !!_.get(defect_items, 'length'),
      defect_items,
      device_id,
      image_url,
      thumbnail_url: _.get(image, 'url'),
      date
    }
    logger.debug(defectData)
    const nsp = this.app.io.of('/')
    const room = device_id ? nsp.to(device_id) : nsp
    room.emit('res', defectData)
    return defectData
  }
}

module.exports = Defect2wsService;