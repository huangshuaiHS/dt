// 引入wx-jssdk
import QQMapWX from '../../utils/qqmap-wx-jssdk.js';
var qqmapsdk;
Page({
  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    mapw: '100%',
    maph: '0',
    scale: '18',
    markers: [],
    // 当前选中第几个
    xmwzB_index: 0,
    // tab列表
    tabs: [{
        ico: '../../images/公交站 (1).png',
        ico_active: '../../images/公交站 (2).png',
        name: '公交站'
      },
      {
        ico: '../../images/地铁站.png',
        ico_active: '../../images/地铁站1.png',
        name: '地铁站'
      },
      {
        ico: '../../images/停车场.png',
        ico_active: '../../images/停车场 (1).png',
        name: '停车场'
      },
      {
        ico: '../../images/医院.png',
        ico_active: '../../images/医院 (1).png',
        name: '医院'
      },
      {
        ico: '../../images/厕所.png',
        ico_active: '../../images/厕所 (1).png',
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
          controls: [{
            id: 1,
            iconPath: '/images/shouzhi.png',
            position: {
              left: 10,
              top: maph - 50,
              width: 30,
              height: 20
            },
            clickable: true //可以点击
          }]
        })
      }
    })
  },
  onReady: function () {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log(res)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
        this.getFood(res.longitude, res.latitude)
      }
    })
  },
  //点击回到初始位置
  bindControlTap(e) {
    console.log(e.controlId)
    if (e.controlId === 1) {
      this.mapCtx.moveToLocation()
    }
  },
  //滑动获取周围的餐厅
  bindRegionChange(e) {
    if (e.type === 'end') {
      this.mapCtx.getCenterLocation({
        success: res => {
          this.getFood(res.longitude, res.latitude)
        }
      })
    }
  },
  // 点击tab切换
  xmwzB_click(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.setData({
      xmwzB_index: index
    }, () => {
      var name = that.data.tabs[index].name;
      that.getFood(that.data.longitude, that.data.latitude);
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
            width: 20,
            height: 20,
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
              display: 'ALWAYS'
            }
          })
        }
        //获取中心点
        // mark.push({
        //   //iconPath: '../../images/dt1.png',
        //   id: res.data.length,
        //   longitude: longitude,
        //   latitude: latitude,
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
      navigation: true,
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
    if (location_c && lat_c && lng_c && name_c && address_c) {
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
  }

})