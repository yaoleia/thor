const { getDate } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.upload
  const StyleSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: getDate },
    name: { type: String },
    sample_image: { type: String, get: v => v && `${baseUrl}/${v}` },
    size_model: { type: String, get: v => v && `${baseUrl}/${v}` },
    size_md5: { type: String },
    defect_model: { type: String, get: v => v && `${baseUrl}/${v}` },
    defect_md5: { type: String },
    defect_items: { type: String },
    size_standard: { type: Array }
  }, {
    versionKey: false
  })
  StyleSchema.plugin(mongooseLeanGetters)
  StyleSchema.set('toObject', { getters: true })
  return mongoose.model('Style', StyleSchema)
}