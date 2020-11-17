'use strict';
const Controller = require('egg').Controller;

class PusherController extends Controller {
  async index() {
    const defectData = await this.ctx.service.defect2ws.index(this.ctx.request.body)
    this.ctx.body = defectData
  }
}

module.exports = PusherController;