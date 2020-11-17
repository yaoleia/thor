const Service = require('egg').Service;

class BackendService extends Service {
  async defect(url) {
    const resp = await this.ctx.curl(this.app.config.BACKEND_SERVER + '/defect', {
      data: {
        url
      },
      dataType: 'json',
      method: "POST",
      timeout: 10000
    });
    return resp.data
  }
}

module.exports = BackendService;