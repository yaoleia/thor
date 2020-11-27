'use strict';

module.exports = () => {
  return async function auth(ctx, next) {
    if (ctx.url.startsWith('/api/account') || ctx.url.startsWith('/api/push') || ctx.url === '/') {
      await next()
      return
    }
    const { username } = ctx.session
    if (username) {
      const user = await ctx.service.user.show({ id: username })
      if (user) {
        await next()
        return
      }
    }
    ctx.status = 401;
  }
};
