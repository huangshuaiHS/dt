// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  onLoad: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'
    });
  },
  onShow: function () {

    let plugin = requirePlugin("subway");
    let key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR';//使用在腾讯位置服务申请的key;
    let referer = '小程序导航'; //调用插件的app的名称
    wx.navigateTo({
     url: 'plugin://subway/index?key=' + key + '&referer=' + referer
    });


    // 调用接口
    // qqmapsdk.search({
    //   keyword: '酒店',
    //   success: function (res) {
    //     console.log(res); 
    //   },
    //   fail: function (res) {
    //     console.log(res);
    //   },
    //   complete: function (res) {
    //     console.log(res);
    //   }
    // })
  }
})