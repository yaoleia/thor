module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const message = this.ctx.args[0];
      await app.io.of('/').emit('res', `(chat) ${this.ctx.socket.id}: ${message}`)
    }
  }
  return Controller
}