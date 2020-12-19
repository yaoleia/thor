'use strict';
const Controller = require('egg').Controller;

class DefectTypeController extends Controller {
  async index() {
    const result = await this.ctx.service.defectType.index(this.ctx.query)
    this.ctx.body = result;
  }

  async create() {
    const result = await this.ctx.service.defectType.create(this.ctx.request.body)
    this.ctx.body = result
  }

  async update() {
    const result = await this.ctx.service.defectType.update(this.ctx.params, this.ctx.request.body)
    this.ctx.body = result
  }

  async destroy() {
    const result = await this.ctx.service.defectType.destroy(this.ctx.params)
    this.ctx.body = result
  }
}

module.exports = DefectTypeController;
