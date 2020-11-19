module.exports = ({ mongoose }) => {
  const StyleSchema = new mongoose.Schema({
    uid: { type: Number, unique: true },
    name: { type: String },
    size_model: { type: String },
    size_md5: { type: String },
    defect_model: { type: String },
    defect_md5: { type: String },
    defect_items: { type: String },
    size_standard: { type: Array }
  })

  return mongoose.model('Style', StyleSchema);
}