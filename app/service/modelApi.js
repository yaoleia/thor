const Service = require('egg').Service;

class BackendService extends Service {
  async defect(image_url, device) {
    const model_server = device.model_server || this.app.config.MODEL_SERVER
    const defectApi = model_server + '/api/defect'
    try {
      const resp = await this.ctx.curl(defectApi, {
        data: {
          image_url,
          style: device.style
        },
        dataType: 'json',
        method: "POST",
        timeout: 10000
      })
      if (resp.status !== 200) throw resp.data
      return resp.data
    } catch (error) {
      this.ctx.status = 504
      return {
        msg: error || 'Gateway Timeout, 请求超时, 请检查设备算法服务地址！',
        model_api: defectApi,
        code: this.ctx.status
      }
    }
  }
}

module.exports = BackendService;