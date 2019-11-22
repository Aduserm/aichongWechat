const api = require('../config/api.js');

function loginByWeixin() {
  return new Promise(function(resolve, reject) {
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: api.LoginUrl,
            method: "POST",
            data: {
              code: res.code
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(res) {
              console.log("【login成功】")
              wx.setStorageSync('userId', res.data.obj.userId);
              wx.setStorageSync('userType', res.data.obj.userType);
              wx.setStorageSync('manageUserMob', res.data.obj.manageUserMob);
              wx.setStorageSync('reportPhoneCheck', res.data.obj.reportPhoneCheck);
              wx.setStorageSync('isDoctor', res.data.obj.isDoctor);
              resolve(res);
            },
            fail: function(res){
              console.log("【login延迟】"+res.errMsg)
              resolve("请求失败");
            },
            complete: function(res){
              console.log("【complete】:"+res.errMsg)
            }
          })
        } else {
          console.log('【登录失败】' + res.errMsg)
        }

      },
      fail: function(e){
        console.log("【login失败】" + e.errMsg)
      }
    })
  })

}
function getUser(userId) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: api.GetDocInfo,
      method: "POST",
      data: {
        wxUpUserId: userId
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.setStorageSync('docName', res.data.docName);
          wx.setStorageSync('hispital', res.data.hispital);
          wx.setStorageSync('photo', res.data.photo);
          resolve(res);
        } else {
          console.log('获取用户信息失败')
        }
      }
    })
  })
}

module.exports = {
  loginByWeixin,
  getUser
};