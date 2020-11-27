const { getDate } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose }) => {
  const StyleSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: getDate },
    name: { type: String },
    size_model: { type: String },
    size_md5: { type: String },
    defect_model: { type: String },
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