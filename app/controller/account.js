'use strict';
const ms = require('ms');
const Controller = require('egg').Controller;

class AccountController extends Controller {
  async user() {
    this.ctx.body = this.ctx.helper.relativeTime(1604998254421)
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
}

module.exports = AccountController;
