const moment = require('moment-timezone')
const { v4: uuidv4 } = require('uuid')

const getDate = (time = new Date().getTime(), format = 'YYYY-MM-DD HH:mm:ss') => moment(new Date(time)).tz('Asia/Shanghai').format(format)

exports.getDate = getDate

exports.parseMsg = (action, payload = {}, metadata = {}) => {
  const meta = Object.assign({}, {
    time: getDate(),
  }, metadata)
  return {
    meta,
    data: {
      action,
      payload,
    }
  }
}

exports.getDateIfTime = time => {
  if (!isNaN(Number(time))) {
    time = Number(time)
  } else if (!isNaN(Date.parse(time))) {
    time = Date.parse(time)
  } else {
    time = undefined
  }
  return time && getDate(time)
}

exports.getRandomId = (len = 10) => parseInt((Math.random() * 9 + 1) * Math.pow(10, len - 1), 10)

exports.uuidv4 = uuidv4

exports.urlFilter = (url, base) => {
  if (!url || !base) return url
  return url.replace(`${base}/`, '')
}

exports.urlJoin = (url, base) => {
  if (!url || !base || url.startsWith('http:')) return url
  return `${base}/${url}`
}