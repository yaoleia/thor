const Service = require('egg').Service;

class BackendService extends Service {
  async defect(image_url, { model_server, pattern }) {
    try {
      if (!model_server) throw '未配置设备算法服务！'
      const resp = await this.ctx.curl(model_server, {
        data: {
          image_url,
          pattern
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
        msg: typeof error === 'string' ? error : '请检查设备算法服务！',
        model_server
      }
    }
  }
}

module.exports = BackendService;