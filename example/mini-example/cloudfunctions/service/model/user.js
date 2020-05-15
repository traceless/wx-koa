'use strict'

class User {
  constructor(openId, nickName, avatarUrl, city) {
    this.openId = openId
    this.nickName = nickName
    this.avatarUrl = avatarUrl
    this.city = city
    this.createTime = new Date()
  }
}
module.exports = User