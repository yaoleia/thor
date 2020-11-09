'use strict';

module.exports = () => {
  return async function auth(ctx, next) {
    if (ctx.session.username) {
      await next();
    } else {
      if (ctx.url.startsWith('/api/account') || ctx.url === '/') {
        await next()
      } else {
        ctx.status = 401;
      }
    }
  };
};
