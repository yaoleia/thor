module.exports = app => {
  class DeviceService extends app.Service {
    async index(params) {
      const devices = await this.ctx.model.Device.find(params, { _id: 0 })
      const result = {}
      result.meta = { total: devices.length }
      result.data = devices
      return result
    }
    async show({ id }) {
      if (!id) { return }
      const devices = await this.ctx.model.Device.find({ uid: id }, { _id: 0 })
      return devices[0]
    }
    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Device.findOneAndUpdate({ uid: id }, { $set: body }, { new: true })
      return result
    }
    async create(request) {
      if (!request) { return }
      const result = await this.ctx.model.Device.create(Object.assign({}, request, { uid: this.ctx.helper.getRandomId() }))
      return result
    }
    async destroy(params) {
      const result = this.ctx.model.Device.remove({ "uid": { $in: params.id.split(',') } })
      return result
    }
  }
  return DeviceService
}