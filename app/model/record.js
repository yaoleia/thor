module.exports = ({ mongoose }) => {
  const RecordSchema = new mongoose.Schema({
    uid: { type: Number, unique: true },
    image_url: { type: String },
    thumbnail_url: { type: String },
    device_id: { type: String },
    is_defect: { type: Boolean },
    time: { type: String },
    model: { type: String },
    defect_items: { type: Array },
    size_items: { type: Array }
  })

  return mongoose.model('Record', RecordSchema);
}