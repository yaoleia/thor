'use strict';
const Controller = require('egg').Controller;

class AccountController extends Controller {
  async postLogin(ctx) {
    const body = ctx.request.body;
    const { password, username, type } = body;
    const user = await this.ctx.service.user.show({ id: username })
    if (user) {
      if (user.password === password) {
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
        msg: '密码错误！'
      }
      return
    }
    ctx.body = {
      status: 'error',
      type,
      currentAuthority: 'guest',
      msg: '用户不存在！'
    }
  }

  async logout(ctx) {
    ctx.logger.info('[account controller] user logout', ctx.session.username)
    delete ctx.session.username
    ctx.body = 'logout success'
  }
}

module.exports = AccountController;
