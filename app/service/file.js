const Service = require('egg').Service;
const path = require('path')
const moment = require('moment')
const mkdirp = require('mkdirp')
const fs = require('fs')
const request = require('request')
const pump = require('mz-modules/pump')

class FileService extends Service {
  getUploadDir(type) {
    const date = type || moment().format('YYYY/MM/DD')
    const uploadDir = path.resolve(this.app.config.UPLOAD_DIR, date)
    const baseUrl = path.join('public/upload', date)
    return {
      uploadDir,
      baseUrl
    }
  }

  async uploadUrl(ctx) {
    const { image_url, type } = ctx.request.body
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    if (image_url) {
      const suffix = path.basename(image_url).toLowerCase()
      const now = moment().format('YYYYMMDDHHmmss')
      const fileName = now + Math.floor(Math.random() * 1000) + suffix
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      if (image_url.startsWith('http')) {
        await pump(request(image_url), fs.createWriteStream(path.join(uploadDir, fileName)))
        images.push({ name: 'image_url', url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
      } else {
        const exists = fs.existsSync(image_url)
        if (exists) {
          fs.copyFileSync(image_url, path.join(uploadDir, fileName))
          images.push({ fieldname: 'image_url', url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
        }
      }
    }
    return images
  }

  async uploadFiles(ctx) {
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(ctx.request.body.type)
    const files = ctx.request.files;
    try {
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      for (const file of files) {
        const fileName = file.filename.toLowerCase();
        const targetPath = path.join(uploadDir, fileName);
        const source = fs.createReadStream(file.filepath);
        const target = fs.createWriteStream(targetPath);
        await pump(source, target);
        images.push({ fieldname: file.fieldname, url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
      }
    } finally {
      // delete those request tmp files
      await ctx.cleanupRequestFiles();
    }
    return images
  }

  async upload(ctx) {
    return [...await this.uploadUrl(ctx), ...await this.uploadFiles(ctx)]
  }
}

module.exports = FileService;