'use strict';
const ms = require('ms');
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    await ctx.render('index.html', {
      username: ctx.session.username
    })
  }

  async user() {
    this.ctx.body = 'aaa'
  }

  async postLogin(ctx) {
    const body = ctx.request.body;
    const { password, userName, type } = body;
    if (password === 'admin') {
      ctx.session.username = userName;
      ctx.session.maxAge = ms('7d');
      ctx.body = {
        status: 'ok',
        type,
        currentAuthority: 'admin',
      }
      return;
    }
    ctx.body = {
      status: 'error',
      type,
      currentAuthority: 'guest',
    }
  }

  async logout(ctx) {
    ctx.logger.info('[account controller] user logout', ctx.session.username);
    delete ctx.session.username;
    ctx.body = 'logout success';
  }

  async proxy() {
    const ctx = this.ctx;
    console.log(ctx.session)
    // use roadhog mock api first
    const url = 'https://proapi.azurewebsites.net' + ctx.path + '?' + ctx.querystring;
    console.log(url)
    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = HomeController;
