// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
const chooseLocation = requirePlugin('chooseLocation');

Page({

  onLoad: function () {
    // this.metro();
  },
      // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象

  onShow: function () {
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if(location != null){
      this.planning(location);
    }
  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  //路线规划
  planning(e){
    console.log(e)
    let plugin = requirePlugin('routePlan');
    let key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
    let referer = '浮标位置'; //调用插件的app的名称
    let endPoint = JSON.stringify({ //终点
      'name': e.name,
      'latitude': e.latitude, //要去的纬度-地址
      'longitude': e.longitude, //要去的经度-地址
    });
    wx.navigateTo({
      url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
    });
    chooseLocation.setLocation(null);
  },
  metro: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'
    });
    let plugin = requirePlugin("subway");
    let key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key;
    let referer = '小程序导航'; //调用插件的app的名称
    wx.navigateTo({
      url: 'plugin://subway/index?key=' + key + '&referer=' + referer
    })
  },
  navigation() {
    var _this = this;
    const key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
    const referer = '小程序导航'; //调用插件的app的名称

    //获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        const location = JSON.stringify({
          latitude: res.latitude,
          longitude: res.longitude
        });
        const category = '生活服务,娱乐休闲';
    
        wx.navigateTo({
          url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
        });
      }
    })
  }

})