const { urlFilter, urlJoin } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.static
  const StyleSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: v => v && v.valueOf() },
    name: { type: String },
    sample_image: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    size_model: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    size_md5: { type: String },
    defect_model: { type: String, set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    defect_md5: { type: String },
    defect_items: { type: String },
    size_standard: { type: Array }
  }, {
    versionKey: false
  })
  StyleSchema.index({ time: -1 })
  StyleSchema.plugin(mongooseLeanGetters)
  StyleSchema.set('toObject', { getters: true })
  return mongoose.model('Style', StyleSchema)
}