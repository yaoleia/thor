module.exports = async function (app) {
  const { redis, logger } = app
  const ctx = await app.createAnonymousContext();
  const [deviceResp, patternResp] = await Promise.all([
    ctx.service.device.index({}, false),
    ctx.service.pattern.index(),
    ctx.service.user.create({ username: "admin", auth: ["admin"] }, true),
    redis.get('cache').del('devices'),
    redis.get('cache').del('patterns')
  ])
  const devices = deviceResp.data || []
  const patterns = patternResp.data || []
  const deviceSet = devices.map(async device => {
    await redis.get('cache').hset('devices', device.uid, JSON.stringify(device))
    const llen = await redis.get('mq').llen(`list#${device.uid}`)
    if (llen) {
      app.messenger.sendToAgent('wait_msg', device.uid)
    }
  })
  const patternSet = patterns.map(async pattern => {
    await redis.get('cache').hset('patterns', pattern.uid, JSON.stringify(pattern))
  })
  await Promise.all([...deviceSet, ...patternSet])
  logger.info(`==================== Devices Did Ready (${devices.length}) ====================`)
  logger.info(`==================== Patterns Did Ready (${patterns.length}) ====================`)
}