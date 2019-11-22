var uuid = require('../../service/uuid.js');
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
var app = getApp();
var proList = [];
var hasDocId = false;
var showConsultPrice = false;
var n = 1;
const options = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 64000,
  format: 'mp3'
}
// 录音对象
const recorderManager = wx.getRecorderManager();
var innerAudioContext;
Page({
  data: {
    id: "",
    results: [],
    currentData: 1,
    imageId: "",
    uploadUUID: "",
    open: false,
    noDesignPrice: -1,
    uuid: "",
    reportModality: "",
    reportCheckTime: "",
    moneyInput: "",
    noteMaxLen: 500,
    questLen: 40,
    qtDesc: "",

    imgs: [],
    fileDtIds: [],
    reports: [],
    imgUrl: "",
    state: 0,
    flag: true,
    currentTime: 60,
    phoneFlag: true,
    vcode: '',
    reportPhoneFlag: 0,
    showModal: true,
    submitFlag: false,
    showTip: false,
    voiceon: true,
    enclosureFlag: false,
    yyicon1: '../../static/images/yy1.png',
    yyicon2: '../../static/images/yy2.png',
    apsrc: '../../static/images/yy2.png',
    chatId: -1,
    audioList: [],
    // audioList: [{
    //   src: '423A0779BF324C57B3011BCE018AE464.mp3',
    //   audioTime: 6
    // }, {
    //   src: 'C495959535C84555B993744A18CA843B.mp3',
    //   audioTime: 2
    // }]
  },


  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },

  //字数限制
  bindWordLimit: function (e) {
    var value = e.detail.value;
    var len = parseInt(value.length);
    if (len > this.data.noteMaxLen) return;
    console.log("desc:" + e.detail.value)
    this.setData({
      qtDesc: e.detail.value,
      currentNoteLen: len //当前字数
    });
  },

  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var tempFiles = res.tempFiles;
        var fileDtIds = that.data.fileDtIds;
        var imgs = that.data.imgs;
        var successUp = 0;
        var failUp = 0;
        var length = res.tempFilePaths.length;
        var i = 0;
        var max = 9;
        var uploadUUID = that.data.uploadUUID;
        if ((imgs.length + tempFilePaths.length) <= max) { //上传成功的图片总数
          this.uploadDIY(tempFilePaths, tempFiles, successUp, i, failUp, length, uploadUUID, imgs, fileDtIds);
        } else {
          wx.showToast({
            title: '图片最多传' + max + '张',
          })
          that.setData({
            imgs: imgs
          })
        }
      }
    });
  },

  /* 函数描述：作为上传文件时递归上传的函数体体；
   * 参数描述： 
   * filePaths是文件路径数组
   * successUp是成功上传的个数
   * failUp是上传失败的个数
   * i是文件路径数组的指标
   * length是文件路径数组的长度
   */
  uploadDIY(filePaths, tempFiles, successUp, failUp, i, length, uploadUUID, imgs, fileDtIds) {
    if (tempFiles[i].size < 10000000) {
      wx.showLoading({
        title: '正在处理',
      })
      wx.uploadFile({
        url: api.QuestUploadFile,
        filePath: filePaths[i],
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          folder: "questFilePaths",
          fileId: uploadUUID
        },
        success: (res) => {
          successUp++;
          imgs.push(filePaths[i]);
          var rs = JSON.parse(res.data);
          var fileDtId = rs.obj.fileDtId;
          console.log("上传成功fileDtId:" + fileDtId);
          that.setData({
            imgs: imgs,
            fileDtIds: that.data.fileDtIds.concat(fileDtId),
            success: successUp
          })
          wx.hideLoading();
          wx.showToast({
            title: '成功上传' + successUp + '张图片',
          })
        },
        fail: (res) => {
          failUp++;
          console.log("失败");
          wx.hideToast();
          wx.showModal({
            title: '错误提示',
            content: '上传图片失败',
            showCancel: false,
            success: function (res) { }
          })
          that.setData({
            imgId: "",
            imgUrl: ""
          })
        },
        complete: () => {
          i++;
          if (i == length) {
            console.log("结束");
            wx.showToast({
              title: '共上传' + successUp + '张'
            });
          } else { //递归调用uploadDIY函数
            this.uploadDIY(filePaths, tempFiles, successUp, failUp, i, length, uploadUUID, imgs);
            console.log("调用递归")
          }
        },
      })
    } else {
      console.log('文件太大了')
      i++;
      failUp++;
      wx.showToast({
        title: '文件太大了'
      });
    }
    var that = this;
    that.setData({
      imageId: uploadUUID,
    })
  },

  // 删除图片
  deleteImg: function (e) {
    var that = this;
    var imgs = this.data.imgs; //全路径
    var index = e.currentTarget.dataset.index;
    console.log("index:" + index);
    imgs.splice(index, 1); //删除index张
    var fileDtId = that.data.fileDtIds[index];
    wx.request({
      url: api.DeleteImg,
      data: {
        folder: "questFilePaths",
        fileDtId: fileDtId
      },
      success: function (e) {
        console.log("删除成功" + fileDtId);
        var fileDtIdsNew = that.data.fileDtIds;
        fileDtIdsNew.splice(index, 1);
        that.setData({
          fileDtIds: fileDtIdsNew
        })
      }
    })
    if (imgs.length > 0) {
      that.setData({
        imgs: imgs
      })
    } else {
      that.setData({ // 图片为空
        imgs: imgs,
        imageId: ""
      })
    }
  },

  // 预览图片
  TakepreviewImg: function (e) {
    //所有图片
    var src = e.currentTarget.dataset.src;
    var list = e.currentTarget.dataset.list;
    wx.previewImage({
      //当前显示图片
      current: src,
      //所有图片
      urls: list
    })
  },

  //图片无法正确加载
  photoError: function (e) {
    var that = this;
    that.setData({
      docImg: "../../static/images/joindoc.png"
    })
  },

  onLoad: function (options) {
    console.log("onLoad()");
    var that = this;
    that.registerAudioContext();
    this.GetInfo().then((res) => {
      if (res.authSetting['scope.userInfo'] && wx.getStorageSync('userInfo') != '') {
      } else {
        if (app.globalData.uuid && !wx.getStorageSync("manageUserMob")) {
          wx.redirectTo({
            url: '../../pages/accredit/accredit?view=report',
          })
        } else {
          wx.redirectTo({
            url: '../../pages/accredit/accredit?view=consult',
          })
        }
      }
    });
    var uploadUUID = uuid.generateUUID();
    app.globalData.temp = true;
    var id = uuid.generateUUID(); //生成一个问题id
    that.setData({
      uploadUUID: uploadUUID,
      id: id,
    })
  },
  //获取用户信息
  GetInfo: function () {
    var that = this;
    return new Promise(function (resolve) {
      wx.getSetting({
        success: function (res) {
          resolve(res);
        }
      })
    })
  },

  //页面刷新时间
  onShow: function (options) {
    console.log("uuid->>>" + app.globalData.uuid)
    var that = this;
    var docId = app.docId; //通过全局变量获取之前页面的id（医生咨询入口）
    var reportId = app.reportId;
    console.log("咨询页的docId:" + docId);
    if (docId != '' && docId) { //获取指定医生信息
      console.log("docId2:" + docId)
      that.setData({
        designDocFlag: true
      })
      wx.request({
        url: api.GetDocDetail,
        data: {
          doctorId: docId
        },
        method: "POST",
        success: function (res) {
          console.log("obj:" + res.data.obj.manageUserName);
          var obj = res.data.obj;
          that.setData({
            docImg: obj.photoUrl + "MiddleImage/" + obj.photo,
            docUserName: obj.manageUserName,
            docHos: obj.hospitalName,
            docTitleName: obj.titleName,
            showDoc: true,
            designDoc: 1,
            doctorId: app.docId,
            docId: app.docId,
            docFixedMoney: obj.consultPrice,
            consultPrice: obj.consultPrice,
            showDocFixedMoney: true,
            isPay: 1,
            currentData: 1,
            designDocFlag: false
          })
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
    that.setData({
      flag: true
    })
  },

  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      quest: e.detail.value
    })
  },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { },
  test: function () { },

  //发布
  formSubmit: function (e) {
    var that = this;
    if (e.detail.value.quest == null || e.detail.value.quest == "") {
      wx.showToast({
        title: '问题不能为空',
        duration: 2000
      })
      return;
    }
    if (that.data.qtDesc == null || that.data.qtDesc == "") {
      wx.showToast({
        title: '详情不能为空',
        duration: 2000
      })
      return;
    }
    if (that.data.designDoc == 1 && that.data.doctorId == "") {
      wx.showToast({
        title: '请选择医生',
        duration: 2000
      })
      return;
    }
    if (that.data.consultPrice < 0 || that.data.consultPrice === '') {
      wx.showToast({
        title: '请选择悬赏金额',
        duration: 2000
      })
      return;
    }
    var id = that.data.id; //发布成功则onLoad刷新id,判断为新咨询
    var url;
    var sId = wx.getStorageSync("id"); //未点击发布按钮id存入缓存
    console.log("缓存获取咨询Id:" + sId);
    console.log("onLoad生成id:" + id);
    if (id === sId) {
      url = api.UpdateQuest //属于同一问题执行update
      console.log("updateQuest")
    } else {
      url = api.SetQuest //不同则set问题
      console.log("执行setQuest")
    }
    var isPay = 0
    if (that.data.consultPrice > 0) {
      isPay = 1;
    }
    let temp;
    var array = [];
    var array2 = [];
    for (var i = 0; i < that.data.reports.length; i++) {
      if (that.data.reports[i].uuid) { //uid有值则拼接
        temp = that.data.reports[i].uuid + ":" + that.data.reports[i].modcheckdate + ":" + that.data.reports[i].modality + ":" + that.data.reports[i].dengjipart;
        array.push(temp);
      } else { //拼接档案报告
        temp = that.data.reports[i].id + ":" + that.data.reports[i].modcheckdate + ":" + that.data.reports[i].modality + ":" + that.data.reports[i].dengjipart;
        array2.push(temp);
      }
    }
    var uuidReport2 = array.join("%");
    var phoneNumberReport = array2.join("%");
    // if (that.data.uuid) {
    //   uuidReport2 = that.data.uuid + ":" + that.data.reports[0].modality + ":" + that.data.reports[0].dengjipart
    // }
    var audioList = that.data.audioList;
    var audio = "";
    for (var j = 0; j < audioList.length; j++) {
      audio += audioList[j].fileName + ",";
    }
    if (audio.length > 0) {
      audio = audio.substr(0, audio.length - 1);
    }
    util.showLoading('处理中');
    that.setData({
      submitFlag: true
    })
    wx.request({
      url: url,
      data: {
        id: id,
        createUser: wx.getStorageSync("userId"),
        quest: e.detail.value.quest,
        qtDesc: that.data.qtDesc,
        imageId: this.data.imageId,
        questType: 0,
        isPay: isPay,
        designDoc: that.data.designDoc,
        doctorId: that.data.doctorId,
        state: this.data.state,
        isPrivate: this.data.isPrivate,
        consultPrice: that.data.consultPrice,
        uuidReport: uuidReport2,
        phoneNumberReport: phoneNumberReport,
        audio: audio
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorage({ //id存入缓存 (此处提早存入缓存，防止set问题时断网)
          key: 'id',
          data: that.data.id,
        })
        var state = res.data.success;
        if (state) {
          app.docId = null;
          var url = "";
          var questionId = res.data.obj;
          wx.request({
            url: api.SetOrderInfo,
            method: "POST",
            data: {
              wxUserId: wx.getStorageSync("userId"),
              orderName: '咨询费用',
              originId: res.data.obj,
              payStatus: 1,
              orderPrice: that.data.consultPrice,
              orderType: 'consult'
            },
            success: function (res) {
              util.hideLoading();

              if (that.data.consultPrice != 0) { //价格大于0则跳转支付页面
                console.log("订单id：" + res.data.obj);
                wx.navigateTo({
                  url: '../payment/payment?orderId=' + res.data.obj
                })
              } else {
                if (!wx.getStorageSync("manageUserMob")) {
                  wx.showModal({
                    title: '提示！',
                    content: '绑定手机号可第一时间接受回复信息，是否进行绑定？',
                    cancelText: '否',
                    confirmText: '是',
                    success(res) {
                      if (res.confirm) {
                        wx.reLaunch({
                          url: '/pages/bindTel/bindTel?next=index',
                        })
                      } else if (res.cancel) {
                        // wx.reLaunch({
                        //   url: '../index/index',
                        // })
                        wx.reLaunch({
                          url: '../../pages/orderFinish/orderFinish?questionId=' + questionId,
                        })
                      }
                    }
                  })
                } else {
                  wx.showToast({
                    title: '发布成功',
                    duration: 2000
                  })
                  setTimeout(function () {
                    // wx.reLaunch({
                    //   url: '../index/index',
                    // })
                    wx.reLaunch({
                      url: '../../pages/orderFinish/orderFinish?questionId=' + questionId,
                    })
                  }, 2000)

                }
              }
            },
            fail: function () {
              util.hideLoading();
              wx.showToast({
                title: '网络异常',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          util.hideLoading();
          wx.showModal({
            title: '发布失败',
            content: res.data.msg,
            success: function () {
              // wx.redirectTo({
              //   url: '../../pages/questionList/questionList?index=1 ',
              // })
            }
          })
        }
      },
      fail: function () {
        util.hideLoading();
        wx.showToast({
          title: '网络异常',
          duration: 2000
        })
      },
      complete: function () {
        that.setData({
          submitFlag: false
        })
      }
    })
  },

  //表单重置
  formReset: function (e) {
    var that = this;
    console.log("表单重置");
    for (var i = 0; i < that.data.fileDtIds.length; i++) {
      var fileDtId = that.data.fileDtIds[i];
      console.log("fileDtId:" + fileDtId);
      wx.request({
        url: api.DeleteImg,
        data: {
          folder: "questFilePaths",
          fileDtId: fileDtId
        },
        success: function (e) {
          console.log("删除成功" + fileDtId);
        },
        fail: function () {
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 2000
          })
        }
      })
      that.setData({
        imgs: [],
        imageId: ""
      })
    }
    that.setData({
      quest: "",
      qtDesc: "",
      imgs: [],
      showDoc: false,
      doctorId: "",
      currentData: 1,
      showPrivate: true,
      showDocFixedMoney: false,
      docId: "",
      docImg: "",
      docUserName: "",
      docHos: "",
      docTitleName: "",
      moneyIndex: 0,
      flag: false, //标记为false,防止重置后页面刷新重新获取docId
      open: false,
      consultPrice: 0,
      uuidReport: '',
      phoneNumber: '',
      reports: [],
      isPay: 0,
      audioList: []
    })
  },
  handleTouchEnd: function (e) {
    this.setData({
      voiceon: true
      // voicemove: true,
    });
    recorderManager.stop();
    recorderManager.onStop((res) => {
      // 结束录音
      this.sendRecord(res.tempFilePath);
    })

  },
  handleLongPress: function (e) {
    this.setData({
      voiceon: false,
      // voicemove: false,

    });
    recorderManager.start(options);
    recorderManager.onStart(() => {

    });
  },
  //发送录音文件
  sendRecord: function (src) {
    if (src == null) {
      wx.showModal({
        title: '录音文件不存在',
        content: '我也不知道哪错了，反正你就再试一次吧！',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#09BB07',
      })
      return;
    }
    wx.showLoading({
      title: '语音识别中...',
    })
    var that = this;
    wx.uploadFile({
      url: api.SpeechRecognition,
      filePath: src,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      success: function (result) {
        wx.hideLoading();
        var data = JSON.parse(result.data);
        if (data.success) {
          that.setData({
            audioFlag: true,
            audioSrc: src,
            audioTime: data.obj.time,
            fileName: data.obj.fileName,
            audioMsg: data.msg,
            qtDescFlag: true,
          })
        } else {
          wx.showModal({
            title: '录音识别失败',
            content: "我什么都没听到，你再说一遍！",
            showCancel: false,
            success: function (res) { }
          });
        }
      },
      fail: function (err) {
        wx.hideLoading();
        wx.showModal({
          title: '录音识别失败',
          content: "请你离WIFI近一点再试一次！",
          showCancel: false,
          success: function (res) { }
        });
      }
    })
  },
  //语音选择关闭
  checkoff: function () {
    this.setData({
      audioFlag: false,
      qtDescFlag: false
    })
  },
  //转文字
  turnText: function (e) {
    var that = this;
    var msg = that.data.audioMsg;
    that.setData({
      qtDescFlag: false
    })
    if (msg.length > 200) {
      wx.showModal({
        title: '内容太长了',
        content: "文字超过200字，内容太长了！请缩短内容",
        showCancel: false,
        success: function (res) { }
      });
      return
    } else {
      var content = that.data.qtDesc;
      var qtDesc = content + msg;
      that.setData({
        currentNoteLen: qtDesc.length,
        qtDesc: qtDesc,
        audioFlag: false
      })
    }
  },
  //作为语音附件
  beEnclosure: function (e) {
    var that = this;
    var obj = {};
    var audios = that.data.audioList;
    var audioSrc = that.data.audioSrc;
    var audioTime = that.data.audioTime;
    if (audios.length == 2) {
      wx.showToast({
        title: '附件已达上限',
      })
      return;
    }
    obj.src = audioSrc;
    obj.audioTime = audioTime;
    obj.fileName = that.data.fileName;
    audios.push(obj);
    that.setData({
      enclosureFlag: true,
      audioList: audios,
      audioFlag: false,
      qtDescFlag: false
    })
  },

  // 播放录音
  audioPlay: function (e) {
    var that = this;
    var src = e.currentTarget.dataset.src;
    var srcindex = e.currentTarget.dataset.srcindex;
    var replyId = e.currentTarget.dataset.replyid;
    if (src == '') {
      this.tip("失效")
      return;
    }
    console.log(src)
    innerAudioContext.src = src;
    innerAudioContext.stop();
    innerAudioContext.play();
    //列表上的语音
    if (srcindex != undefined) {
      that.setData({
        chatId: srcindex
      })
    } else {
      that.setData({
        apsrc: that.data.yyicon1
      })
    }
  },
  // 注册音频  
  registerAudioContext: function () {
    innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.onEnded((res) => {
      this.setData({
        chatId: -1,
        apsrc: '../../static/images/yy2.png'
      })
    })
    innerAudioContext.onError((res) => {
      // 播放音频失败的回调      
      console.log('播放音频失败' + res.data);
    })
    innerAudioContext.onStop((res) => {
      console.log('播放结束!');
    })
  },
  //删除语音附件
  delAudio: function (e) {
    var that = this;
    wx.showModal({
      title: '确定删除该语音附件？',
      content: '',
      success: res => {
        if (res.confirm) {
          let audioindex = e.currentTarget.dataset.delaudioindex;
          let audioList = that.data.audioList;
          audioList.splice(audioindex, 1);
          that.setData({
            audioList: audioList
          })
        }
      }
    })
  },
})