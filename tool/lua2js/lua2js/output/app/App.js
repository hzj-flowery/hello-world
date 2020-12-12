var App = cc.Class({
    name: 'App',
    ctor: function () {
        math.randomseed(os.time());
        require('app.ui.component.init');
        require('init');
        var status = pcall(function () {
                require('app.develop.init');
            }), ret;
        if (!status) {
            print(ret);
        }
        pbc.readFile('proto/cs.proto', 'cs.proto');
    },
    run: function () {
        cc.Director.getInstance().setAnimationInterval(1 / MAIN_FRAME_MAX);
        cc.Device.setKeepScreenOn(true);
        var CGHelper = require('app.scene.view.cg.CGHelper');
        if (CGHelper.checkCG()) {
            G_SceneManager.showScene('cg', 'start.mp4');
        } else {
            var currentAppVersion = G_NativeAgent.getAppVersion();
            var Version = require('yoka.utils.Version');
            var r = Version.compare('2.1.5', currentAppVersion);
            if (r != Version.CURRENT) {
                G_SceneManager.showScene('logo');
            } else {
                G_SceneManager.showScene('login');
            }
        }
    }
});
module.exports = App;