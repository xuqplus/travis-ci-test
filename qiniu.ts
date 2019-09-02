// 七牛私密参数
const {
  QINIU_ACCESS_KEY = 'bz9C65JrU372JEFriDZtYLvyfnc9_w1_vqKHXyNi',
  QINIU_SECRET_KEY = 'q2hlU2BJVa2iF30w_Anlox5qojh957BFw2suQ8Lx',
  QINIU_SCOPE = 'xuqplus2',
} = process.env

// 七牛oss当作cdn使用了
const qiniu = require('qiniu')

const mac = new qiniu.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
const options = { scope: QINIU_SCOPE }
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

const config = new qiniu.conf.Config()
// 空间对应的机房
// config.zone = qiniu.zone.Zone_z0 // 华东
// config.zone = qiniu.zone.Zone_z1 // 华北
config.zone = qiniu.zone.Zone_z2 // 华南
// config.zone = qiniu.zone.Zone_na0 // 北美

const formUploader = new qiniu.form_up.FormUploader(config)
// const localFile = 'dist/blog/favicon.png'
// const key = 'favicon.png'
// 文件上传
// formUploader.putFile(uploadToken, key, localFile, putExtra, (respErr, respBody, respInfo) => {
//   if (respErr) {
//     throw respErr
//   }
//   console.log(respBody)
//   if (respInfo.statusCode !== 200) {
//     throw new Error(respBody)
//   }
// })

const fs = require('fs')
const path = require('path')

const allFiles = ((dir, callback) => {
  fs.stat(dir, (error, stats) => {
    if (stats.isFile()) {
      callback(dir)
    }
    if (stats.isDirectory()) {
      fs.readdir(dir, ((err, files) => {
        files.forEach(filename => {
          allFiles(path.join(dir, filename), callback)
        })
      }))
    }
  })
})

allFiles('./dist', (filename) => {
  const localFile = filename
  const key = filename.replace(/\\/g, '/').replace(/^dist\//g, '')
  formUploader.putFile(uploadToken, key, localFile, null, (respErr, respBody, respInfo) => {
    if (respErr) {
      throw respErr
    }
    console.log(respBody)
    if (respInfo.statusCode !== 200) {
      throw new Error('七牛上传失败 qiniu upload failed')
    }
  })
})
