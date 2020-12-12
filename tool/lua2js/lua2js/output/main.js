function __G__TRACKBACK__(message) {
    var traceback = debug.traceback();
    var errors = '\nERROR: ' + (message + '\n');
    errors = errors + '>>>>>>>>>>>>>>>>>>>>>>>>>>>\n';
    errors = errors + (traceback + '\n');
    errors = errors + '<<<<<<<<<<<<<<<<<<<<<<<<<<<\n';
    var report = true;
    if (md5) {
        var key = md5.sum(errors);
        if (g_report_key[key] == 1) {
            report = false;
        } else {
            g_report_key[key] = 1;
        }
    }
    if (report) {
        print(errors);
        if (G_GameAgent != null) {
            G_GameAgent.reportCrash(message, traceback);
        }
        if (APP_DEVELOP_MODE || G_ConfigManager != null && G_ConfigManager.isError()) {
            var errorTip = '请将截图发送至相关人员\uFF01\n';
            if (G_ConfigManager != null) {
                var tip = G_ConfigManager.getErrorTip();
                if (tip != null && tip != '') {
                    errorTip = tip + '\n';
                }
            }
            MessageBox(errorTip + errors);
        }
    }
}
function crashPrint(log, level, tag) {
    print(log);
    if (G_NativeAgent != null) {
        G_NativeAgent.crashLog(log, level, tag);
    }
}
g_report_key = {};
g_package_loaded = {};
print('package.loaded-----------------------------');
for (k in package.loaded) {
    var _ = package.loaded[k];
    print(k);
    if (k != 'main.lua') {
        table.insert(g_package_loaded, k);
    }
}
print('package.loaded-----------------------------');
print('package.preload----------------------------');
for (k in package.preload) {
    var _ = package.preload[k];
    print(k);
}
print('package.preload----------------------------');
g_G = {};
print('_G-----------------------------------------');
for (k in _G) {
    var _ = _G[k];
    print(k);
    table.insert(g_G, k);
}
print('_G-----------------------------------------');
var fileUtils = cc.FileUtils.getInstance();
fileUtils.setPopupNotify(false);
require('config');
var status = pcall(function () {
        require('app.develop.config');
    }), ret;
if (!status) {
    print(ret);
}
require('cocos.init');
require('yoka.init');
cc.disable_global();
function main() {
    new (require('App'))().run();
}
var status = xpcall(main, __G__TRACKBACK__), msg;
if (!status) {
    print(msg);
}