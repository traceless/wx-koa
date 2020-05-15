//index.js
const app = getApp()
const request = require('../../util/request.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    nickName: '',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

  },

  getMobile: function(ev) {
    const weRunData = wx.cloud.CloudID(ev.detail.cloudID)
    request.requestCloud({
      url: '/user/getUserMobile',
      weRunData
    }).then(res =>{
      console.log('res', res)
      wx.showToast({
        title: '手机号：' + res.data.data.phoneNumber,
        icon: 'none',
        duration: 4000
      })
    }).catch(err =>{
      wx.showToast({
        title: err.message,
        icon: 'none',
        duration: 2000
      })
    })
  },

  onGetUserInfo: function(ev) {
    const weRunData = wx.cloud.CloudID(ev.detail.cloudID)
    request.requestCloud({
      url: '/wxApi/login',
      weRunData
    }).then(res => {
      console.info('login res', res)
      wx.showToast({
        title: '登录成功！',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        logged: true,
        avatarUrl: res.data.user.avatarUrl,
        userInfo: res.data.user,
        nickName: res.data.user.nickName
      })
      app.globalData.token = res.data.token
      app.globalData.expire = res.data.expire
    })
    
  },

})