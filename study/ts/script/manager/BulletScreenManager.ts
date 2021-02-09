import { BullectScreenConst } from "../const/BullectScreenConst";
import { SignalConst } from "../const/SignalConst";
import { G_ResolutionManager, G_SignalManager, G_TopLevelNode, G_UserData } from "../init";
import BulletScreenLayer from "../scene/view/bulletScreen/BulletScreenLayer";
import { handler } from "../utils/handler";

export class BulletScreenManager {
    public static MAX_RICH_SIZE = 100;
    _bulletState: {};
    _richList: any[];
    _signalBulletNotice: any;
    _bulletLayer: BulletScreenLayer;
    _schedule: cc.Component;
    constructor() {
        this._schedule = new cc.Component();
        this._bulletState = {};
        this._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false;
        this._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false;
    }
    clear() {
        this._richList = [];
        this._bulletState = {};
        this._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false;
        this._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false;
        if (this._signalBulletNotice) {
            this._signalBulletNotice.remove();
            this._signalBulletNotice = null;
        }
        this._schedule.unschedule(this._onUpdateNotice);
        this._resetBulletLayer(true);
    }
    _resetBulletLayer(cleanup) {
        if (!this._bulletLayer) {
            var node = new cc.Node();
            this._bulletLayer = node.addComponent(BulletScreenLayer);//new BulletScreenLayer();
            //this._bulletLayer.retain();
            node.setAnchorPoint(0,0);
            var width = G_ResolutionManager.getDesignWidth();
            var height = G_ResolutionManager.getDesignHeight();
            node.setContentSize(width,height);
            node.setPosition(-width/2,-height/2);
            G_TopLevelNode.addBulletLayer(this._bulletLayer.node);
            this._bulletLayer.node.name = ('BulletScreenLayer');
        }
        if (!cleanup) {
        } else {
            this._bulletLayer.node.destroy();
            // this._bulletLayer.release();
            this._bulletLayer = null;
        }
    }
    clearBulletLayer() {
        if(this._bulletLayer){
            this._bulletLayer.clear();
        }
        
        this._richList = [];
        this._bulletState = {};
        this._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false;
        this._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false;
        this.showBulletLayer();
    }
    hideBulletLayer(bulleType?) {
        if(this._bulletLayer&&this._bulletLayer.node)
        this._bulletLayer.node.active = (false);
    }
    showBulletLayer(bulleType?) {
        if(this._bulletLayer&&this._bulletLayer.node)
        this._bulletLayer.node.active = (true);
    }
    reset() {
    }
    start() {
        this._richList = [];
        this._bulletState = {};
        this._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false;
        this._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false;
        this._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false;
        if (this._signalBulletNotice) {
            this._signalBulletNotice.remove();
            this._signalBulletNotice = null;
        }
        this._resetBulletLayer(false);
        this._schedule.schedule(handler(this, this._onUpdateNotice), 0.0333);
        this._signalBulletNotice = G_SignalManager.add(SignalConst.EVENT_BULLET_SCREEN_NOTICE, handler(this, this._onEventBulletNotice));
        this._richList = [];
    }
    setBulletScreenOpen(bulletType, open) {
        this._bulletState[bulletType] = open;
    }
    isBulletScreenOpen(bulletType) {
        return this._bulletState[bulletType];
    }
    _onUpdateNotice() {
        function changeFontSize(richContent, fntSize) {
            if (richContent == null) {
                return '';
            }
            if (typeof (richContent) == 'object' && richContent.length > 0) {
                for (var i in richContent) {
                    var value = richContent[i];
                    value.fontSize = fntSize;
                }
            }
            return richContent;
        }
        var size = this._richList.length;
        if (this._richList.length > 0) {
            for (var i = 0; i < this._richList.length; i++) {
                var rich = this._richList[i];
                var richContent = rich[0];
                var noticeColor = rich[1];
                var message = rich[2] as any;
                var bulletWay = rich[3];
                var delayTime = 0;
                if (this._bulletLayer.pushTopRichText(richContent, delayTime, noticeColor, bulletWay) == true) {
                    G_SignalManager.dispatch(SignalConst.EVENT_BULLET_SCREEN_POST, message);
                    this._richList.splice(i, 1);
                    if (bulletWay && bulletWay > 0) {
                        if (bulletWay == BullectScreenConst.SHOWTYPE_POPUP_CENTER) {
                            this._bulletLayer.pushMiddleRichText(changeFontSize(richContent, 26), delayTime, message.sn_type);
                        }
                    } else {
                        if (noticeColor && noticeColor >= BullectScreenConst.COLOR_TYPE_4) {
                            this._bulletLayer.pushMiddleRichText(changeFontSize(richContent, 26), delayTime, message.sn_type);
                        }
                        if (message.sn_type == BullectScreenConst.GUILD_WAR_TYPE && (message.color == BullectScreenConst.BULLET_ID_GUILD_WAR_GATE_DEMOLISH || message.color == BullectScreenConst.BULLET_ID_GUILD_WAR_CRYSTAL_DEMOLISH)) {
                            this._bulletLayer.pushMiddleRichText(changeFontSize(richContent, 26), 1, message.sn_type);
                            this._bulletLayer.pushMiddleRichText(changeFontSize(richContent, 26), 2, message.sn_type);
                        }
                    }
                }
            }
        }
    }
    _checkCanAdd(tp, value) {
        if (!this._bulletState[tp]) {
            return false;
        }
        if (tp == BullectScreenConst.COUNTRY_BOSS_TYPE) {
            if (value && value.content) {
                var bossInfo = value.content[3 - 1];
                if (bossInfo && bossInfo.key == 'bossid') {
                    var final_vote = G_UserData.getCountryBoss().getFinal_vote();
                    var contentBossId = parseInt(bossInfo.value || -1);
                    if (final_vote == contentBossId) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }
    _onEventBulletNotice(id, message) {
        var pasreList = message["content"] || {};
        for (var i in pasreList) {
            var value = pasreList[i];
            if (1/* value.user && value.user.user_id 军团战弹幕消息没有这个参数后期可以改服务端代码*/) {
                var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(value.sn_type);
                if (this._richList.length <= BulletScreenManager.MAX_RICH_SIZE) {
                    if (this._checkCanAdd(value.sn_type, value)) {
                        var [richContent, messageColor, way] = G_UserData.getBulletScreen().parseBulletNotice(value, null);
                        this._richList.push([
                            richContent,
                            messageColor,
                            value,
                            way
                        ]);
                    }
                }
            }
        }
    }
}
