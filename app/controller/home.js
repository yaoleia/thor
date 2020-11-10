'use strict';
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index.html')
  }

  async proxy() {
    const ctx = this.ctx;
    console.log(ctx.session)
    // use roadhog mock api first
    const url = 'https://proapi.azurewebsites.net' + ctx.path + '?' + ctx.querystring;
    console.log(url)
    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
      timeout: 10000
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = HomeController;
