const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose }) => {
  const DeviceSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: v => v && v.valueOf() },
    name: { type: String },
    camera_server: { type: String },
    model_server: { type: String },
    ip: { type: String }
  }, {
    versionKey: false
  })
  DeviceSchema.plugin(mongooseLeanGetters)
  DeviceSchema.set('toObject', { getters: true })
  return mongoose.model('Device', DeviceSchema);
}