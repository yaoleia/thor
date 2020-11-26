module.exports = ({ mongoose }) => {
  const DeviceSchema = new mongoose.Schema({
    uid: { type: Number, unique: true },
    time: { type: Date, default: Date.now },
    name: { type: String },
    camera_server: { type: String },
    model_server: { type: String },
    ip: { type: String }
  }, {
    versionKey: false
  })

  return mongoose.model('Device', DeviceSchema);
}