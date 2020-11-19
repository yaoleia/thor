'use strict';
const Controller = require('egg').Controller;

class DeviceController extends Controller {
  async index() {
    const result = await this.ctx.service.device.index(this.ctx.params);
    this.ctx.body = result;
  }

  async create() {
    const result = await this.ctx.service.device.create(this.ctx.request.body)
    this.ctx.body = result
  }

  // 根据id查询
  async show() {
    const result = await this.ctx.service.device.show(this.ctx.params);
    this.ctx.body = result
  }

  async update() {
    const result = await this.ctx.service.device.update(this.ctx.params, this.ctx.request.body);
    this.ctx.body = result
  }

  async destroy() {
    const result = await this.ctx.service.device.destroy(this.ctx.params)
    this.ctx.body = result
  }
}

module.exports = DeviceController;
