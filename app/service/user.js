module.exports = app => {
  class UserService extends app.Service {
    async index(query = {}) {
      let { start_date, end_date, limit = 0, offset = 0, ...params } = query
      offset = Number(offset)
      limit = Number(limit)
      const { getDateIfTime } = this.ctx.helper
      start_date = getDateIfTime(start_date)
      end_date = getDateIfTime(end_date)
      if (start_date || end_date) {
        params.time = {}
        start_date && (params.time["$gte"] = start_date)
        end_date && (params.time["$lt"] = end_date)
      }
      const [count, users] = await Promise.all([
        this.ctx.model.User.countDocuments(params),
        this.ctx.model.User.find(params, { _id: 0 }).skip(offset).limit(limit).sort([['time', -1]]).lean({ getters: true })
      ])
      const result = {}
      result.meta = { total: count, limit, offset }
      result.data = users
      return result
    }
    async show({ id }) {
      if (!id) { return };
      const users = await this.ctx.model.User.find({ username: id }, { _id: 0 }).lean({ getters: true })
      if (users[0]) return users[0]
      this.ctx.status = 400
      return `${id} 未找到用户信息`
    }
    async update({ id }, { username, ...body }) {
      if (body.password) {
        const len = body.password.length
        if (len < 5 || len > 20) {
          this.ctx.status = 400
          return {
            msg: "密码长度在5~20！"
          }
        }
      }
      const user = await this.ctx.model.User.findOneAndUpdate({ username: id }, { $set: body }, { new: true }).lean({ getters: true })
      if (!user) return
      delete user._id
      delete user.password
      return user
    }
    async create(request, init) {
      if (!request) { return };
      if (!request.username) {
        request.username = this.ctx.helper.uuidv4()
      }
      const nameLen = request.username.length
      if (nameLen < 5 || nameLen > 20) {
        this.ctx.status = 400
        return {
          msg: "用户名长度在5~20！"
        }
      }
      try {
        const result = await this.ctx.model.User.create(request)
        const user = result.toObject()
        delete user._id
        delete user.id
        delete user.password
        return user
      } catch (error) {
        !init && (this.ctx.status = 400)
        return {
          msg: "创建用户失败，用户名已存在！"
        }
      }
    }
    async destroy({ id }) {
      const users = id.split(',').filter(i => i !== 'admin')
      const result = await this.ctx.model.User.remove({ "username": { $in: users } });
      return result
    }
  }
  return UserService;
}