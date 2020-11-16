'use strict';
const moment = require('moment')
const Controller = require('egg').Controller;

class PusherController extends Controller {
  async index() {
    const { ctx } = this;
    const { device, image_url } = ctx.request.body
    const date = ctx.helper.getDate()
    const [{ data: { defect } }, [image]] = await Promise.all([
      ctx.service.backend.defect(image_url),
      ctx.service.file.upload(ctx)
    ])
    const defectData = {
      defect,
      image_url,
      thumbnail_url: image && image.url,
      date
    }
    const nsp = this.app.io.of('/')
    const room = device ? nsp.to(device) : nsp
    room.emit('res', defectData)
    ctx.body = {
      data: defectData
    }
  }
}

module.exports = PusherController;