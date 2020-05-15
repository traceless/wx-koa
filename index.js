'use strict'
const Koa = require('koa')
const mockReqRes = require('./mockReqRes')
const Route = require('koa-router')
const onFinished = require('on-finished')

class WxKoa extends Koa {
  /**
   * 初始换实例
   *
   * @api public
   */

  /**
    *
    * @param {object} [options] Application options
    * @param {string} [options.env='development'] Environment
    * @param {string[]} [options.keys] Signed cookie keys
    * @param {boolean} [options.proxy] Trust proxy headers
    * @param {number} [options.subdomainOffset] Subdomain offset
    * @param {boolean} [options.proxyIpHeader] proxy ip header, default to X-Forwarded-For
    * @param {boolean} [options.maxIpsCount] max ips read from proxy ip header, default to 0 (means infinity)
    *
    */

  constructor(options) {
    super(options)
    // 添加默认中间件
    this.use(async (ctx, next) => {
      ctx.request.body = ctx.req.body
      // 一定要注意这个next 需要是同步，不然无法使用
      await next()
    })
  }

  /**
   * 处理业务
   * @api public
   */

  /**
    *
    * @param {object} [event] wx cloud event
    * @param {string} [event.url] url
    * @param {string} [event.method] request method
    * @param {object} [event.data] request data
    *
    */
  async service(event, wxContext) {
    if(!wxContext){
      throw new Error('微信上下文参数不能为空')
    }
    const { req, res } = mockReqRes(event)
    const handleRequest = this.callback()
    req.wxContext = wxContext
    return handleRequest(req, res)
  }

  createContext(req, res) {
    const koaContext = super.createContext(req, res)
    const myContext = Object.assign(koaContext, req.wxContext)
    return myContext
  }
  /**
   * 重写 handleRequest 方法
   * @param {context} ctx
   * @param {*} fnMiddleware
   */
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res
    res.statusCode = 404
    const onerror = err => ctx.onerror(err)
    const handleResponse = () => ctx.body
    onFinished(res, onerror)
    return fnMiddleware(ctx).then(handleResponse).catch(onerror)
  }
}

/**
 * 自由扩展
 */
class WxRoute extends Route {

}
exports.WxKoa = WxKoa
exports.WxRoute = WxRoute
