'use strict';
const Controller = require('egg').Controller;

class MockController extends Controller {
  async proxy() {
    const ctx = this.ctx;
    // use roadhog mock api first
    const url = this.app.config.mockServer + ctx.path + '?' + ctx.querystring;
    ctx.logger.debug(url)
    const res = await this.ctx.curl(url, {
      method: this.ctx.method,
      timeout: 10000
    });
    ctx.body = res.data;
    ctx.status = res.status;
  }
}

module.exports = MockController;
