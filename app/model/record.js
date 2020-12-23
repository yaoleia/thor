const { urlFilter, urlJoin, uuidv4 } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.static
  const RecordSchema = new mongoose.Schema({
    uid: { type: String, default: uuidv4, unique: true },
    time: { type: Date, index: -1, default: Date.now, get: v => v && v.valueOf() },
    device: {
      uid: { type: String, index: true },
      name: { type: String },
      camera_server: { type: String },
      model_server: { type: String },
      ip: { type: String }
    },
    pattern: {
      uid: { type: String, index: true },
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
    defect_alarm: { type: Boolean, index: true },
    size_alarm: { type: Boolean, index: true }
  }, {
    versionKey: false
  })

  RecordSchema.index({ time: -1, "device.uid": 1 })
  RecordSchema.index({ time: -1, "pattern.uid": 1 })
  RecordSchema.index({ time: -1, defect_alarm: 1 })
  RecordSchema.index({ time: -1, size_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, "pattern.uid": 1 })
  RecordSchema.index({ "device.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, size_alarm: 1 })
  RecordSchema.index({ "pattern.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ "pattern.uid": 1, size_alarm: 1 })
  RecordSchema.index({ defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, "pattern.uid": 1 })
  RecordSchema.index({ time: -1, "pattern.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ time: -1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "pattern.uid": 1, size_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, "pattern.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, "pattern.uid": 1, size_alarm: 1 })
  RecordSchema.index({ "pattern.uid": 1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, "pattern.uid": 1, defect_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, "pattern.uid": 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "pattern.uid": 1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ "device.uid": 1, "pattern.uid": 1, defect_alarm: 1, size_alarm: 1 })
  RecordSchema.index({ time: -1, "device.uid": 1, "pattern.uid": 1, defect_alarm: 1, size_alarm: 1 })

  RecordSchema.plugin(mongooseLeanGetters)
  RecordSchema.set('toObject', { getters: true })
  return mongoose.model('Record', RecordSchema);
}