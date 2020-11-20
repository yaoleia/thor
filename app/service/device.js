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
      if (result) {
        delete result._id
        await this.app.redis.hset("devices", id, JSON.stringify(result))
      }
      return result
    }
    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Device.create(Object.assign(request, { uid }))
      delete result._id
      await this.app.redis.hset("devices", uid, JSON.stringify(result))
      return result
    }
    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Device.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await this.app.redis.hdel("devices", uid)
      })
      await Promise.all(ps)
      return result
    }

    async getFromRedis(uid) {
      const resp = await this.app.redis.hget("devices", uid)
      return resp && JSON.parse(resp)
    }
  }
  return DeviceService
}