
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: '6WMBZ-LQULS-5DBOS-6DRZO-XXT22-XLFBR' // 必填
});


Page({

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
        //console.error(error);
      },
      complete: function (res) {
        _this.setData({
          list:res.result.routes
        })
        for (var i = 0; i < res.result.routes.length; i++) {

          for (var j = 0; j < res.result.routes[i].steps.length; j++) {
            if(res.result.routes[i].steps[j].mode == "TRANSIT"){
              console.log(res.result.routes[i].steps[j].lines);

            }
          }
        }

      }
    });
  },
})