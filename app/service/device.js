module.exports = app => {
  class DeviceService extends app.Service {
    async index(params) {
      const devices = await this.ctx.model.Device.find(params, { _id: 0 }, { lean: true })
      const ps = devices.map(async device => {
        device.style = await this.getDeviceStyle(device.uid)
      })
      await Promise.all(ps)
      const result = {}
      result.meta = { total: devices.length }
      result.data = devices
      return result
    }

    async show({ id }) {
      if (!id) { return }
      const devices = await this.ctx.model.Device.find({ uid: id }, { _id: 0 }, { lean: true })
      const device = devices[0] || null
      if (device) {
        device.style = await this.getDeviceStyle(id)
      }
      return device
    }

    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Device.findOneAndUpdate({ uid: id }, { $set: body }, { new: true })
      if (!result) return
      const device = result.toObject()
      delete device._id
      await this.app.redis.hset("devices", id, JSON.stringify(device))
      return device
    }

    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Device.create(Object.assign(request, { uid }))
      const device = result.toObject()
      delete device._id
      await this.app.redis.hset("devices", uid, JSON.stringify(device))
      return device
    }

    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Device.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await this.app.redis.hdel("devices", uid)
        await this.app.redis.del(`style#${uid}`)
      })
      await Promise.all(ps)
      return result
    }

    async getFromRedis(uid) {
      const resp = await this.app.redis.hget("devices", uid)
      if (!resp) return
      const device = JSON.parse(resp)
      device.style = await this.getDeviceStyle(device.uid)
      return device
    }

    async getDeviceStyle(uid) {
      const style_id = await this.app.redis.get(`style#${uid}`)
      if (style_id) {
        const styleStr = await this.app.redis.hget("styles", style_id)
        if (styleStr) {
          return JSON.parse(styleStr)
        } else {
          await this.app.redis.del(`style#${uid}`)
        }
      }
    }

    async setDeviceStyle({ device_id, style_id }) {
      if (!device_id || !style_id) return
      const [deviceStr, styleStr] = await Promise.all([
        this.app.redis.hget("devices", device_id),
        this.app.redis.hget("styles", style_id)
      ])
      if (!deviceStr || !styleStr) return
      await this.app.redis.set(`style#${device_id}`, style_id)
      return {
        device: JSON.parse(deviceStr),
        style: JSON.parse(styleStr)
      }
    }

  }
  return DeviceService
}