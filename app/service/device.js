module.exports = app => {
  class DeviceService extends app.Service {
    async index(query = {}, hasPattern = true) {
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
      if (hasPattern) {
        const ps = devices.map(async device => {
          device.pattern = await this.getDevicePattern(device.uid)
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
      const device = devices[0]
      if (device) {
        device.pattern = await this.getDevicePattern(id)
        return device
      }
      this.ctx.status = 400
      return `${id} 未找到设备信息`
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
      const redis = this.app.redis.get('cache')
      const ps = uids.map(async uid => {
        await Promise.all([
          redis.hdel("devices", uid),
          redis.del(`pattern#${uid}`),
          redis.ltrim(`list#${uid}`, -1, 0)
        ])
        this.app.messenger.sendToAgent('stop_wait', uid)
      })
      await Promise.all(ps)
      return result
    }

    async getFromRedis(uid) {
      const resp = await this.app.redis.get('cache').hget("devices", uid)
      if (!resp) return
      const device = JSON.parse(resp)
      device.pattern = await this.getDevicePattern(device.uid)
      return device
    }

    async getDevicePattern(uid) {
      const pattern_id = await this.app.redis.get('cache').get(`pattern#${uid}`)
      if (pattern_id) {
        const patternStr = await this.app.redis.get('cache').hget("patterns", pattern_id)
        if (patternStr) {
          return JSON.parse(patternStr)
        } else {
          await this.app.redis.get('cache').del(`pattern#${uid}`)
        }
      }
    }

    async setDevicePattern({ device_id, pattern_id }) {
      if (!device_id || !pattern_id) return
      const [deviceStr, patternStr] = await Promise.all([
        this.app.redis.get('cache').hget("devices", device_id),
        this.app.redis.get('cache').hget("patterns", pattern_id)
      ])
      if (!deviceStr || !patternStr) return
      await this.app.redis.get('cache').set(`pattern#${device_id}`, pattern_id)
      return {
        device: JSON.parse(deviceStr),
        pattern: JSON.parse(patternStr)
      }
    }

  }
  return DeviceService
}