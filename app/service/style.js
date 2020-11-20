module.exports = app => {
  class StyleService extends app.Service {
    async index(params) {
      const styles = await this.ctx.model.Style.find(params, { _id: 0 }, { lean: true })
      const result = {}
      result.meta = { total: styles.length }
      result.data = styles
      return result
    }
    async show({ id }) {
      if (!id) { return }
      const styles = await this.ctx.model.Style.find({ uid: id }, { _id: 0 }, { lean: true })
      return styles[0]
    }
    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Style.findOneAndUpdate({ uid: id }, { $set: body }, { new: true })
      if (!result) return
      const style = result.toObject()
      delete style._id
      await this.app.redis.hset("styles", id, JSON.stringify(style))
      return style
    }
    async create(request) {
      if (!request) { return }
      const uid = this.ctx.helper.getRandomId()
      const result = await this.ctx.model.Style.create(Object.assign(request, { uid }))
      const style = result.toObject()
      delete style._id
      await this.app.redis.hset("styles", uid, JSON.stringify(style))
      return style
    }
    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.Style.remove({ "uid": { $in: uids } })
      const ps = uids.map(async uid => {
        await this.app.redis.hdel("styles", uid)
      })
      await Promise.all(ps)
      return result
    }
  }
  return StyleService
}