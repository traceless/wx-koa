'use strict'

// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const Koa = require('wx-koa').WxKoa
const router = require('./router')
const errorHandle = require('./middleware/errorHandle')

const db = cloud.database()
const app = new Koa()

// 全局异常处理
app.use(errorHandle)
// mock openid
app.use(async(ctx, next) => {
  const { OPENID } = ctx
  // 写入自己的openid测试
  if (!OPENID) {
    ctx.OPENID = 'ohdEC5V6TmxsTyP12333233'
    console.info(' test openid: ', ctx.OPENID)
  }
  // 初始化db
  ctx.db = db
  await next()
  // 封装结果参数，body 三种数据结构，1、字符串，2、直接返回结构，3、自定义放回信息
  if (typeof (ctx.body) === 'object' && ctx.body.success === undefined) {
    ctx.body = {
      success: true,
      message: '操作成功',
      code: 200,
      data: ctx.body
    }
  }
  if (typeof (ctx.body) === 'string') {
    ctx.body = {
      success: true,
      message: ctx.body,
      code: 200
    }
  }
})

app.use(router.routes()).use(router.allowedMethods())
// 云函数入口函数
exports.main = async(event, context) => {
  // 把cloudId的对象放到req.body中，比如获取手机号
  event.data.weRunData = event.weRunData
  const wxContext = cloud.getWXContext()
  return app.service(event, wxContext)
}

let event = {}
event = {
  'url': '/user/createOrder2',
  'data': {
    'token': 'ec014bb1ba55e6435ae074f6b97b9f41',
    'expire': 1586690832341,
    'code': '34344',
    'mobile': '123455553',
    'elevatorName': 'dd'
  }
}
// 本地直接调用简单的测试。
exports.main(event).then(data => {
  console.info('data:', data)
})
