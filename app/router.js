'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/account/login', controller.account.postLogin)
  router.get('/api/account/logout', controller.account.logout)
  router.get('/api/download', controller.download.download);
  router.get('/api/download-image', controller.download.downloadImage);
  router.all('/api/*', controller.mock.proxy);
  router.get('*', controller.home.index);
  
};
