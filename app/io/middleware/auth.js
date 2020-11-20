'use strict';

module.exports = () => {
  return async function (ctx, next) {
    const { socket, logger } = ctx;
    const id = socket.id;
    const query = socket.handshake.query;
    // 用户信息
    const { rooms = [] } = query;

    // const tick = async (id, msg) => {
    //   logger.debug('#tick', id, msg);
    //   // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
    //   await socket.disconnect(true)
    // }
    // const username = ctx.session.username;
    // if (!username) {
    //   // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
    //   tick(id, 'auth error')
    //   return
    // }
    logger.debug('#user_info', id, rooms);

    // 用户加入
    await socket.join(rooms)

    await next();

    // 用户离开
    logger.debug('#leave', id);
  }
}
