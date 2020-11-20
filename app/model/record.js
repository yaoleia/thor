module.exports = ({ mongoose }) => {
  const RecordSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    time: { type: String },
    device: { type: Object },
    style: { type: Object },
    image_url: { type: String },
    thumbnail_url: { type: String },
    defect_items: { type: Array },
    size_items: { type: Array },
    defect_alarm: { type: Boolean },
    size_alarm: { type: Boolean }
  }, {
    versionKey: false
  })

  return mongoose.model('Record', RecordSchema);
}