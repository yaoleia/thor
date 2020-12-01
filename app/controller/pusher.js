'use strict';
const Controller = require('egg').Controller;

class PusherController extends Controller {
  async index() {
    this.ctx.body = await this.ctx.service.pusher.pushMq(this.ctx.request.body)
  }
}

module.exports = PusherController;