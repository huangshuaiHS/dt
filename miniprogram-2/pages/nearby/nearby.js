const chooseLocation = requirePlugin('chooseLocation');

// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR' // 必填
});

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.selection();
  },
  //地图选点
  selection: function () {
    const key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
    const referer = '小程序选点'; //调用插件的app的名称
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const location = JSON.stringify({
          latitude: res.latitude,
          longitude: res.longitude
        });
        const category = '地铁站,公交车站,基础设施';
        wx.navigateTo({
          url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
        });
      }
    })
  },
  // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象
  onShow() {

    var _this = this;

    wx.getLocation({
      type: 'wgs84',
      success(res) {
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    })

    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    console.log(location)
    if (location != null) {
      this.lxgh(location);
    } else {
      //this.selection();
    }
  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  //路线规划
  lxgh: function (e) {
    let plugin = requirePlugin('routePlan');
    const key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
    const referer = '小程序选点'; //调用插件的app的名称
    let endPoint = JSON.stringify({ //终点
      'name': e.name,
      'latitude': e.latitude,
      'longitude': e.longitude
    });
    wx.navigateTo({
      url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
    });
    chooseLocation.setLocation(null);
  },






  //在Page({})中使用下列代码
  //触发表单提交事件，调用接口
  formSubmit(e) {
    var _this = this;
    //调用距离计算接口
    qqmapsdk.direction({
      mode: 'transit', //'transit'(公交路线规划)
      //from参数不填默认当前地址
      from: e.detail.value.start,
      to: e.detail.value.dest,
      success: function (res) {
        console.log(res);
        var ret = res.result.routes[0];
        var count = ret.steps.length;
        var pl = [];
        var coors = [];
        //获取各个步骤的polyline
        for (var i = 0; i < count; i++) {
          if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
            coors.push(ret.steps[i].polyline);
          }
          if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
            coors.push(ret.steps[i].lines[0].polyline);
          }
        }
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 0; i < coors.length; i++) {
          for (var j = 2; j < coors[i].length; j++) {
            coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
          }
        }
        //定义新数组，将coors中的数组合并为一个数组

        var coorsArr = [];
        for (var i = 0; i < coors.length; i++) {
          coorsArr = coorsArr.concat(coors[i]);
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coorsArr.length; i += 2) {
          pl.push({
            latitude: coorsArr[i],
            longitude: coorsArr[i + 1]
          })
        }
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 4
          }]
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
        _this.setData({
          list: res.result.routes
        })
      }
    });
  },
  start: function () {
    console.log("---")
    var _this = this;
    wx.chooseLocation({
      success(res) {
        _this.setData({
          start: res.latitude + "," + res.longitude
        })
      }
    })

  },
  dest: function () {
    var _this = this;
    console.log("+++")
    wx.chooseLocation({
      success(res) {
        _this.setData({
          dest: res.latitude + "," + res.longitude
        })
      }
    })
  }

})