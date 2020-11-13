const Service = require('egg').Service;
const crypto = require('crypto')
const path = require('path')
const moment = require('moment')
const mkdirp = require('mkdirp')
const fs = require('fs')
const request = require('request')
const pump = require('mz-modules/pump')

class FileService extends Service {
  async upload({ file, image_url, type }) {
    let hasImage = false
    if (image_url) {
      const suffix = path.basename(image_url)
      const hash = crypto.createHash('md5')
      const now = type || (new Date()).getTime()
      const fileName = hash.update(now + Math.random().toString()).digest('hex') + suffix
      const date = moment().format('YYYY/MM/DD')
      const uploadDir = path.resolve(this.app.config.UPLOAD_DIR, date)
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      if (image_url.startsWith('http')) {
        await pump(request(image_url), fs.createWriteStream(path.join(uploadDir, fileName)))
        hasImage = true
      } else {
        const exists = fs.existsSync(image_url)
        if (exists) {
          fs.copyFileSync(image_url, path.join(uploadDir, fileName))
          hasImage = true
        }
      }
      if (hasImage) return new URL(path.join('public/upload', date, fileName), this.ctx.request.origin).href;
    }
    return ''
  }
}

module.exports = FileService;