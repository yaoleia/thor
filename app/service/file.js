const Service = require('egg').Service;
const path = require('path')
const moment = require('moment')
const mkdirp = require('mkdirp')
const fs = require('fs')
const request = require('request')
const pump = require('mz-modules/pump')
const sharp = require('sharp');
const imageTypes = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]

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
    const { image_url, type, quality } = ctx.request.body
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    if (image_url) {
      const suffix = path.basename(image_url).toLowerCase()
      if (imageTypes.indexOf(path.extname(suffix)) === -1) {
        return images
      }
      const now = moment().format('YYYYMMDDHHmmss')
      let fileName = now + Math.floor(Math.random() * 1000) + suffix
      if (typeof quality === "number") {
        fileName = fileName.replace(path.extname(fileName), '.jpg')
      }
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      if (image_url.startsWith('http')) {
        const params = [request(image_url), fs.createWriteStream(path.join(uploadDir, fileName))]
        if (typeof quality === "number") {
          params.splice(1, 0, sharp().jpeg({ quality }))
        }
        await pump(...params)
        images.push({ name: 'image_url', url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
      } else {
        const exists = fs.existsSync(image_url)
        if (exists) {
          const params = [fs.createReadStream(image_url), fs.createWriteStream(path.join(uploadDir, fileName))]
          if (typeof quality === "number") {
            params.splice(1, 0, sharp().jpeg({ quality }))
          }
          await pump(...params)
          images.push({ fieldname: 'image_url', url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
        }
      }
    }
    return images
  }

  async uploadFiles(ctx) {
    const { type, quality } = ctx.request.body
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    const files = ctx.request.files;
    try {
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      for (const file of files) {
        let fileName = file.filename.toLowerCase();
        if (imageTypes.indexOf(path.extname(fileName)) === -1) continue
        if (typeof quality === "number") {
          fileName = fileName.replace(path.extname(fileName), '.jpg')
        }
        const targetPath = path.join(uploadDir, fileName);
        const params = [fs.createReadStream(file.filepath), fs.createWriteStream(targetPath)]
        if (typeof quality === "number") {
          params.splice(1, 0, sharp().jpeg({ quality }))
        }
        await pump(...params)
        images.push({ fieldname: file.fieldname, url: new URL(path.join(baseUrl, fileName), ctx.request.origin).href })
      }
    } catch (err) {
      ctx.logger.error(err)
    } finally {
      // delete those request tmp files
      await ctx.cleanupRequestFiles();
    }
    return images
  }

  async upload(ctx) {
    const body = ctx.request.body
    if (Number.isNaN(Number(body.quality))) {
      delete body.quality
    } else {
      body.quality = body.quality - 0
    }
    return [...await this.uploadUrl(ctx), ...await this.uploadFiles(ctx)]
  }
}

module.exports = FileService;