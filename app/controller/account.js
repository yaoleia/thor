'use strict';
const Controller = require('egg').Controller;

class AccountController extends Controller {
  async postLogin(ctx) {
    const body = ctx.request.body;
    const { password, username, type } = body;
    if (password === 'admin' && username === 'admin') {
      ctx.session.username = username;
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
