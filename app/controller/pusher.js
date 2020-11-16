'use strict';
const _ = require('lodash')
const Controller = require('egg').Controller;

class PusherController extends Controller {
  async index() {
    const { ctx } = this;
    const { device_id, image_url } = ctx.request.body
    const date = ctx.helper.getDate()
    const [{ defect_items }, [image]] = await Promise.all([
      ctx.service.backend.defect(image_url),
      ctx.service.file.upload(ctx)
    ])
    const defectData = {
      is_defect: !!_.get(defect_items, 'length'),
      defect_items,
      device_id,
      image_url,
      thumbnail_url: _.get(image, 'url'),
      date
    }
    ctx.logger.debug(defectData)
    const nsp = this.app.io.of('/')
    const room = device_id ? nsp.to(device_id) : nsp
    room.emit('res', defectData)
    ctx.body = defectData
  }
}

module.exports = PusherController;