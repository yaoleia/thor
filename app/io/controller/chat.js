module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const { args, helper, socket } = this.ctx
      const message = args[0];
      await app.io.of('/').emit('res', helper.parseMsg('chat', {
        socket_id: socket.id,
        msg: message
      }))
    }
  }
  return Controller
}