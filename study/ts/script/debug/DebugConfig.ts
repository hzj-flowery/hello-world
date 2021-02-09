
// 0:发送接收网络协议log不显示，1：发送接收网络协议全部显示（不包括心跳）2：只显示协议名称，协议内容不显示
export var NET_LOG = 2;

// 是否自动登陆
export var AUTO_LOGIN = false;

export var USER_ID = "123456";

// 开启跳过战斗
export var CONFIG_JUMP_BATTLE_ENABLE = true;
if (cc.sys.platform === cc.sys.WECHAT_GAME) {
    CONFIG_JUMP_BATTLE_ENABLE = false;
}

// 虚拟跑马
export var FAKE_HORCE_RUN = false

// 运营商
export var SPECIFIC_OP_ID = 1


export var RECHARGE_TEST_URL_TEMPLATE = "http://url/platform/recharge?gameID=#gameID#&extension=#extension#&productID=#productID#&orderID=#orderID#&sign=#sign#&platformID=#platformID#&userName=#userName#&serverID=#serverID#&orderTime=#orderTime#&money=#money#&signType=md5&currency=RMB&channelID=#channelID#"
export namespace SERVER_CONFIG1 {
    // 运营平台
    export let SPECIFIC_GAME_OP_ID = 1000
    // 游戏id
    export let SPECIFIC_GAME_ID = 1 
    // 测试token
    export let TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"; //"9d4923d485d78a95503d7979173a2876"  
    // GM配置文件
    export let CONFIG_URL = "http://42.192.74.49:38434"
    // 服务器列表
    export let SERVERLIST_URL = "http://42.192.74.49:38434"
    // 网关列表
    export let GATEWAYLIST_URL = "http://42.192.74.49:38434"
    export let WEBSOCKET_IP = "ws://42.192.74.49"
    export let WEBSOCKET_PORT = 8117
    export let SERVER_ID = [987]
    export var RECHARGE_TEST_URL = "https://chongh5.sgsbaye.com"
}
export namespace SERVER_CONFIG2 {
    // 运营平台
    export let SPECIFIC_GAME_OP_ID = 1001
    // 游戏id
    export let SPECIFIC_GAME_ID = 1
    // 测试token
    export let TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"
    // GM配置文件
    export let CONFIG_URL = "http://139.224.196.247:8787"
    // 服务器列表
    export let SERVERLIST_URL = "https://chaxunh5p.sgsbaye.com"
    // 网关列表
    export let GATEWAYLIST_URL = "http://139.224.196.247:38434"
    export let WEBSOCKET_IP = "wss://wangguanh5hefu.sgsbaye.com"
    export let WEBSOCKET_PORT = 443
    // export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 997, 987, 777, 800800008]
    export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 987]
    export var RECHARGE_TEST_URL = "https://chongh5.sgsbaye.com"
}

export namespace SERVER_CONFIG3 {
    // 运营平台
    export let SPECIFIC_GAME_OP_ID = 1004
    // 游戏id
    export let SPECIFIC_GAME_ID = 1
    // 测试token
    export let TOKEN_KEY = "9d4923d485d78a95503d7979173a2876"
    // GM配置文件
    export let CONFIG_URL = "http://139.224.196.247:8787"
    // 服务器列表
    export let SERVERLIST_URL = "http://139.224.196.247:38434";
    // 网关列表
    export let GATEWAYLIST_URL = "http://139.224.196.247:38434";
    export let WEBSOCKET_IP = "ws://139.224.196.247";
    export let WEBSOCKET_PORT = 8117
    // export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 997, 987, 777, 800800008]
    export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 987]
    export var RECHARGE_TEST_URL = "https://chongh5.sgsbaye.com"

    export var LOGIN_URL = "https://chongh5p.sgsbaye.com"
}

export namespace SERVER_CONFIG4 {
    // 运营平台
    export let SPECIFIC_GAME_OP_ID = 1000
    // 游戏id
    export let SPECIFIC_GAME_ID = 1
    // 测试token
    export let TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"
    // GM配置文件
    export let CONFIG_URL = "http://139.224.196.247:8787"
    // 服务器列表
    export let SERVERLIST_URL = "https://chaxunh5p.sgsbaye.com";
    // 网关列表
    export let GATEWAYLIST_URL = "https://chaxunh5p.sgsbaye.com";
    export let WEBSOCKET_IP = "wss://wangguanh5hefu.sgsbaye.com"
    export let WEBSOCKET_PORT = 443
    // export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 997, 987, 777, 800800008]
    export let SERVER_ID = [1, 2, 3, 4, 5, 6, 7, 8, 987]
    export var RECHARGE_TEST_URL = "https://chongh5.sgsbaye.com"

    export var LOGIN_URL = "https://chongh5p.sgsbaye.com"
}

