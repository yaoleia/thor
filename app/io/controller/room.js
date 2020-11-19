module.exports = app => {
  class Controller extends app.Controller {
    async join() {
      const { args, socket, app } = this.ctx
      const message = args[0]
      if (!message) return
      await socket.join(message)
      await app.io.of('/').to(message).emit('res', `${socket.id} join ${message}`)
      await socket.emit('res', JSON.stringify({
        rooms: Object.keys(socket.rooms)
      }))
    }

    async leave() {
      const { args, socket } = this.ctx
      const message = args[0]
      if (!message) return
      await app.io.of('/').to(message).emit('res', `${socket.id} leave ${message}`)
      await socket.leave(message, () => {
        socket.emit('res', JSON.stringify({
          rooms: Object.keys(socket.rooms)
        }))
      })
    }
  }
  return Controller
}