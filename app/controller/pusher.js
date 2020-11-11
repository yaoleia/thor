'use strict';
const Controller = require('egg').Controller;

class PusherController extends Controller {
  async index() {
    const { ctx } = this;
    const { device, url } = ctx.request.body
    const defectData = await ctx.service.backend.defect(url)
    if (device) {
      this.app.io.of('/').to(device).emit('res', defectData);
    } else {
      this.app.io.of('/').emit('res', defectData);
    }
    ctx.body = defectData
  }
}

module.exports = PusherController;
