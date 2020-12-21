/*
const Subscriber = require('./lib/subscriber');
module.exports = agent => {
  agent.messenger.once('egg-ready', async () => {
    agent.messenger.sendRandom('init-event')
    agent.logger.info('init subscriber')
    const subscriber = new Subscriber()
    subscriber.on('changed', () => {
      agent.messenger.sendRandom('agent_msg', 'hello app!');
    })
  })
}
*/
module.exports = agent => {
  const { CONCURRENT = 1 } = agent.config
  const msgMap = {}

  function stopWaitMsg(device_id) {
    if (!msgMap[device_id]) return
    msgMap[device_id].switch = false
    msgMap[device_id].clients.forEach(client => client.quit())
    delete msgMap[device_id]
  }

  function startWaitMsg(device_id) {
    const key = `list#${device_id}`
    const clients = []
    const handle = { switch: true, clients }
    const mqRedis = agent.redis.get('mq')
    let retry = 10
    new Array(CONCURRENT).fill().forEach(async _ => {
      const redis = mqRedis.duplicate()
      clients.push(redis)
      while (handle.switch) {
        try {
          const resp = await redis.brpop(key, 5 * 60)
          // 随机给一个worker消费一条队列信息
          if (!resp || !resp[1]) throw 'timeout or data error!'
          if (!handle.switch) {
            await mqRedis.lpush(...resp)
            throw 'closed listen, pass this msg!'
          }
          await new Promise((resolve, reject) => {
            retry = 10
            const msg = JSON.parse(resp[1])
            const timer = setTimeout(() => {
              agent.messenger.off(msg.uid)
              resolve()
            }, 20000);
            agent.messenger.once(msg.uid, () => {
              clearTimeout(timer)
              resolve()
            })
            agent.messenger.sendRandom('handle_msg', msg)
          })
        } catch (error) {
          if (--retry < 0) {
            stopWaitMsg(device_id)
            break
          }
          continue
        }
      }
    })
    return handle
  }

  agent.messenger.on('wait_msg', device_id => {
    if (msgMap[device_id]) return
    msgMap[device_id] = startWaitMsg(device_id)
  })

  agent.messenger.on('stop_wait', stopWaitMsg)

  agent.messenger.once('egg-ready', async () => {
    agent.messenger.sendRandom('init-event')
  })
}