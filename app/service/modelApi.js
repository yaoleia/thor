const Service = require('egg').Service;

class BackendService extends Service {
  async defect(image_url, device) {
    const model_server = device.model_server || this.app.config.MODEL_SERVER
    const resp = await this.ctx.curl(model_server + '/api/defect', {
      data: {
        image_url,
        style: device.style
      },
      dataType: 'json',
      method: "POST",
      timeout: 10000
    });
    return resp.data
  }
}

module.exports = BackendService;