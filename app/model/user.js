const { urlFilter, urlJoin } = require('../extend/helper')
const mongooseLeanGetters = require('mongoose-lean-getters')
module.exports = ({ mongoose, config }) => {
  const { baseUrl } = config.static
  const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    time: { type: Date, default: Date.now, get: v => v && v.valueOf() },
    password: { type: String, default: '123456' },
    avatar: { type: String, default: '', set: v => urlFilter(v, baseUrl), get: v => urlJoin(v, baseUrl) },
    nickname: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    auth: [String]
  }, {
    versionKey: false
  })
  UserSchema.index({ time: -1 })
  UserSchema.plugin(mongooseLeanGetters)
  UserSchema.set('toObject', { getters: true })
  return mongoose.model('User', UserSchema)
}