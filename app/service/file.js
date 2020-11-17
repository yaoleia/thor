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
    const baseUrl = path.join('public/upload', date)
    const uploadDir = path.resolve(this.app.baseDir, baseUrl)
    return {
      uploadDir,
      baseUrl
    }
  }

  async uploadUrl({ image_url, type, quality } = this.ctx.request.body) {
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    if (image_url) {
      const extname = path.extname(image_url)
      if (imageTypes.indexOf(extname) === -1) {
        return images
      }
      const now = moment().format('YYYYMMDDHHmmss')
      let fileName = now + Math.floor(Math.random() * 1000) + extname
      if (typeof quality === "number") {
        fileName = fileName.replace(extname, '.jpg')
      }
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      const local_path = path.join(uploadDir, fileName)
      if (image_url.startsWith('http')) {
        const params = [request(image_url), fs.createWriteStream(local_path)]
        if (typeof quality === "number") {
          params.splice(1, 0, sharp().jpeg({ quality }))
        }
        await pump(...params)
        images.push({ name: 'image_url', url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
      } else {
        const exists = fs.existsSync(image_url)
        if (exists) {
          const params = [fs.createReadStream(image_url), fs.createWriteStream(local_path)]
          if (typeof quality === "number") {
            params.splice(1, 0, sharp().jpeg({ quality }))
          }
          await pump(...params)
          images.push({ fieldname: 'image_url', url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
        }
      }
    }
    return images
  }

  async uploadFiles({ type, quality } = this.ctx.request.body) {
    const images = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    const { files = [] } = this.ctx.request;
    try {
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      for (const file of files) {
        let fileName = file.filename.toLowerCase();
        const extname = path.extname(fileName)
        if (imageTypes.indexOf(extname) === -1) continue
        if (typeof quality === "number") {
          fileName = fileName.replace(extname, '.jpg')
        }
        const local_path = path.join(uploadDir, fileName);
        const params = [fs.createReadStream(file.filepath), fs.createWriteStream(local_path)]
        if (typeof quality === "number") {
          params.splice(1, 0, sharp().jpeg({ quality }))
        }
        await pump(...params)
        images.push({ fieldname: file.fieldname, url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
      }
    } catch (err) {
      this.ctx.logger.error(err)
    } finally {
      // delete those request tmp files
      await this.ctx.cleanupRequestFiles();
    }
    return images
  }

  async upload(json = this.ctx.request.body) {
    if (Number.isNaN(Number(json.quality))) {
      delete json.quality
    } else {
      json.quality = json.quality - 0
    }
    return [...await this.uploadUrl(json), ...await this.uploadFiles(json)]
  }
}

module.exports = FileService;