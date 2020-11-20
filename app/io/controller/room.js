module.exports = app => {
  class Controller extends app.Controller {
    async join() {
      const { args, socket, app } = this.ctx
      const message = args[0]
      if (!message) return
      await socket.join(message)
      await app.io.of('/').to(message).emit('res', `${socket.id} join ${message}`)
      const rooms = Object.keys(socket.rooms).filter(room => room !== socket.id)
      await socket.emit('res', JSON.stringify({ rooms }))
    }

    async leave() {
      const { args, socket } = this.ctx
      const message = args[0]
      if (!message) return
      await app.io.of('/').to(message).emit('res', `${socket.id} leave ${message}`)
      await socket.leave(message, () => {
        const rooms = Object.keys(socket.rooms).filter(room => room !== socket.id)
        socket.emit('res', JSON.stringify({ rooms }))
      })
    }
  }
  return Controller
}