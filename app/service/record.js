module.exports = app => {
  class RecordService extends app.Service {
    async index(query = {}) {
      let { limit = 0, offset = 0, ...params } = query
      offset = Number(offset)
      limit = Number(limit)
      const count = await this.ctx.model.Record.countDocuments(params)
      const records = await this.ctx.model.Record.find(params, { _id: 0 }, { lean: true }).skip(offset).limit(limit).sort([['time', -1]])
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = records
      return result
    }
    async show({ id }) {
      if (!id) { return };
      const records = await this.ctx.model.Record.find({ uid: id }, { _id: 0 }, { lean: true });
      return records[0];
    }
    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Record.findOneAndUpdate({ uid: id }, { $set: body }, { new: true });
      if (!result) return
      const record = result.toObject()
      delete record._id
      return record
    }
    async create(request) {
      if (!request) { return };
      if (!request.uid) {
        request.uid = this.ctx.helper.uuidv4()
      }
      const result = await this.ctx.model.Record.create(request)
      const record = result.toObject()
      delete record._id
      return record
    }
    async destroy({ id }) {
      const result = await this.ctx.model.Record.remove({ "uid": { $in: id.split(',') } });
      return result
    }
  }
  return RecordService;
}