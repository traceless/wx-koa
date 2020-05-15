'use strict'
const exp = 1000 * 60 * 60 * 12
const crypto = require('crypto')
const { User } = require('./model')

class UserContoller {
  // 登录
  async login(ctx, next) {
    const { OPENID } = ctx
    const expire = new Date().getTime() + exp
    const token = crypto.createHash('md5').update(ctx.OPENID + expire).digest('hex')
    // 获取用户信息
    let res = await ctx.db.collection('user').where({ openId: OPENID }).get()
    let user = null
    if (res.data.length > 0) {
      user = res.data[0]
    }
    // 添加用户
    if (user == null) {
      const { openId, nickName, avatarUrl, city }  = ctx.req.body.weRunData.data
      user = new User(openId, nickName, avatarUrl, city)
      await ctx.db.collection('user').add({ data: user })
    }
    ctx.body = { user, expire, token }
  }

  // 获取手机号
  async getUserMobile(ctx, next) {
    ctx.body = ctx.req.body.weRunData
  }
}

module.exports = { userContoller: new UserContoller() }
