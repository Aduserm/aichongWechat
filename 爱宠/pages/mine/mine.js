// pages/ucenter/index/index.js
var user = require('../../service/user.js')
var api = require('../../config/api.js')
const app = getApp();
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    count1: 0,
    count2: 0,
    role: false,
    bindText: "去绑定",
    results: [],
    messageCount: 0,
    myWallect: true,
  },
  //收藏的问题
  toMyCollection: function () {
    wx.navigateTo({
      url: '/pages/collection/collection',
    })
    // wx.navigateTo({
    //   url: '/pages/webView/webView?url=' + encodeURIComponent('http://localhost:8080/api/webView/collection?&userId=' + wx.getStorageSync("userId")),
    // })
  },
  //问题列表
  toAnswer: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index);
    wx.navigateTo({
      url: '/pages/questionList/questionList?index=' + index
      // url: '/pages/webView/webView?url=' + encodeURIComponent('http://localhost:8080/api/wxView/questionList?index=' + index + "&userId=" + wx.getStorageSync("userId")),
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    user.loginByWeixin().then((res) => {
      if (res == '请求失败') {
        console.log("再次请求")
        return user.loginByWeixin();
      } else {
        wx.showNavigationBarLoading();
        if (wx.getStorageSync('userId')) {
          var userId1 = wx.getStorageSync('userId');
          var doctorId1 = wx.getStorageSync('userId');
          if (wx.getStorageSync("userType") == 'expert') {
            userId1 = "";
            that.setData({
              role: true
            })
          } else {
            doctorId1 = "";
          }
          wx.request({
            url: api.GetUcenterCount,
            data: {
              // userId: wx.getStorageSync("userId")
              userId: userId1,
              doctorId: doctorId1
            },
            method: "POST",
            success: function (e) {
              if (e.data.success) {
                if (e.data.results.length) {
                  let NewList = e.data.results;
                  let messageCount = 0;
                  if (e.data.results[0].id) {
                    let messageCount = e.data.results.length;
                    that.setData({
                      messageCount: messageCount
                    })
                  }
                  var arr = new Array();
                  for (var i = 0; i < NewList.length; i++) {
                    arr.push(NewList[i].id);
                  }
                  let str = arr.join(",");
                  console.log("str:" + str)
                  var count1 = e.data.results[0].count1;
                  that.setData({
                    str: str,

                  })
                  var count2 = e.data.results[0].count2;
                  if (count1) {
                    that.setData({
                      count1: count1,
                    })
                  } else {
                    that.setData({
                      count1: 0,
                    })
                  }
                  if (count2) {
                    that.setData({
                      count2: count2,
                    })
                  }
                }
              }
            },
            fail: function () {
              wx.showToast({
                title: '网络异常',
                icon: 'none',
                duration: 2000
              })
            }
          })
          // 隐藏导航栏加载框
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
        }
      }
    }).catch(() => { });
  },
  //我的预约
  toMyOrder: function (e) {
    wx.navigateTo({
      url: '/pages/myReservation/myReservation',
    })
  },
  //我的报告单
  toMyReport: function (e) {
    var manageUserMob = wx.getStorageSync("manageUserMob");
    wx.navigateTo({
      url: '/pages/personal/personal?uploaderTel=' + manageUserMob,
    })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  // 绑定医生
  toBinding: function () {
    wx.navigateTo({
      url: '/pages/bindTel/bindTel?next=my',
    })
    // wx.navigateTo({
    //   url: '/pages/webView/webView?url=' + encodeURIComponent('http://localhost:8080/api/webView/bindTel'),
    // })
  },
  //我的钱包
  toMyWallet: function () {
    wx.navigateTo({
      url: '/pages/myWallet/myWallet',
    })
  },

  // 开始工作
  toExpertBinding: function () {
    wx.navigateTo({
      url: '/pages/signDoctor/signDoctor',
    })
  },

  // 关注医生
  collectDoctor: function () {
    wx.navigateTo({
      url: '/pages/collectDoctor/collectDoctor',
    })
  },
  //页面渲染
  onShow: function () {
    console.log("ucenter-onshow")
    var that = this;
    app.globalData.uuid = ""; //咨询页检查报告切换清除uuid
    console.log("userID:" + wx.getStorageSync('userId'))
    console.log("G-userType:" + app.globalData.userType)
    console.log("S-userType:" + wx.getStorageSync('userType'))
    if (wx.getStorageSync('userId')) {
      var userId1 = wx.getStorageSync('userId');
      var doctorId1 = wx.getStorageSync('userId');
      if (wx.getStorageSync("userType") == 'expert') {
        userId1 = "";
        that.setData({
          role: true
        })
      } else {
        doctorId1 = "";
      }
      wx.request({
        url: api.GetUcenterCount,
        data: {
          userId: userId1,
          // userId: wx.getStorageSync("userId")
          doctorId: doctorId1
        },
        method: "POST",
        success: function (e) {
          if (e.data.success) {
            if (e.data.results.length > 0) {
              let messageCount = 0;
              if (e.data.results[0].id) {
                console.log("ss")
                let messageCount = e.data.results.length;
                that.setData({
                  messageCount: messageCount,
                })
              }
              let NewList = e.data.results;
              var arr = new Array();
              for (var i = 0; i < NewList.length; i++) {
                arr.push(NewList[i].id);
              }
              let str = arr.join(",");
              console.log("str:" + str)
              var count1 = e.data.results[0].count1;
              console.log("count1:" + count1)
              var count2 = e.data.results[0].count2;
              if (count1) {
                that.setData({
                  count1: count1,
                })
              }
              if (count2) {
                that.setData({
                  count2: count2,
                })
              }
              that.setData({
                str: str,
                results: e.data.results
              })
            }
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  // getWxUserInfo() {
  //   if (this.data.avatarUrl) { //如果已经有头像了，则退出
  //     return;
  //   }
  //   console.log('do-getWxUserInfo')
  //   if (!app.globalData.userInfo.avatarUrl) { //判断是否登录获取到头像
  //     //登录信息中没有
  //     if (wx.getStorageSync("userInfo").avatarUrl) { //判断缓存中是否有头像
  //       this.setData({
  //         userInfo: wx.getStorageSync("userInfo")
  //       })
  //       return;
  //     }

  //     //缓存中没有重新递归这个方法
  //     setTimeout(() => {
  //       this.getWxUserInfo();
  //     }, 500)
  //   } else {
  //     this.setData({
  //       userInfo: app.globalData.userInf
  //     })
  //   }
  // },


  onLoad: function () {
    console.log("ucenter--onLoad()")
    var that = this;
    //微信获取信息为请求(异步)所以定时检测头像
    // this.getWxUserInfo();
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo'] && wx.getStorageSync('userInfo') != '') {

        } else {
          wx.redirectTo({
            url: '../../../pages/accredit/accredit?view=userIndex',
          })
        }
      }
    })
    var userInfo = wx.getStorageSync('userInfo');
    console.log("userInfo:" + userInfo)
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      console.log("延迟")
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log("callback:" + res.userInfo)
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log("再度请求：" + res.userInfo)
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    if (wx.getStorageSync("userType") == "expert") {
      that.setData({
        myWallect: false
      })
    }

    // 判断 如果缓存有手机号，则显示已绑定，反之则显示去绑定
    if (wx.getStorageSync("manageUserMob")) {
      that.setData({
        bindText: "已绑定"
      })
    } else {
      that.setData({
        bindText: "去绑定"
      })
    }

  },
  //获取用户信息
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },



  //查看我的消息
  getMessage: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/myMsg/myMsg?str=' + that.data.str, //str:list<id>
    })
  },
  toRecord: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/more/more'
    })
  },

  //反馈意见
  toFeedBack: function () {
    wx.navigateTo({
      url: '/pages/feedBack/feedBack',
    })
  }

})