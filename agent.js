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
    delete msgMap[device_id]
  }

  function startWaitMsg(device_id) {
    const key = `list#${device_id}`
    const listen = { switch: true }
    let retry = 10
    new Array(CONCURRENT).fill().forEach(async _ => {
      while (listen.switch) {
        try {
          const redis = agent.redis.get('mq')
          const resp = await redis.brpop(key, 600)
          // 随机给一个worker消费一条队列信息
          if (!resp || !resp[1]) throw 'timeout or data error!'
          if (!listen.switch) {
            await redis.lpush(...resp)
            throw 'closed listen, pass this msg!'
          }
          await new Promise((resolve, reject) => {
            retry = 10
            const msg = JSON.parse(resp[1])
            agent.messenger.sendRandom('handle_msg', msg)
            agent.messenger.once(msg.uid, resolve)
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
    return listen
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