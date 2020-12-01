module.exports = app => {
  class DeviceService extends app.Service {
    async index(query = {}, hasStyle = true) {
      let { start_date, end_date, limit = 0, offset = 0, ...params } = query
      offset = Number(offset)
      limit = Number(limit)
      const { getDateIfTime } = this.ctx.helper
      start_date = getDateIfTime(start_date)
      end_date = getDateIfTime(end_date)
      if (start_date || end_date) {
        params.time = {}
        start_date && (params.time["$gte"] = start_date)
        end_date && (params.time["$lt"] = end_date)
      }
      const [count, devices] = await Promise.all([
        this.ctx.model.Device.countDocuments(params),
        this.ctx.model.Device.find(params, { _id: 0 }).skip(offset).limit(limit).sort([['time', -1]]).lean({ getters: true })
      ])
      if (hasStyle) {
        const ps = devices.map(async device => {
          device.style = await this.getDeviceStyle(device.uid)
        })
        await Promise.all(ps)
      }
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = devices
      return result
    }

    async show({ id }) {
      if (!id) { return }
      const devices = await this.ctx.model.Device.find({ uid: id }, { _id: 0 }).lean({ getters: true })
      const device = devices[0] || null
      if (device) {
        device.style = await this.getDeviceStyle(id)
      }
      return device
    }

    async update({ id }, { uid, ...body }) {
      const device = await this.ctx.model.Device.findOneAndUpdate({ uid: id }, { $set: body }, { new: true }).lean({ getters: true })
      if (!device) return
      delete device._id
      await this.app.redis.get('cache').hset("devices", id, JSON.stringify(device))
      return device
    }

    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Device.create(Object.assign(request, { uid }))
      const device = result.toObject()
      delete device._id
      delete device.id
      await this.app.redis.get('cache').hset("devices", uid, JSON.stringify(device))
      return device
    }

    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Device.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await Promise.all([this.app.redis.get('cache').hdel("devices", uid), this.app.redis.get('cache').del(`style#${uid}`)])
      })
      await Promise.all(ps)
      return result
    }

    async getFromRedis(uid) {
      const resp = await this.app.redis.get('cache').hget("devices", uid)
      if (!resp) return
      const device = JSON.parse(resp)
      device.style = await this.getDeviceStyle(device.uid)
      return device
    }

    async getDeviceStyle(uid) {
      const style_id = await this.app.redis.get('cache').get(`style#${uid}`)
      if (style_id) {
        const styleStr = await this.app.redis.get('cache').hget("styles", style_id)
        if (styleStr) {
          return JSON.parse(styleStr)
        } else {
          await this.app.redis.get('cache').del(`style#${uid}`)
        }
      }
    }

    async setDeviceStyle({ device_id, style_id }) {
      if (!device_id || !style_id) return
      const [deviceStr, styleStr] = await Promise.all([
        this.app.redis.get('cache').hget("devices", device_id),
        this.app.redis.get('cache').hget("styles", style_id)
      ])
      if (!deviceStr || !styleStr) return
      await this.app.redis.get('cache').set(`style#${device_id}`, style_id)
      return {
        device: JSON.parse(deviceStr),
        style: JSON.parse(styleStr)
      }
    }

  }
  return DeviceService
}