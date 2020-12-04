const Service = require('egg').Service
const path = require('path')
const moment = require('moment')
const mkdirp = require('mkdirp')
const fs = require('fs')
const request = require('request')
const pump = require('mz-modules/pump')
const sharp = require('sharp')
const crypto = require('crypto')
const imageTypes = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]

class FileService extends Service {
  getUploadDir(type) {
    const { baseDir, config: { static: { baseUrl, prefix }, upload: { prefix: uPrefix } } } = this.app
    const folder = path.join(uPrefix, type || moment().format('YYYY/MM/DD'))
    return {
      uploadDir: path.join(baseDir, prefix, folder),
      baseUrl,
      folder,
      prefix,
      baseDir
    }
  }

  async uploadUrl({ file_url, image_url, type, quality, md5 } = this.ctx.request.body) {
    file_url = file_url || image_url
    const uploaded = []
    try {
      if (file_url) {
        file_url = file_url.toLowerCase()
        const { uploadDir, baseUrl, folder, prefix, baseDir } = this.getUploadDir(type)
        const extname = path.extname(file_url)
        const now = moment().format('YYYYMMDDHHmmss')
        let fileName = now + this.ctx.helper.getRandomId(3) + extname
        let sharpFilter, hash
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
          md5 && await pump(fs.createReadStream(local_path), hash = crypto.createHash('md5'))
          uploaded.push({
            name: 'file_url',
            url: `${baseUrl}/${folder}/${fileName}`,
            md5: hash && hash.digest('hex')
          })
        } else {
          file_url = decodeURI(file_url)
          let exists = fs.existsSync(file_url)
          if (!exists) {
            // windows/linux路径处理
            const pathArr = file_url.indexOf('\\') !== -1 ? file_url.split('\\') : file_url.split('/')
            const index = pathArr.indexOf(prefix.replace('/', ''))
            if (index !== -1) {
              pathArr.splice(0, index, baseDir)
              file_url = path.join(...pathArr)
            }
            exists = fs.existsSync(file_url)
          }
          if (exists) {
            const params = [fs.createReadStream(file_url), fs.createWriteStream(local_path)]
            sharpFilter && params.splice(1, 0, sharpFilter)
            await pump(...params)
            md5 && await pump(fs.createReadStream(local_path), hash = crypto.createHash('md5'))
            uploaded.push({
              fieldname: 'file_url',
              url: `${baseUrl}/${folder}/${fileName}`,
              original_url: this._getLocalUrl(file_url, baseUrl, prefix),
              md5: hash && hash.digest('hex')
            })
          }
        }
      }
    } catch (error) {
      this.ctx.logger.error(error)
    }
    return uploaded
  }

  _getLocalUrl(url, base = '', prefix = '/public') {
    const index = url.indexOf(prefix)
    if (index === -1) return url
    return url.replace(url.substring(0, index + prefix.length), base)
  }

  async uploadFiles({ type, quality, md5 } = this.ctx.request.body) {
    const uploaded = []
    const { uploadDir, baseUrl, folder } = this.getUploadDir(type)
    const { files = [] } = this.ctx.request;
    try {
      if (!fs.existsSync(uploadDir)) mkdirp.sync(uploadDir)
      for (const file of files) {
        let fileName = file.filename.toLowerCase()
        let sharpFilter, hash
        const extname = path.extname(fileName)
        if (typeof quality === "number" && imageTypes.indexOf(extname) !== -1) {
          fileName = fileName.replace(extname, '.jpg')
          sharpFilter = sharp().jpeg({ quality })
        }
        const local_path = path.join(uploadDir, fileName);
        const params = [fs.createReadStream(file.filepath), fs.createWriteStream(local_path)]
        sharpFilter && params.splice(1, 0, sharpFilter)
        await pump(...params)
        md5 && await pump(fs.createReadStream(local_path), hash = crypto.createHash('md5'))
        uploaded.push({
          fieldname: file.fieldname,
          url: `${baseUrl}/${folder}/${fileName}`,
          md5: hash && hash.digest('hex')
        })
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
    const num = Number(json.quality)
    if (Number.isNaN(num)) {
      delete json.quality
    } else {
      json.quality = num
    }
    return [...await this.uploadUrl(json), ...await this.uploadFiles(json)]
  }
}

module.exports = FileService;