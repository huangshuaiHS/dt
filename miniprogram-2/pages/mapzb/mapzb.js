
// 引入wx-jssdk
import QQMapWX from '../../utils/qqmap-wx-jssdk.js';
//var key = '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR';

// 实例化API核心类(先声明一下)
var qqmapsdk;

Page({
  data: {
    //当前的位置
    latitude:"",
    longitude:"",
    district:""
    //跟着地图动的点
    // markers: [{
    //   iconPath: "/img/11.jpg",
    //   id: 0,
    //   latitude: "",
    //   longitude: "",
    //   width: 20,
    //   height: 20,
    //   detail:"",
    //   show_map:true
    // }
    // ],

  },
  //回到自己的位置
  go_center(){
    this.mapCtx.moveToLocation()
    // this.nearby_search()
  },
  //地图移动时触发
  bindregionchange: function (e) {
    var that = this
    if (e.type == "begin") {
      return
    } else if (e.type == "end") {

      //移动结束获取中心点位置
      this.mapCtx.getCenterLocation({
        success: function (res) {
          //更新下方附近
          that.nearby_search(res.latitude, res.longitude)
        }
        
      })
    }
  },
  //输入框的input事件
  getsuggest(e){
    let that = this
    this.setData({
      //赋值输入框的值
      detail:e.detail.value,
      //关闭地图
      show_map:true
    })
    //关键词输入提示
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值,如keyword:'KFC'
      success: function (res) {//搜索成功后的回调
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
          });
          that.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
            suggestion: sug
          });
        }
      
      },
      fail: function (error) {
        console.error(error);
      
      },
      complete: function (res) {

      }
    });
  },

  //选择输入框下面智能提示的内容
  backfill: function (e) {
    let item = this.data.suggestion.find(item=>{
      return item.id == e.currentTarget.id
    })
    this.setData({
      latitude: item.latitude,
      longitude: item.longitude,
      show_map:false
    })
    this.nearby_search(item.latitude, item.longitude)
    
  },
  //选择了地图下方的地址
  btn_bottom: function (e) {
    let item = this.data.suggestion1.find(item => {
      return item.id == e.currentTarget.id
    })
    this.setData({
      latitude: item.latitude,
      longitude: item.longitude,
    })

  },
  //显示附近
  nearby_search: function (latitude,longitude) {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      get_poi: 1,
      poi_options: 'policy=2;radius=3000;page_size=20;page_index=1',
      success: function (res) {
        
        var sug = [];
        for (let i = 0; i < res.result.pois.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.result.pois[i].title,
            id: res.result.pois[i].id,
            addr: res.result.pois[i].address,
            city: res.result.pois[i].city,
            district: res.result.pois[i].district,
            latitude: res.result.pois[i].location.lat,
            longitude: res.result.pois[i].location.lng,
          });
          that.setData({
            //赋值下方的附近内容
            suggestion1: sug,
            //赋值当前位置
            district:res.result.address
          });
        }
      },
      fail: function (res) {
      },
      complete: function (res) {
      }
    });

    
  },

  onLoad: function (options) {
    var that = this
    // 实例化腾信地图API核心类
    qqmapsdk = new QQMapWX({
      key: "BG4BZ-Q7DKU-RS5VO-44J37-I7OSQ-WNFL2"
    });
    //定位完成之前展示loading
    wx.showLoading({
      title: "定位中",
      mask: true
    })
    //创建地图
    this.mapCtx = wx.createMapContext('ofoMap')
    //获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        // const speed = res.speed
        // const accuracy = res.accuracy
        //赋值当前位置
        that.setData({
          latitude,
          longitude,
          // "markers[0].latitude": latitude,
          // "markers[0].longitude": longitude
        })
        //关闭loading
        wx.hideLoading()
        //地图下方展示附近
        that.nearby_search(latitude, longitude)
      }
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})