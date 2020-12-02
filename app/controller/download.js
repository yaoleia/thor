'use strict'

const path = require('path')
const fs = require('fs')
const mime = require('mime-types')
const Controller = require('egg').Controller

class DownloadController extends Controller {
  async download() {
    const filePath = path.resolve(__dirname, '../public', 'hello.txt')
    this.ctx.attachment('hello.txt')
    this.ctx.set('Content-Type', 'application/octet-stream')
    this.ctx.body = fs.createReadStream(filePath)
  }

  async downloadImage() {
    const { path: filePath } = this.ctx.query
    if (!filePath) return
    const exist = fs.existsSync(filePath)
    if (!exist) return
    const file = fs.readFileSync(filePath)
    const mimeType = mime.lookup(filePath)
    this.ctx.set('content-type', mimeType)
    this.ctx.body = file
  }
}

module.exports = DownloadController
