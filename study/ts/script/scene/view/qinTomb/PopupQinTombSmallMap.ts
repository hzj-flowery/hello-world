import PopupBase from "../../../ui/PopupBase";
import { G_EffectGfxMgr, G_UserData } from "../../../init";
import { QinTombConst } from "../../../const/QinTombConst";
import { QinTombHelper } from "./QinTombHelper";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupQinTombSmallMap extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelBk: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _imageMapBG: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _buttonClose: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _autoMovingNode: cc.Node = null;


    public onCreate() {
        G_EffectGfxMgr.createPlayGfx(this._autoMovingNode, 'effect_xianqinhuangling_zidongxunluzhong', null, true);
        this._autoMovingNode.active = (false);
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelClick));
    }

    public onClickButton(sender) {
        this.close();
    }

    public onEnter() {
    }

    public onExit() {
    }

    public convertToBigMapPos(pos) {
        pos.x = pos.x * QinTombConst.CAMERA_SCALE_MAX;
        pos.y = pos.y * QinTombConst.CAMERA_SCALE_MAX;
        return pos;
    }

    public convertToSmallMapPos(pos) {
        pos.x = pos.x * QinTombConst.CAMERA_SCALE_MIN;
        pos.y = pos.y * QinTombConst.CAMERA_SCALE_MIN;
        return pos;
    }

    private _onUpdate(dt) {
        this.updateSelf();
    }

    public updateSelf(selfPosX?, selfPosY?, monsterKey?) {
        QinTombHelper.updateSelfNode(this._imageMapBG, selfPosX, selfPosY);
        QinTombHelper.updateTargetNode(this._imageMapBG);
        QinTombHelper.updateMiniMapAttackTeam(this._imageMapBG, monsterKey);
        QinTombHelper.updateMiniMapMonsterFight(this._imageMapBG);
        this.updateAuotMovingEffect();
    }

    private _onPanelClick(sender: cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            var endX = sender.getLocation().x * QinTombConst.CAMERA_SCALE_MAX;
            var endY = sender.getLocation().y * QinTombConst.CAMERA_SCALE_MAX;
            var endPos = this._panelTouch.convertToNodeSpaceAR(sender.getLocation());
            endPos = this.convertToBigMapPos(endPos);
            var clickPoint = G_UserData.getQinTomb().findPointKey(endPos);
            var selfTeam = G_UserData.getQinTomb().getSelfTeam();
            if (QinTombHelper.checkTeamLeaveBattle(selfTeam, clickPoint)) {
                return;
            }
            if (QinTombHelper.checkTeamCanMoving(selfTeam, clickPoint)) {
                QinTombHelper.movingTeam(selfTeam.getTeamId(), clickPoint);
            }
        }
    }

    public updateAuotMovingEffect() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return;
        }
        this._autoMovingNode.active = (false);
        if (selfTeam.getCurrState() == QinTombConst.TEAM_STATE_MOVING) {
            this._autoMovingNode.active = (true);
        }
    }
}