import ViewBase from "../../ViewBase";
import { G_UserData, G_ServerTime, G_ResolutionManager } from "../../../init";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossWarRebornCDNode extends ViewBase {

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
    _countDown: any;


    onCreate() {
        var size = G_ResolutionManager.getDesignSize();
        this._panelShadow.setContentSize(cc.size(size[1], size[2]));
        // this._panelShadow.setSwallowTouches(true);
    }
    onEnter() {
    }
    onExit() {
    }
    isInReborn() {
        return this._countDown;
    }
    startCD() {
        this.node.active = (true);
        this._countDown = true;
    }
    refreshCdTimeView(finishCall) {
        if (this._countDown == false) {
            return;
        }
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit) {
            var rebornTime = selfUnit.getRevive_time();
            var curTime = G_ServerTime.getTime();
            if (curTime <= rebornTime) {
                var leftTime = rebornTime - curTime;
                this._textTime.string = (leftTime + "");
            } else {
                this._textTime.string = (' ');
                this.node.active = (false);
                this._countDown = false;
                if (finishCall) {
                    finishCall();
                }
            }
        }
        return true;
    }
    updateVisible() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit) {
            var isInBorn = selfUnit.getCurrState() == GuildCrossWarConst.UNIT_STATE_DEATH;
            this.node.active = (isInBorn);
        }
    }
}