const express = require('express')
const path = require('path')
const app = express()
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const request = require('request')

const ENV = 'test-tp1cj'
const appId = 'wx12341234'
const appSecret = 'fcf9112341234'

const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
let accessToken = '32_vb123Lk37ra11rv-kicXEez1No75n3hG6KxEeH5zF6tyVGSXOBsilBCeFL94XtQJMBH7s5kyT2l9tJ8O4jlrDueYIz-ma7jbl_JMOhc73U6Ak8J7hXPxNJhRZIWQ_zvSuGhJh5c3MeRSLcAJAWXQ'
// 定时任务
async function getAccessToken() {
  try {
    request(url, (err, res) => {
      accessToken = JSON.parse(res.body).access_token
      console.log('scheduleJob accessToken ', new Date(), accessToken)
    })
  } catch (err) {
    console.log(err)
  }
}
schedule.scheduleJob('0 */30 * * * *', getAccessToken)
getAccessToken()
// 设置静态资源路径
app.use(express.static(path.join(__dirname, 'public/html')))

// 解析 application/json
app.use(bodyParser.json())
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())
// 解决跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});
app.all('*', function (req, res, next) {
  if(req.method === 'OPTIONS'){
    res.send()
  }else{
    next()
  }
});
// Routes
const wxminiUrl = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=ACCESS_TOKEN&env=${ENV}&name=service`
app.post(`/*`, (req, res) => {
  // 获取请求路径，请求方法，请求参数，然后请求 小程序云函数
  let miniUrl = wxminiUrl.replace('ACCESS_TOKEN', accessToken)
  // 路径要去掉跟路径 req.path, 不能在app.use 里面用，只能在get, post
  const data = {
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    data: req.body
  }
  console.log('req', data.url, data.data)
  request.post({
    url: miniUrl,
    json: data
  }, (err, result) => {
    console.log('res', result.body)
    try {
      const resultJson = JSON.parse(result.body.resp_data)
      res.send(resultJson)
    } catch (err) {
      console.log('res', result.body)
    }
  })
})

app.get('/*', function(req, res, err) {
  res.redirect('/')
})
// Error handler
app.use(function(req, res, err) {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

module.exports = app
const port = 9110
app.listen(port);
console.log('port:', port)