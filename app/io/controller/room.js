module.exports = app => {
  class Controller extends app.Controller {
    async join() {
      const { args, socket, app, helper } = this.ctx
      const message = args[0]
      if (!message) return
      await socket.join(message)
      await app.io.of('/').to(message).emit('res', helper.parseMsg('joined', {
        socket_id: socket.id,
        room: message
      }))
      await socket.emit('res', helper.parseMsg('rooms', {
        socket_id: socket.id,
        rooms: Object.keys(socket.rooms).filter(room => room !== socket.id)
      }))
    }

    async leave() {
      const { args, socket, helper } = this.ctx
      const message = args[0]
      if (!message) return
      await app.io.of('/').to(message).emit('res', helper.parseMsg('left', {
        socket_id: socket.id,
        room: message
      }))
      await socket.leave(message, () => {
        socket.emit('res', helper.parseMsg('rooms', {
          socket_id: socket.id,
          rooms: Object.keys(socket.rooms).filter(room => room !== socket.id)
        }))
      })
    }
  }
  return Controller
}