module.exports = app => {
  class StyleService extends app.Service {
    async index(query = {}) {
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
      const [count, styles] = await Promise.all([
        this.ctx.model.Style.countDocuments(params),
        this.ctx.model.Style.find(params, { _id: 0 }).skip(offset).limit(limit).sort([['time', -1]]).lean({ getters: true })
      ])
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = styles
      return result
    }
    async show({ id }) {
      if (!id) { return }
      const styles = await this.ctx.model.Style.find({ uid: id }, { _id: 0 }).lean({ getters: true })
      return styles[0]
    }
    async update({ id }, { uid, ...body }) {
      const style = await this.ctx.model.Style.findOneAndUpdate({ uid: id }, { $set: body }, { new: true }).lean({ getters: true })
      if (!style) return
      delete style._id
      await this.app.redis.get('cache').hset("styles", id, JSON.stringify(style))
      return style
    }
    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Style.create(Object.assign(request, { uid }))
      const style = result.toObject()
      delete style._id
      delete style.id
      await this.app.redis.get('cache').hset("styles", uid, JSON.stringify(style))
      return style
    }
    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Style.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await this.app.redis.get('cache').hdel("styles", uid)
      })
      await Promise.all(ps)
      return result
    }
  }
  return StyleService
}