'use strict';
const Controller = require('egg').Controller;

class RecordController extends Controller {
  // 查询所有，可分页
  async index() {
    const { ctx } = this;
    ctx.body = 'getAll'
  }

  async create() {
    this.ctx.body = 'creat'
  }

  // 根据id查询
  async show() {
    this.ctx.body = 'show'
  }

  async update() {
    this.ctx.body = 'update'
  }

  async destroy() {
    this.ctx.body = 'destroy'
  }
 }

module.exports = RecordController;
