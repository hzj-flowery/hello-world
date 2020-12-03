"use strict";
(function(zm) {
    var URL = "https://ykdc.hzyoka.com/bfrd/json";
    var APP_ID = "205_706";
    function sendEvent(id, name, channel) {
        var data = {
            "app_id":APP_ID, 
            "events":[{
            "id":id,   //事件ID，100001：完成加载；100002：进入游戏
            "label": name, //事件名称，100001：完成加载；100002：进入游戏
            "start_time": Math.floor(Date.now() / 1000),    //业务发生时间，UTC时间戳(ctime:时间戳)
            "channel": channel || "" ,    //渠道标识,非常重要，就是他们的运营商代码
            "parameters":{
                "user_id": getUUID(),    //用户ID
            }
            }]}
            
        wx.request({
            url: URL,
            data: data,
            method:"POST"
        })
    }
    zm.sendEvent = sendEvent;

    function getRandom() {
        var nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        var rand;
        var temp;
        for (var i = 10; i > 1; i--) {
            rand = Math.floor(10 * Math.random()),
            temp = nums[rand];
            nums[rand] = nums[i - 1];
            nums[i - 1] = temp;
        }

        temp = 0;
        for (var i = 0; i < 5; i++) {
            temp = 10 * temp + nums[i];
        }
        return temp + "" + Date.now();
    }

    var UUIDKEY = "zmuuiddata"
    var uuid;
    function getUUID() {
        if (!uuid) {
            try {
                uuid = wx.getStorageSync(UUIDKEY);
            } catch (e) {
                
            }

            if (!uuid) {
                uuid = getRandom();
                wx.setStorage({
                    key: UUIDKEY,
                    data: uuid
                })
            }
        }

        return uuid;
    }

    // var channel;
    // function getChannle() {
    //     if (!channel) {
    //         var opt = wx.getLaunchOptionsSync();
    //         var scene = opt.scene;
    //         var query = opt.query;
    //         if (query && query.channel) {
    //             channel = query.channel;
    //         } else {
    //             switch (scene) {
    //                 case 1006:
    //                     channel = 90001;
    //                     break;
                
    //                 case 1007:
    //                 case 1008:
    //                 case 1044:
    //                     channel = 90002;
    //                     break;
    //                 case 1037:
    //                     channel = 90003;
    //                     break;
    //                 case 1035:
    //                 case 1058:
    //                     channel = 90004;
    //                     break;
    //                 case 1095:
    //                     channel = 90005;
    //                     break;
    //                 case 1079:
    //                     channel = 90006;
    //                     break;
    //                 default:
    //                     channel = "";
    //                     break;
    //             }
    //         }
    //     }

    //     return channel || "";
    // }

})(window.zm || (window.zm = {}))