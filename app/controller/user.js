'use strict';
const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    const result = await this.ctx.service.user.index(this.ctx.query)
    this.ctx.body = result;
  }

  async create() {
    const result = await this.ctx.service.user.create(this.ctx.request.body)
    this.ctx.body = result
  }

  // 根据id查询
  async show() {
    const result = await this.ctx.service.user.show(this.ctx.params)
    this.ctx.body = result
  }

  async update() {
    const result = await this.ctx.service.user.update(this.ctx.params, this.ctx.request.body)
    this.ctx.body = result
  }

  async destroy() {
    const result = await this.ctx.service.user.destroy(this.ctx.params)
    this.ctx.body = result
  }

  async currentUser() {
    const { username } = this.ctx.session
    const user = await this.ctx.service.user.show({ id: username })
    delete user.password
    this.ctx.body = user
  }
}

module.exports = UserController;
