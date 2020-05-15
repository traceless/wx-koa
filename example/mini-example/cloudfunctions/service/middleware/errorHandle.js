'use strict'
const cloud = require('wx-server-sdk')
module.exports = async function(ctx, next) {
  const isPro = ~cloud.DYNAMIC_CURRENT_ENV.toString().indexOf('pro')
  try {
    await next()
    // 参数转换, 转换成自己的数据格式
    if (typeof (ctx.body) === 'object') {
      const { success, message, code, data } = ctx.body
      const body = {
        success: success || false,
        message,
        code: code || 200,
        data
      }
      ctx.body = body
    }
    if (ctx.status === 404) {
      ctx.throw(404, '请求资源未找到!')
    }
  } catch (err) {
    // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
    // app.emit('error', err, this);
    const status = err.status || 500
    // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
    const error = status === 500 && isPro
      ? 'Internal Server Error'
      : err.message
    // 从 error 对象上读出各个属性，设置到响应中
    ctx.body = {
      success: false,
      message: error,
      code: status, // 服务端自身的处理逻辑错误(包含框架错误500 及 自定义业务逻辑错误533开始 ) 客户端请求参数导致的错误(4xx开始)，设置不同的状态码
      data: null
    }
    // 406 是能让用户看到的错误，参数校验失败也不能让用户看到（一般不存在参数校验失败）
    if (status === '403' || status === '406') {
      ctx.body.message = error
    }
    ctx.status = 200
  }
}
