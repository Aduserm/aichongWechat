Component({
  externalClasses: ['wux-class'],
  properties: {
    count: {
      type: Number,
      value: 9,
    },
    sizeType: {
      type: Array,
      value: ['original', 'compressed'],
    },
    sourceType: {
      type: Array,
      value: ['album', 'camera'],
    },
    url: {
      type: String,
      value: '',
    },
    name: {
      type: String,
      value: 'file',
    },
    header: {
      type: Object,
      value: {},
    },
    formData: {
      type: Object,
      value: {},
    },
    uploaded: {
      type: Boolean,
      value: true,
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    progress: {
      type: Boolean,
      value: false,
    },
    listType: {
      type: String,
      value: 'text',
    },
    fileList: {
      type: Array,
      value: [],
    },
    showUploadList: {
      type: Boolean,
      value: true,
    },
    showRemoveIcon: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    /**
     * 从本地相册选择图片或使用相机拍照
     */
    onSelect() {
      const { count, sizeType, sourceType, uploaded, disabled } = this.data
      const success = (res) => {
        this.tempFilePaths = res.tempFilePaths.map((item) => ({ url: item, uid: this.getUid() }))
        this.triggerEvent('before', res)

        // 判断是否取消默认的上传行为
        if (uploaded) {
          this.uploadFile()
        }
      }

      if (disabled) {
        return false
      }

      wx.chooseImage({
        count,
        sizeType,
        sourceType,
        success,
      })
    },
    /**
     * 上传文件改变时的回调函数
     * @param {Object} info 文件信息
     */
    onChange(info = {}) {
      this.setData({
        fileList: info.fileList,
      })

      this.triggerEvent('change', info)
    },
    /**
     * 开始上传文件的回调函数
     * @param {Object} file 文件对象
     */
    onStart(file) {
      const targetItem = {
        ...file,
        status: 'uploading',
      }

      this.onChange({
        file: targetItem,
        fileList: [...this.data.fileList, targetItem],
      })
    },
    /**
     * 上传文件成功时的回调函数
     * @param {Object} file 文件对象
     * @param {Object} res 请求响应对象
     */
    onSuccess(file, res) {
      const fileList = [...this.data.fileList]
      const index = fileList.map((item) => item.uid).indexOf(file.uid)

      if (index !== -1) {
        const targetItem = {
          ...file,
          status: 'done',
          res,
        }
        const info = {
          file: targetItem,
          fileList,
        }

        fileList.splice(index, 1, targetItem)

        this.triggerEvent('success', info)

        this.onChange(info)
      }
    },
    /**
     * 上传文件失败时的回调函数
     * @param {Object} file 文件对象
     * @param {Object} res 请求响应对象
     */
    onFail(file, res) {
      const fileList = [...this.data.fileList]
      const index = fileList.map((item) => item.uid).indexOf(file.uid)

      if (index !== -1) {
        const targetItem = {
          ...file,
          status: 'error',
          res,
        }
        const info = {
          file: targetItem,
          fileList,
        }

        fileList.splice(index, 1, targetItem)

        this.triggerEvent('fail', info)

        this.onChange(info)
      }
    },
    /**
     * 监听上传进度变化的回调函数
     * @param {Object} file 文件对象
     * @param {Object} res 请求响应对象
     */
    onProgress(file, res) {
      const fileList = [...this.data.fileList]
      const index = fileList.map((item) => item.uid).indexOf(file.uid)

      if (index !== -1) {
        const targetItem = {
          ...file,
          progress: res.progress,
          res,
        }
        const info = {
          file: targetItem,
          fileList,
        }

        fileList.splice(index, 1, targetItem)

        this.triggerEvent('progress', info)

        this.onChange(info)
      }
    },
    /**
     * 上传文件，支持多图递归上传
     */
    uploadFile() {
      if (!this.tempFilePaths.length) {
        return false
      }

      const { url, name, header, formData, disabled, progress } = this.data
      const file = this.tempFilePaths.shift()
      const { uid, url: filePath } = file

      if (!url || !filePath || disabled) {
        return false
      }

      this.onStart(file)

      this.uploadTask[uid] = wx.uploadFile({
        url,
        filePath,
        name,
        header,
        formData,
        success: (res) => this.onSuccess(file, res),
        fail: (res) => this.onFail(file, res),
        complete: (res) => {
          delete this.uploadTask[uid]
          this.triggerEvent('complete', res)
          this.uploadFile()
        },
      })

      // 判断是否监听上传进度变化
      if (progress) {
        this.uploadTask[uid].onProgressUpdate((res) => this.onProgress(file, res))
      }
    },
    /**
     * 点击文件时的回调函数
     * @param {Object} e 参数对象
     */
    onPreview(e) {
      this.triggerEvent('preview', { ...e.currentTarget.dataset, fileList: this.data.fileList })
    },
    /**
     * 点击删除图标时的回调函数
     * @param {Object} e 参数对象
     */
    onRemove(e) {
      const { file } = e.currentTarget.dataset
      const fileList = [...this.data.fileList]
      const index = fileList.map((item) => item.uid).indexOf(file.uid)

      if (index !== -1) {
        const targetItem = {
          ...file,
          status: 'remove',
        }
        const info = {
          file: targetItem,
          fileList,
        }

        fileList.splice(index, 1)

        this.triggerEvent('remove', { ...info, index: e.currentTarget.dataset.index })

        this.onChange(info)
      }
    },
    /**
     * 中断上传任务
     * @param {String} uid 文件唯一标识
     */
    abort(uid) {
      const { uploadTask } = this

      if (uid) {
        if (uploadTask[uid]) {
          uploadTask[uid].abort()
          delete uploadTask[uid]
        }
      } else {
        Object.keys(uploadTask).forEach((uid) => {
          if (uploadTask[uid]) {
            uploadTask[uid].abort()
            delete uploadTask[uid]
          }
        })
      }
    },
  },
  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  created() {
    this.index = 0
    this.createdAt = Date.now()
    this.getUid = () => `wux-upload--${this.createdAt}-${++this.index}`
    this.uploadTask = {}
    this.tempFilePaths = []
  },
  /**
   * 组件生命周期函数，在组件实例被从页面节点树移除时执行
   */
  detached() {
    this.abort()
  },
})