module.exports = agent => {
  // TODO: 维护长连接，redis/kafka...
  agent.messenger.once('egg-ready', () => {
    agent.messenger.sendRandom('agent_msg', 'hello app!');
  })
}