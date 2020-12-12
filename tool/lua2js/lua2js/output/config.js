DEBUG = 2;
CC_USE_FRAMEWORK = true;
CC_DESIGN_RESOLUTION = {
    width: 1136,
    height: 640,
    autoscale: 'FIXED_WIDTH',
    callback: function (framesize) {
        var ratio = framesize.width / framesize.height;
        if (framesize.width == 1600 && framesize.height == 720) {
            return {
                width: 1400,
                height: 640,
                autoscale: 'EXACT_FIT'
            };
        }
        if (ratio > 1.8) {
            return {
                width: 1400,
                height: 640,
                autoscale: 'FIXED_HEIGHT'
            };
        }
    }
};
MAIN_FRAME_MAX = 45;
CONFIG_LANG = 'zh';
VERSION_RES = '99.99.99';
CONFIG_URL_TEMPLATE = '#domain#/api?service=cfg&cmd=get&o=#o#&g=#g#&v=#v#&r=#r#&d=#d#&p=#p#&t=#t#';
CONFIG_URL = '';
SERVERLIST_URL_TEMPLATE = '#domain#/scenes?userId=#userId#&gameId=#gameId#&gameOpId=#gameOpId#&opId=#opId#&time=#time#&columns=name%7Cfirst_opentime&isback=#isback#';
SERVERLIST_URL = '';
GATEWAYLIST_URL_TEMPLATE = '#domain#/gates';
GATEWAYLIST_URL = '';
ROLELIST_URL_TEMPLATE = '#domain#/getroleinfo?uuid=#uuid#&opid=#opId#&opgameid=#gameOpId#';
ROLELIST_URL = '';
RETURN_SERVER_CHECK_URL_TEMPLATE = '#domain#/getbackinfo?uuid=#uuid#';
RETURN_SERVER_CHECK_URL = '';
RETURN_SERVER_CHECK_URL_YOKA = 'http://106.14.25.179:10110';
RETURN_SERVER_CHECK_URL_DALAN = '';