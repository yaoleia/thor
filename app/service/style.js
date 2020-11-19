module.exports = app => {
  class StyleService extends app.Service {
    async index(params) {
      const styles = await this.ctx.model.Style.find(params, { _id: 0 })
      const result = {}
      result.meta = { total: styles.length }
      result.data = styles
      return result
    }
    async show({ id }) {
      if (!id) { return }
      const styles = await this.ctx.model.Style.find({ uid: id }, { _id: 0 })
      return styles[0]
    }
    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Style.findOneAndUpdate({ uid: id }, { $set: body }, { new: true })
      return result
    }
    async create(request) {
      if (!request) { return }
      const result = await this.ctx.model.Style.create(Object.assign({}, request, { uid: this.ctx.helper.getRandomId() }))
      return result
    }
    async destroy(params) {
      const result = this.ctx.model.Style.remove({ "uid": { $in: params.id.split(',') } })
      return result
    }
  }
  return StyleService
}