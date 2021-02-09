import ViewBase from "../../ViewBase";
import { G_EffectGfxMgr, G_ServerTime, G_UserData } from "../../../init";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import { GuildWarCheck } from "../../../utils/logic/GuildWarCheck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarMoveSignNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDragon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCd: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _progressRing: cc.Sprite = null;
    

    _effectNode;
    _data: any;
    _showEffect: boolean;
    _listener: any;

    onCreate() {
        this._createProgress();
        this._effectNode = G_EffectGfxMgr.createPlayMovingGfx(this._panelTouch, 'moving_juntuanzhan_jiantou', null, null, false);
    }
    onEnter() {
        this._startTimer();
    }
    onExit() {
        this._endTimer();
    }
    _startTimer() {
        this.schedule(this._onRefreshTick, 0.5);
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick)
    }
    _onRefreshTick(dt) {
        if (this._data) {
            this._refreshTimeView();
        }
    }
    updateInfo(data) {
        this._data = data;
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(data.cityId, data.pointId);
        let res = config.click_point.split("|");

        var clickPointX = res[0];
        var clickPointY = res[1];
        this.node.setPosition(clickPointX, clickPointY);
        this._refreshTimeView();
    }
    _refreshTimeView() {
        var canMove = true;
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._data.cityId);
        var moveTime = guildWarUser.getMove_time();
        var moveCD = GuildWarDataHelper.getGuildWarMoveCD();
        var curTime = G_ServerTime.getMSTime() - 999;
        if (curTime <= (moveTime + moveCD) * 1000) {
            canMove = false;
            var second = (moveTime + moveCD) * 1000 - curTime;
            second = Math.max(0, second);
            this._textCd.string = (Lang.get('guildwar_move_cd', { value: Math.ceil(second / 1000) }));
            this._progressRing.node.active = (true);
            this._progressRing.fillRange = (second / (moveCD * 1000));
            this._effectNode.node.active = (false);
            this._showEffect = true;
        } else {
            this._textCd.string = ('');
            this._progressRing.node.active = (false);
            this._effectNode.node.active = (true);
            if (this._showEffect) {
                this._showEffect = false;
            }
        }
    }
    onPointClick(sender, state) {
        if (this._listener) {
            this._listener(this._data.cityId, this._data.pointId);
        }
        this._onButtonMove();
    }
    _onButtonMove() {
        var success = GuildWarCheck.guildWarCanMove(this._data.cityId, this._data.pointId, false, true)[0];
        if (success) {
            var pointId = this._data.pointId;
            G_UserData.getGuildWar().c2sMoveGuildWarPoint(pointId);
        }
    }
    _createProgress() {
        // var pic = Path.getGuildWar('img_war_com02d');
        // this._progressRing = new cc.ProgressTimer(new cc.Sprite(pic));
        // this._progressRing.setReverseDirection(true);
        // var size = this._panelTouch.getContentSize();
        // this._progressRing.setPosition(size.width * 0.5, size.height * 0.5);
        // this._panelTouch.addChild(this._progressRing);
    }
    setOnPointClickListener(listener) {
        this._listener = listener;
    }

}