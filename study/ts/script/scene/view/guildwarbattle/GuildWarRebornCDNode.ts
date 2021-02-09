import ViewBase from "../../ViewBase";
import { G_ResolutionManager, G_UserData, G_ServerTime } from "../../../init";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarRebornCDNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelShadow: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;
    _countDown: boolean;

    ctor() {
        this._countDown = false;
    }
    onCreate() {
        var size = G_ResolutionManager.getDesignSize();
        this.node.setContentSize(G_ResolutionManager.getDesignWidth(), G_ResolutionManager.getDesignHeight());
        this._panelShadow.setContentSize(cc.size(size[1], size[2]));
        this.node.x = 0;
        this.node.y = 0;
    }
    onEnter() {
    }
    onExit() {
    }
    startCountdown() {
        this.schedule(this._onRefreshTick, 1);
        this._onRefreshTick(null);
    }
    stopCountdown() {
        this.unschedule(this._onRefreshTick);
    }
    _onRefreshTick(dt) {
        this.refreshCdTimeView(null, null);
    }
    startCD() {
        this.node.active = (true);
        this._countDown = true;
    }
    refreshCdTimeView(cityId, finishCall) {
        if (this._countDown == false) {
            return;
        }
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        var rebornTime = guildWarUser.getRelive_time();
        var curTime = G_ServerTime.getTime();
        if (curTime <= rebornTime) {
            this._textTime.string = ((rebornTime - curTime).toString());
        } else {
            this._textTime.string = ('0');
            this.node.active = (false);
            this._countDown = false;
            if (finishCall) {
                finishCall();
            }
        }
        return true;
    }
    updateVisible(cityId) {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(cityId);
        var isInBorn = guildWarUser.isInBorn();
        this.node.active = (isInBorn);
    }

}