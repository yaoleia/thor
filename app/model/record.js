module.exports = ({ mongoose }) => {
  const RecordSchema = new mongoose.Schema({
    uid: { type: Number, unique: true },
    time: { type: String },
    device_id: { type: String },
    image_url: { type: String },
    thumbnail_url: { type: String },
    defect_items: { type: Array },
    size_items: { type: Array },
    is_defect: { type: Boolean }
  }, {
    versionKey: false
  })

  return mongoose.model('Record', RecordSchema);
}