'use strict'

const Router = require('wx-koa').WxRoute
const router = new Router()
const crypto = require('crypto')
const { userContoller } = require('./controller')

// 拦截登录
router.all('/user/*', async(ctx, next) => {
  const { token, expire } = ctx.request.headers
  if (token && expire > new Date().getTime()) {
    const openid = ctx.OPENID
    const md5 = crypto.createHash('md5').update(openid + expire).digest('hex')
    if (md5 === token) {
      // 把用户信息加到上下文中, 正常是通过token从redis，获取用户信息的。这里使用openid 直接查询数据库去得到
      const res = await ctx.db.collection('user').where({ openid }).get()
      let user = res.data[0]
      ctx.user = user
      await next()
      return
    }
  }
  ctx.body = { code: 1002, message: '当前用户未登录', success: false }
})
 
// 用户登录, jwt鉴权 12小时
router.post('/wxApi/login', userContoller.login)

// 检查是否登录
router.all('/user/checkLogin', async(ctx, next) => {
  ctx.body = '已经登录'
})

// 获取手机号
router.post('/user/getUserMobile', userContoller.getUserMobile)

// 捕抓最后的路径，error handle 实际可以处理
router.all('/*', (ctx, next) => {
  // ctx.router available
  ctx.body = { headers: ctx.headers, header: ctx.header, requrl: ctx.request.url }
})

module.exports = router
