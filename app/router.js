'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  router.resources('device', '/api/device', controller.device)
  router.resources('style', '/api/style', controller.style)
  router.resources('record', '/api/record', controller.record)
  router.post('/api/device/style', controller.device.setDeviceStyle)
  router.post('/api/push', controller.pusher.index)
  router.post('/api/account/login', controller.account.postLogin)
  router.get('/api/account/logout', controller.account.logout)
  router.get('/api/currentUser', controller.user.currentUser)
  router.get('/api/download', controller.download.download);
  router.get('/api/download-image', controller.download.downloadImage);
  router.post('/api/upload', controller.upload.index);
  router.all('/api/*', controller.mock.proxy);
  router.get('*', controller.home.index);

  io.of('/').route('chat', io.controller.chat.index);
  io.of('/').route('join', io.controller.room.join);
  io.of('/').route('leave', io.controller.room.leave);
};
