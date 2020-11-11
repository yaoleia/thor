const moment = require('moment');

exports.relativeTime = time => moment(new Date(time)).fromNow();

exports.parseMsg = (action, payload = {}, metadata = {}) => {
  const meta = Object.assign({}, {
    ts: Date.now(),
  }, metadata)

  return {
    meta,
    data: {
      action,
      payload,
    },
  }
}