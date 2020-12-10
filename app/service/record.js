module.exports = app => {
  class RecordService extends app.Service {
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
      const [count, records] = await Promise.all([
        this.ctx.model.Record.countDocuments(params),
        this.ctx.model.Record.find(params, { _id: 0, defect_items: 0, size_items: 0 }).skip(offset).limit(limit).sort({ time: -1 }).lean({ getters: true })
      ])
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = records
      return result
    }
    async show({ id }) {
      if (!id) { return };
      const records = await this.ctx.model.Record.find({ uid: id }, { _id: 0 }).lean({ getters: true })
      return records[0];
    }
    async update({ id }, { uid, ...body }) {
      const record = await this.ctx.model.Record.findOneAndUpdate({ uid: id }, { $set: body }, { new: true }).lean({ getters: true })
      if (!record) return
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
      delete record.id
      return record
    }
    async destroy({ id }) {
      const result = await this.ctx.model.Record.remove({ "uid": { $in: id.split(',') } });
      return result
    }
  }
  return RecordService;
}