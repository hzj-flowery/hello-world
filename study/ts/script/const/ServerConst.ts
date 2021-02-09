export default class ServerConst {
    public static  SERVER_STATUS_NORMAL = 1	//正常	
    public static  SERVER_STATUS_NEW = 2	//新开	
    public static  SERVER_STATUS_HOT = 3	//火爆	
    public static  SERVER_STATUS_MAINTENANCE = 4	//维护	
    public static  SERVER_STATUS_CLOSE = 5	//停服	
    public static  SERVER_STATUS_MERGE = 6	//合服	
    public static  SERVER_STATUS_COMING = 7	//即将开启	
    public static  SERVER_STATUS_CONFIGURED = 8	//已配服	
    public static  SERVER_STATUS_WAIT_OPEN = 9	//待开启	
    public static  SERVER_STATUS_GRAY = 11	//灰度测试服务器
    public static SERVER_STATUS_COMING_CLIENT = 12;	

    public static  SHOW_BIG_STATUS_ICON = {
        [ServerConst.SERVER_STATUS_NEW]: true,
        [ServerConst.SERVER_STATUS_COMING]: true,
        [ServerConst.SERVER_STATUS_CONFIGURED]: true,
        [ServerConst.SERVER_STATUS_WAIT_OPEN]: true,
        [ServerConst.SERVER_STATUS_GRAY]: true,
        [ServerConst.SERVER_STATUS_COMING_CLIENT]: true
    }
    
    
    public static  SECRET_KEY_LIST = [//秘钥列表32位
        "73b7e2824d3b57a31b8968e01e144457",
        "34ed066df378efacc9b924ec161e7639",
        "9813b270ed0288e7c0388f0fd4ec68f5",
    ]

    public static  isNeedSecretKeyServer = function (serverStatus) {
        if (serverStatus == ServerConst.SERVER_STATUS_COMING || serverStatus == ServerConst.SERVER_STATUS_CONFIGURED || serverStatus == ServerConst.SERVER_STATUS_WAIT_OPEN) {
            return true;
        }
        return false;
    };
    public static hasMatchedSecretKey = function (content) {
        if (content == null || content == '') {
            return false;
        }
        var md5Str = window['md5'](content);
        cc.warn(' ServerConst ...  ' + (md5Str));
        for (var k in ServerConst.SECRET_KEY_LIST) {
            var v = ServerConst.SECRET_KEY_LIST[k];
            if (md5Str == v) {
                return true;
            }
        }
        return false;
    };
}