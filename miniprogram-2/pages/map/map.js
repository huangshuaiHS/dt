// 引入wx-jssdk
import QQMapWX from '../../utils/qqmap-wx-jssdk.js';
var qqmapsdk;
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    latitude: 29.570043563842773,
    longitude: 106.5005874633789,
    mapw: '100%',
    maph: '0',
    scale: '16',
    markers: [], // 把从腾讯地图SDK获取的位置存起来，以后每次点击就不用请求了。
    // 当前选中第几个
    xmwzB_index: 0,
    // tab列表
    tabs: [{
        ico: '../../images/gj1.png',
        ico_active: '../../images/gj2.png',
        name: '公交站'
      },
      {
        ico: '../../images/dt11.png',
        ico_active: '../../images/dt22.png',
        name: '地铁站'
      },
      {
        ico: '../../images/jy1.png',
        ico_active: '../../images/jy2.png',
        name: '加油站'
      },
      {
        ico: '../../images/tc1.png',
        ico_active: '../../images/tc2.png',
        name: '停车场'
      },
      {
        ico: '../../images/cs1.png',
        ico_active: '../../images/cs2.png',
        name: '公共厕所'
      },
    ]
  },
  mapCtx: null,
  onLoad: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR' //你腾讯位置服务的key
    });
    this.mapCtx = wx.createMapContext('map')
    wx.getSystemInfo({
      success: res => {
        var mapw = res.windowWidth
        var maph = res.windowHeight
        this.setData({
          maph: maph + 'px',
        })
      }
    })
  },
  onReady: function () {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
        this.getFood(res.longitude, res.latitude)
      }
    })
  },
  controltap() {
    this.setData({
      scale: '16'
    })
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
  },
  //点击回到初始位置
  // bindControlTap(e) {
  //   console.log(e.controlId)
  //   if (e.controlId === 1) {
  //     this.mapCtx.moveToLocation()
  //   }
  // },
  //滑动获取周围的餐厅
  bindRegionChange(e) {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
   // if (e.type === 'end') {
      this.mapCtx.getCenterLocation({
        success: res => {
          this.getFood(res.longitude, res.latitude)
        }
      })
   // }
  },
  // 点击tab切换
  xmwzB_click(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.setData({
      xmwzB_index: index
    }, () => {
      that.getFood(that.data.longitude, that.data.latitude);
      //回到哪儿的界面
      that.controltap();
    });
  },
  getFood: function (longitude, latitude) {
    var _this = this;
    var index = _this.data.xmwzB_index;

    qqmapsdk.search({
      keyword: _this.data.tabs[index].name,
      location: {
        longitude: longitude,
        latitude: latitude
      },
      page_size: 15,
      success: res => {
        var mark = []
        console.log(res)
        for (let i in res.data) {
          mark.push({
            title: res.data[i].title,
            id: res.data[i].id,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: _this.data.tabs[index].ico_active, //图标路径
            width: 30,
            height: 30,
            address: res.data[i].address,
            callout: {
              content: res.data[i].title,
              color: '#404040',
              bgColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#8a8a8a',
              fontSize: 14,
              padding: 10,
              borderRadius: 10,
              display: 'BYCLICK' //'BYCLICK':点击显示; 'ALWAYS':常显
            }
          })
        }
        //获取中心点
        // mark.push({
        //   //iconPath: '../../images/dt1.png',
        //   longitude: longitude,
        //   latitude: latitude,
        //   width: 20,
        //   height: 20,
        // })

        this.setData({
          markers: mark
        })
      }
    })
  }, // 地图上的气泡点击事件绑定，具体详情可参考微信小程序地图api
  callouttap(e) {
    var that = this;
    var marks = that.data.markers;
    // 点击某个tab下的某个气泡，其他气泡恢复为初始状态，点击的气泡变为选中状态
    // 同时把选中的状态的气泡信息存入到location对应位置(给点击跳转导航做准备)
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].callout == undefined) {
        continue
      }
      marks[i].callout.bgColor = '#ffffff';
      marks[i].callout.color = '#404040'
      marks[i].callout.borderColor = '#8a8a8a'

    }
    that.setData({
      markers: marks,
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.bgColor']: '#558ef9',
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.color']: '#ffffff',
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.borderColor']: '#558ef9',
      ['location[' + that.data.xmwzB_index + ']']: that.data.markers[that.data.markers.findIndex((n) => n.id == e.markerId)]
    });
    that.show_big_map();
  },
  // 小程序地图api，跳转大地图
  show_big_map: function () {
    var that = this;
    var location_c = that.data.location[that.data.xmwzB_index];
    var lat_c = location_c.latitude ? location_c.latitude : '';
    var lng_c = location_c.longitude ? location_c.longitude : '';
    var name_c = location_c.title ? location_c.title : '';
    // var address_c = location_c.address ? location_c.address : '';

    // if (location_c && lat_c && lng_c && name_c && address_c) {
    //   wx.getLocation({ //获取当前经纬度
    //     type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息  
    //     success: function (res) {
    //       wx.openLocation({ //​使用微信内置地图查看位置。
    //         latitude: lat_c, //要去的纬度-地址
    //         longitude: lng_c, //要去的经度-地址
    //         name: name_c,
    //         address: address_c
    //       });
    //     }
    //   })
    // }
    //导航去浮标的位置
    if (location_c && lat_c && lng_c && name_c) {
      let plugin = requirePlugin('routePlan');
      let key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
      let referer = '浮标位置'; //调用插件的app的名称
      let endPoint = JSON.stringify({ //终点
        'name': name_c,
        'latitude': lat_c, //要去的纬度-地址
        'longitude': lng_c, //要去的经度-地址
      });
      wx.navigateTo({
        url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
      });
    }
  },
  //点击获取当前位置
  bindtap(e) {
    //console.log("进来了")
    // console.log(e)
    // var latitude =e.detail.latitude;
    // var longitude = e.detail.longitude;
    // wx.openLocation({
    //   latitude,
    //   longitude,
    //   scale: 16
    // })

    const key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR'; //使用在腾讯位置服务申请的key
    const referer = '小程序导航'; //调用插件的app的名称

    const location = JSON.stringify({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude
    });
    const category = '交通设施,酒店宾馆,专科医院';

    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    });


  },
  //导航功能
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
        const category = '娱乐休闲,旅游景点,银行金融';

        wx.navigateTo({
          url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
        });
      }
    })


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
  // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象
  onShow: function () {
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (location != null) {
      this.planning(location);
    }
  },
  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  //路线规划
  planning(e) {
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
  }
})