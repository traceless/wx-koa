const { IncomingMessage, ServerResponse } = require('http')
const extend = require('extend')
// menthod 要大写，不然无法定位路由
module.exports = function(event) {
  const req = new IncomingMessage()
  const { url = '\\', method = 'POST', data, headers = {} } = event
  req.url = url
  req.method = method.toUpperCase()
  req.body = data
  req.headers = headers
  const response = {
    statusCode: 404,
    statusMessage: 'Not Found',
    end: (body) => body
  }
  const res = extend(new ServerResponse(req), response)
  res.headersSent = false
  res.setHeader('Content-Type', 'application/json')
  return { req, res }
}
