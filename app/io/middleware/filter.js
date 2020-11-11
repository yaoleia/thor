'use strict';

module.exports = () => {
  return async (ctx, next) => {
    // ctx.socket.emit('res', 'packet!' + ctx.packet[1] + ' filter!');
    await next();
  };
};