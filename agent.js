const Subscriber = require('./lib/subscriber');

module.exports = agent => {
  // TODO: 维护长连接，redis/kafka...
  agent.messenger.once('egg-ready', () => {
    // agent.logger.info('init subscriber')
    const subscriber = new Subscriber()
    subscriber.on('changed', () => {
      agent.messenger.sendRandom('agent_msg', 'hello app!');
    })
  })
}