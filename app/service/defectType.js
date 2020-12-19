module.exports = app => {
  class DefectTypeService extends app.Service {
    async index(query = {}) {
      const [count, types] = await Promise.all([
        this.ctx.model.DefectType.countDocuments(query),
        this.ctx.model.DefectType.find(query, { _id: 0 }).sort([['time', -1]]).lean({ getters: true })
      ])
      const result = {}
      result.meta = { total: count }
      result.data = types
      return result
    }
    async update({ id }, { uid, ...body }) {
      try {
        const type = await this.ctx.model.DefectType.findOneAndUpdate({ uid: id }, { $set: body }, { new: true }).lean({ getters: true })
        if (!type) return
        delete type._id
        return type
      } catch (error) {
        this.ctx.status = 400
        return {
          msg: `${id} 缺陷类型修改失败！`,
          info: error && error.keyValue
        }
      }
    }
    async create(request) {
      if (!request) return
      try {
        const uid = this.ctx.helper.getRandomId()
        const result = await this.ctx.model.DefectType.create(Object.assign(request, { uid }))
        const type = result.toObject()
        delete type._id
        delete type.id
        return type
      } catch (error) {
        this.ctx.status = 400
        return {
          msg: `缺陷类型创建失败！`,
          info: error && error.keyValue
        }
      }
    }
    async destroy(params) {
      const uids = params.id.split(',')
      const result = await this.ctx.model.DefectType.remove({ "uid": { $in: uids } })
      return result
    }
  }
  return DefectTypeService
}