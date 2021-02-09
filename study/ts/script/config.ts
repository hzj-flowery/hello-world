export namespace config {
    // 0 - disable debug info, 1 - less debug info, 2 - verbose debug info
    export var DEBUG = 2

    export var FIGHT_REPORT_SAVE_FILE = false;

    // 开发模式
    export var APP_DEVELOP_MODE = false

    // 开启新手引导
    export var CONFIG_TUTORIAL_ENABLE = true

    // use framework, will disable all deprecated API, false - use legacy API
    export var CC_USE_FRAMEWORK = true

    // for module display
    export var CC_DESIGN_RESOLUTION = {
        width: 1136,
        height: 640,
        autoscale: "FIXED_WIDTH", //"FIXED_HEIGHT",
    }

    // 开启战斗伤害转换（万）
    export var CONFIG_SHOW_BATTLEHURT_CONVERT = false

    export var MAIN_FRAME_MAX = 45

    // 语言版本 默认zh
    export var CONFIG_LANG = "zh"

    // 资源版本号
    export var VERSION_RES = "99.99.99"

    export var LOGIN_URL_TEMPLATE = "#domain#/topserver/user/getToken?data=#data#"
    export var LOGIN_URL = "https://chongh5p.sgsbaye.com"

    export var PAY_GET_ORDER_ID_URL_TEMPLATE = "#domain#/topserver/pay/getOrderID?data=#data#"
    export var PAY_QUERY_URL_TEMPLATE = "#domain#/topserver/pay/h5game/query?orderID=#orderID#&channelID=#channelID#&userID=#userID#&accountType=#accountType#&openID=#openID#&openKey=#openKey#&pf=#pf#&pfkey=#pfkey#&zoneid=#zoneid#&sign=#sign#"
    export var PAY_CHARGE_URL_TEMPLATE = "#domain#/topserver/pay/h5game/charge?orderID=#orderID#&channelID=#channelID#&userID=#userID#&accountType=#accountType#&openID=#openID#&openKey=#openKey#&pf=#pf#&pfkey=#pfkey#&zoneid=#zoneid#&sign=#sign#"
    export var PAY_URL = "https://chongh5p.sgsbaye.com"

    // GM配置文件url
    export var CONFIG_URL_TEMPLATE = "#domain#/api?service=cfg&cmd=get&o=#o#&g=#g#&v=#v#&r=#r#&d=#d#&p=#p#&t=#t#"
    export var CONFIG_URL = ""

    // 服务器列表url
    export var SERVERLIST_URL_TEMPLATE = "#domain#/scenes?userId=#userId#&gameId=#gameId#&gameOpId=#gameOpId#&opId=#opId#&time=#time#"//&columns=name%7Cfirst_opentime"
    export var SERVERLIST_URL = "https://chaxunh5p.sgsbaye.com"

    // 网关列表url
    export var GATEWAYLIST_URL_TEMPLATE = "#domain#/gates"
    export var GATEWAYLIST_URL = "https://chaxunh5p.sgsbaye.com"

    // 角色列表url
    export var ROLELIST_URL_TEMPLATE = "#domain#/getroleinfo?uuid=#uuid#&opid=#opId#&opgameid=#gameOpId#"
    export var ROLELIST_URL = "https://chaxunh5p.sgsbaye.com"

    // 公告url
    export var NOTICE_URL = "https://gonggaoh5p.sgsbaye.com/static/testh5.json?h1"

    export var VERSION_URL = "https://zm.rzcdz2.com/mingjiangzhuan/config"

    export var ROLELIST_URL_TEMPLATE = "#domain#/getroleinfo?uuid=#uuid#&opid=#opId#&opgameid=#gameOpId#";
    export var ROLELIST_URL = 'https://jueseh5p.sgsbaye.com';

    // 本地开发
    // 运营商
    export var SPECIFIC_OP_ID = 1
    // 运营平台
    export var SPECIFIC_GAME_OP_ID = 1000;
    // 游戏id
    export let SPECIFIC_GAME_ID = 1
    // 测试token
    export var TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8";//"9d4923d485d78a95503d7979173a2876";
    export var WEBSOCKET_IP = "wss://wangguanh5.sgsbaye.com";
    export var WEBSOCKET_PORT = 443;
    export var RECHARGE_TEST_URL = 'https://chongh5.sgsbaye.com/topserver';//"139.224.196.247:9999"

    export var ENV = 3;   // 0: 内网  1：外网合服  2：214网页 3:线上正式服

    export var  VERSION = "99.99.99";

    export var remoteCfg:any = {};
}
