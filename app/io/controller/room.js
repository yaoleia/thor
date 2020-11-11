const room = 'default_room';
module.exports = app => {
  class Controller extends app.Controller {
    async join() {
      const { args, socket, app } = this.ctx
      const message = args[0] || room;
      await socket.join(message)
      await app.io.of('/').to(message).emit('res', `${socket.id} join ${message}`)
        .emit('res', JSON.stringify({
          rooms: Object.keys(socket.rooms)
        }))
    }

    async leave() {
      const { args, socket } = this.ctx
      const message = args[0] || room
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