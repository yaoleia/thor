'use strict';
const Controller = require('egg').Controller;

class RecordController extends Controller {
  // 查询所有，可分页
  async index() {
    const result = await this.ctx.service.record.index(this.ctx.params);
    this.ctx.body = result;
  }

  async create() {
    const result = await this.ctx.service.record.create(this.ctx.request.body)
    this.ctx.body = result
  }

  // 根据id查询
  async show() {
    const result = await this.ctx.service.record.show(this.ctx.params);
    this.ctx.body = result
  }

  async update() {
    const result = await this.ctx.service.record.update(this.ctx.params, this.ctx.request.body);
    this.ctx.body = result
  }

  async destroy() {
    const result = await this.ctx.service.record.destroy(this.ctx.params)
    this.ctx.body = result
  }
}

module.exports = RecordController;
