module.exports = ({ mongoose }) => {
  const StyleSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: Date, default: Date.now },
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

  return mongoose.model('Style', StyleSchema);
}