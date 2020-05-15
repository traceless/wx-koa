let serverPath = 'https://mini.youcompany.com'
let serverPathTrial = 'https://mini.youcompany.com'
let serverPathDev = 'https://mini.youcompany.com'
const app = getApp()
// eslint-disable-next-line no-undef
const env = __wxConfig.envVersion
// 请求自己服务器
export function request({ url, data, method }) {
  // 默认正式环境，如果非正式环境，则切换
  if (env === 'develop') {
    serverPath = serverPathDev
  }
  if (env === 'trial') {
    serverPath = serverPathTrial
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: serverPath + url,
      data,
      method: method || 'POST',
      header: {
        'content-type': 'application/json',
        'X-Token': app.globalData.token
      },
      // config.headers['X-Requested-With'] = 'XMLHttpRequest'
      success(res) {
        if (res.statusCode !== 200) {
          reject(new Error('请求异常'))
          return
        }
        const data = res.data
        if (data.code !== 200) {
          // 未登录
          if (data.code === 1002) {
            // 重新登录
            reject(new Error('刚登录掉啦，请重试！'))
            return
          }
          // 其他异常码的处理
          reject(new Error(data.message))
          return
        }
        resolve(data)
      },
      fail(ret) {
        reject(ret)
      }
    })
  })
}
// 请求云服务, header 遵循wx.request 的规范，实际请求通常是headers
export function requestCloud({ url, data = {}, method = 'post', header={}, weRunData }) {
  // data.token = app.globalData.token
  // data.expire = app.globalData.expire
  header.token = app.globalData.token
  header.expire = app.globalData.expire
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'service',
      data: { url, data, method, headers: header, weRunData },
      success: result => {
        const data = result.result
        if (data.code !== 200) {
          // 未登录
          if (data.code === 1002) {
            // 重新登录
            reject(new Error('你的登录掉啦，请先登录！'))
            return
          }
          // 其他异常码的处理
          reject(new Error(data.message))
          return
        }
        resolve(data)
      },
      fail: err => {
        // new Error(res.data.message)
        console.error(err)
        reject(new Error('调用异常'))
      }
    })
  })
}
