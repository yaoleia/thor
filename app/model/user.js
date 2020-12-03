const { getDate } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.upload
  const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: getDate },
    password: { type: String, default: '123456' },
    avatar: { type: String, default: '', get: v => v && `${baseUrl}/${v}` },
    nickname: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    auth: [String]
  }, {
    versionKey: false
  })
  UserSchema.plugin(mongooseLeanGetters)
  UserSchema.set('toObject', { getters: true })
  return mongoose.model('User', UserSchema)
}