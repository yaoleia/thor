'use strict';
const Controller = require('egg').Controller;

class PatternController extends Controller {
  async index() {
    const result = await this.ctx.service.pattern.index(this.ctx.query);
    this.ctx.body = result;
  }

  async create() {
    const result = await this.ctx.service.pattern.create(this.ctx.request.body)
    this.ctx.body = result
  }

  // 根据id查询
  async show() {
    const result = await this.ctx.service.pattern.show(this.ctx.params);
    this.ctx.body = result
  }

  async update() {
    const result = await this.ctx.service.pattern.update(this.ctx.params, this.ctx.request.body);
    this.ctx.body = result
  }

  async destroy() {
    const result = await this.ctx.service.pattern.destroy(this.ctx.params)
    this.ctx.body = result
  }
}

module.exports = PatternController;
