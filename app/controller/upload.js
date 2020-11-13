'use strict';
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async index() {
    const url = await this.ctx.service.file.upload(this.ctx.request.body)
    this.ctx.body = {
      url
    }
  }
}

module.exports = UploadController;
