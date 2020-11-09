'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/account/login', controller.home.postLogin)
  router.get('/api/account/logout', controller.home.logout)
  router.all('/api/*', controller.home.proxy);
  router.get('*', controller.home.index);

};
