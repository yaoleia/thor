const moment = require('moment')
const { v4: uuidv4 } = require('uuid')

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

exports.getDate = (time = new Date().getTime()) => moment(new Date(time)).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')

exports.getRandomId = (len = 10) => parseInt((Math.random() * 9 + 1) * Math.pow(10, len - 1), 10)

exports.uuidv4 = uuidv4