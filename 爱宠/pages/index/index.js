//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    topList: [{
      src: '../../static/images/每日精选.png',
      title: '每日精选',
      bdtap: 'toFindreport'
    }, {
        src: '../../static/images/popularity.png',
      title: '人气榜单',
      bdtap: 'toMyarchive'
    }, {
      src: '../../static/images/new.png',
      title: '新品榜单',
      bdtap: 'toApply'
    }]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    };
    // 这里是功能菜单滚动条
    var topOneList = [];
    var topTwoList = [];
    var topThreeList = [];
    var topList = that.data.topList;
    if (wx.getStorageSync("userType") == 'expert') {
      topOneList.push(topList[2]);
      topOneList.push(topList[4]);
      topOneList.push(topList[3]);
      // topOneList.push(topList[5]);
      topTwoList.push(topList[8]);
      topTwoList.push(topList[6]);
      topTwoList.push(topList[0]);
      topTwoList.push(topList[1]);
      topThreeList.push(topList[7]);
      that.setData({
        topOneList: topOneList,
        topTwoList: topTwoList,
        topThreeList: topThreeList
      })
    } else {
      topOneList.push(topList[0]);
      topOneList.push(topList[1]);
      topOneList.push(topList[2]);
      // topOneList.push(topList[7]);
      topTwoList.push(topList[6]);
      topTwoList.push(topList[3]);
      topTwoList.push(topList[4]);
      topTwoList.push(topList[5]);
      topThreeList.push(topList[8]);
      that.setData({
        topOneList: topOneList,
        topTwoList: topTwoList,
        topThreeList: topThreeList
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
