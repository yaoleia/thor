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

  async uploadUrl({ file_url, image_url, type, quality } = this.ctx.request.body) {
    file_url = file_url || image_url
    const uploaded = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    if (file_url) {
      const extname = path.extname(file_url)
      const now = moment().format('YYYYMMDDHHmmss')
      let fileName = now + Math.floor(Math.random() * 1000) + extname
      let sharpFilter = null
      if (typeof quality === "number" && imageTypes.indexOf(extname) !== -1) {
        fileName = fileName.replace(extname, '.jpg')
        sharpFilter = sharp().jpeg({ quality })
      }
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      const local_path = path.join(uploadDir, fileName)
      if (file_url.startsWith('http')) {
        const params = [request(file_url), fs.createWriteStream(local_path)]
        sharpFilter && params.splice(1, 0, sharpFilter)
        await pump(...params)
        uploaded.push({ name: 'file_url', url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
      } else {
        const exists = fs.existsSync(file_url)
        if (exists) {
          const params = [fs.createReadStream(file_url), fs.createWriteStream(local_path)]
          sharpFilter && params.splice(1, 0, sharpFilter)
          await pump(...params)
          uploaded.push({ fieldname: 'file_url', url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
        }
      }
    }
    return uploaded
  }

  async uploadFiles({ type, quality } = this.ctx.request.body) {
    const uploaded = []
    const { uploadDir, baseUrl } = this.getUploadDir(type)
    const { files = [] } = this.ctx.request;
    try {
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      for (const file of files) {
        let fileName = file.filename.toLowerCase();
        let sharpFilter = null
        const extname = path.extname(fileName)
        if (typeof quality === "number" && imageTypes.indexOf(extname) !== -1) {
          fileName = fileName.replace(extname, '.jpg')
          sharpFilter = sharp().jpeg({ quality })
        }
        const local_path = path.join(uploadDir, fileName);
        const params = [fs.createReadStream(file.filepath), fs.createWriteStream(local_path)]
        sharpFilter && params.splice(1, 0, sharpFilter)

        await pump(...params)
        uploaded.push({ fieldname: file.fieldname, url: new URL(path.join(baseUrl, fileName), this.ctx.request.origin).href, local_path })
      }
    } catch (err) {
      this.ctx.logger.error(err)
    } finally {
      // delete those request tmp files
      await this.ctx.cleanupRequestFiles();
    }
    return uploaded
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