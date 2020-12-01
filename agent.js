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
  async function startWaitMsg(key) {
    const listen = { switch: true }
    new Array(CONCURRENT).fill().forEach(async _ => {
      while (listen.switch) {
        try {
          const resp = await agent.redis.get('mq').brpop(key, 600)
          // 随机给一个worker消费一条队列信息
          if (!resp || !resp[1]) continue
          const msg = JSON.parse(resp[1])
          agent.messenger.sendRandom('handle_msg', msg)
          await new Promise((resolve, reject) => {
            agent.messenger.once(msg.uid, resolve)
          })
        } catch (error) {
          continue
        }
      }
    })
    return listen
  }

  agent.messenger.on('wait_msg', device_id => {
    if (msgMap[device_id]) return
    msgMap[device_id] = startWaitMsg(`list#${device_id}`)
  })

  agent.messenger.on('stop_wait', device_id => {
    if (!msgMap[device_id]) return
    msgMap[device_id].switch = false
    delete msgMap[device_id]
  })

  agent.messenger.once('egg-ready', async () => {
    agent.messenger.sendRandom('init-event')
  })
}