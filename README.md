# wx-koa
基于koa框架的一个简单的库，使得微信小程序云开发跟后台koa开发保持一致，方便后期把微信小程序云开发的项目迁移到线下服务器

## 需求
目前小程序云开发提供了托管函数的云引擎，如果每个接口都各自写一个函数，那么对开发无疑是巨大的灾难的。不方便管理，代码共用也比较麻烦。所以能否有框架能像普通的后台开发一样处理前端的请求。

## 基于koa实现
1. koa是一个很有意思的web框架，实现很简单，核心代码大概有100多行。越简单的东西可玩性就越强，改造起来也方便。
2. 思路也很简单，就是mock一个request对象和response对象，其他都不改变，继承原有的application对象，重写了一些方法。支持了http协议的header, method,让云开发和普通的后台开发提供一致的体验和功能。
3. 理论上支持大部分koa插件，request对象mock不是很完整，只是简单赋值了一些属性数据。response对象的end方法重写了。所以对这2个对象有比较深入的依赖，那么可能会不支持。当然目前的已经可以满足大部分需求了。特别的需求可以尝试自己写插件。
4. 内置了koa-router，你可以直接使用它，仅仅继承了它，没有做任何改变，也许以后会用的到吧。

## 使用
1. 云函数直接安装wx-koa，npm i wx-koa -s

2. 云函数使用方式：
```
const Koa = require('wx-koa').WxKoa
const app = new Koa()
const Router = require('wx-koa').WxRoute
const router = new Router()

router.all('/*', (ctx, next) => {
  // 实现你的业务
  ctx.body = { headers: ctx.headers, header: ctx.header, requrl: ctx.request.url }
})
app.use(router.routes()).use(router.allowedMethods())
// 云函数入口函数
exports.main = async(event, context) => {
  // 把cloudId的对象放到req.body中，比如获取手机号
  event.data.weRunData = event.weRunData
  const wxContext = cloud.getWXContext()
  return app.service(event, wxContext)
}
```
3. 小程序端使用
```
// weRunData字段意思是 weRunData: wx.cloud.CloudID('xxx')，需要放在顶层字段
wx.cloud.callFunction({
      name: 'service',
      data: { url, data, method, headers, weRunData },
      success: res => {
        const data = res.result
         console.info(data)
      }
    })

```
4. 具体使用方式可以参考example中的例子，新增数据库集合user，修改appid就可以运行使用。

## 其他
1. 迁移到线下服务器来，迁移成本主要是在数据库的访问层，貌似跟原生的mongodb操作方式有些不太一样。理论上可以使用自己的mongodb客户端模块，它们连接数据库也是通过secretid,secretkey，可以查看他们代码找到获取这2个钥匙的入口，然后放到自己mongodb客户端模块中，这里我没有去研究实践，小伙伴可以去搞搞哦，整好留言给我吧。
2. 既然是小程序，那么管理后台如何访问这些数据库数据？或者访问这些云函数？云开发提供了相关的api接口。example中managment-express项目是一个简单云函数代理访问的后台服务，可以满足你的需求哦。里面配置 ENV 和appid, appsecret，然后就可以访问到云函数接口，跟普通ajax保持请求一致。

