'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  router.resources('user', '/api/user', controller.user)
  router.resources('device', '/api/device', controller.device)
  router.resources('pattern', '/api/pattern', controller.pattern)
  router.resources('record', '/api/record', controller.record)
  router.post('/api/device/pattern', controller.device.setDevicePattern)
  router.post('/api/push', controller.pusher.index)
  router.post('/api/account/login', controller.account.postLogin)
  router.get('/api/account/logout', controller.account.logout)
  router.get('/api/currentUser', controller.account.show)
  router.put('/api/currentUser', controller.account.update)
  router.get('/api/download', controller.download.download);
  router.get('/api/download-image', controller.download.downloadImage);
  router.post('/api/upload', controller.upload.index);
  router.get('*', controller.home.index);

  io.of('/').route('chat', io.controller.chat.index);
  io.of('/').route('join', io.controller.room.join);
  io.of('/').route('leave', io.controller.room.leave);
};
