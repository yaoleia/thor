module.exports = async function (app) {
  const { redis, logger } = app
  const ctx = await app.createAnonymousContext();
  const [deviceResp, styleResp] = await Promise.all([
    ctx.service.device.index(),
    ctx.service.style.index(),
    redis.del('devices'),
    redis.del('styles')
  ])
  const devices = deviceResp.data || []
  const styles = styleResp.data || []
  const deviceSet = devices.map(async device => {
    await redis.hset('devices', device.uid, JSON.stringify(device))
  })
  const styleSet = styles.map(async style => {
    await redis.hset('styles', style.uid, JSON.stringify(style))
  })
  await Promise.all([...deviceSet, ...styleSet])
  logger.info(`==================== Devices Did Ready (${devices.length}) ====================`)
  logger.info(`==================== Styles Did Ready (${styles.length}) ====================`)
}