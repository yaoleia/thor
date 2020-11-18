module.exports = app => {
  class RecordService extends app.Service {
    async index(params) {
      const records = await this.ctx.model.Record.find(params);
      const result = {};
      result.meta = { total: records.length };
      result.data = records;
      return result;
    }
    async show({ id }) {
      if (!id) { return };
      const records = await this.ctx.model.Record.find({ uid: id });
      return records[0];
    }
    async update({ id }, { uid, ...body }) {
      const result = await this.ctx.model.Record.findOneAndUpdate({ uid: id }, { $set: body });
      return result;
    }
    async create(request) {
      if (!request) { return };
      const result = await this.ctx.model.Record.create(request);
      return result;
    }
    async destroy(params) {
      const result = this.ctx.model.Record.remove({ "uid": { $in: params.id.split(',') } });
      return result;
    }
  }
  return RecordService;
};