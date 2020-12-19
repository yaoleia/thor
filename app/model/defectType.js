module.exports = ({ mongoose }) => {
  const DefectTypeSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    field: { type: String, unique: true },
    time: { type: Date, default: Date.now },
    name: { type: String },
    color: { type: String },
  }, {
    versionKey: false
  })
  return mongoose.model('DefectType', DefectTypeSchema)
}