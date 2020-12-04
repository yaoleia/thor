const { getDate, urlFilter, urlJoin } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.static
  const RecordSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: getDate },
    device: {
      uid: { type: String },
      name: { type: String },
      camera_server: { type: String },
      model_server: { type: String },
      ip: { type: String }
    },
    style: {
      uid: { type: String },
      name: { type: String },
      size_model: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
      size_md5: { type: String },
      defect_model: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
      defect_md5: { type: String },
      size_standard: { type: Array }
    },
    image_url: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    thumbnail_url: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    defect_items: { type: Array },
    size_items: { type: Array },
    defect_alarm: { type: Boolean },
    size_alarm: { type: Boolean }
  }, {
    versionKey: false
  })
  RecordSchema.plugin(mongooseLeanGetters)
  RecordSchema.set('toObject', { getters: true })
  return mongoose.model('Record', RecordSchema);
}