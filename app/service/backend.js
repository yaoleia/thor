const Service = require('egg').Service;

class BackendService extends Service {
  async defect(url) {
    const res = await this.ctx.curl(this.app.config.BACKEND_SERVER + '/defect', {
      data: {
        url
      },
      contentType: 'json',
      dataType: 'json',
      method: "POST",
      timeout: 10000
    });
    return res.data;
  }
}

module.exports = BackendService;