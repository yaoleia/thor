'use strict';
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async index() {
    this.ctx.body = await this.ctx.service.file.upload()
  }
}

module.exports = UploadController;
