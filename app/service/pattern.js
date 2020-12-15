module.exports = app => {
  class PatternService extends app.Service {
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
      const [count, patterns] = await Promise.all([
        this.ctx.model.Pattern.countDocuments(params),
        this.ctx.model.Pattern.find(params, { _id: 0 }).skip(offset).limit(limit).sort([['time', -1]]).lean({ getters: true })
      ])
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = patterns
      return result
    }
    async show({ id }) {
      if (!id) { return }
      const patterns = await this.ctx.model.Pattern.find({ uid: id }, { _id: 0 }).lean({ getters: true })
      if (patterns[0]) return patterns[0]
      this.ctx.status = 400
      return `${id} 未找到模板信息`
    }
    async update({ id }, { uid, ...body }) {
      const pattern = await this.ctx.model.Pattern.findOneAndUpdate({ uid: id }, { $set: body }, { new: true }).lean({ getters: true })
      if (!pattern) return
      delete pattern._id
      await this.app.redis.get('cache').hset("patterns", id, JSON.stringify(pattern))
      return pattern
    }
    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Pattern.create(Object.assign(request, { uid }))
      const pattern = result.toObject()
      delete pattern._id
      delete pattern.id
      await this.app.redis.get('cache').hset("patterns", uid, JSON.stringify(pattern))
      return pattern
    }
    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Pattern.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await this.app.redis.get('cache').hdel("patterns", uid)
      })
      await Promise.all(ps)
      return result
    }
  }
  return PatternService
}