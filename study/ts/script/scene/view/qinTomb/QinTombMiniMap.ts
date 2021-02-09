import PopupQinTombSmallMap from "./PopupQinTombSmallMap";
import { handler } from "../../../utils/handler";
import { G_UserData, G_EffectGfxMgr, G_SceneManager } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";
import { QinTombConst } from "../../../const/QinTombConst";
import { QinTombHelper } from "./QinTombHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QinTombMiniMap extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panelBk: cc.Node = null;

    @property({ type: cc.ScrollView, visible: true })
    _scrollView: cc.ScrollView = null;

    @property({ type: cc.Node, visible: true })
    _effectNode: cc.Node = null;

    private _smallMapDlg: PopupQinTombSmallMap;
    private _smallMapDlgSignal;

    public onLoad() {
        this._panelBk.on(cc.Node.EventType.TOUCH_END, handler(this, this._onClickButton));
        this._scrollView.enabled = false;
    }

    public updateEffect() {
        var selfTeamUnit = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeamUnit && selfTeamUnit.isSelfTeamLead()) {
            if (G_UserData.getQinTomb().isShowEffect() == false) {
                this._playEffect();
            }
        }
    }

    private _playEffect() {
        this._effectNode.removeAllChildren();
        function effectFunction(effect) {
            if (effect == 'txt') {
                var textWidget = UIHelper.createLabel({
                    text: Lang.get('qin_tomb_minimap_tips'),
                    fontSize: 20,
                    color: cc.color(138, 255, 0),
                    outlineColor: cc.color(23, 86, 1)
                });
                return textWidget;
            }
        }
        function eventFunction(event) {
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, 'moving_xianqinhuangling_xiaoditutishi', effectFunction, eventFunction);
    }

    private _removeEffect() {
        this._effectNode.removeAllChildren();
        G_UserData.getQinTomb().setShowEffect();
    }

    private _onClickButton(sender) {
        if (this._smallMapDlg == null) {
            G_SceneManager.openPopup(Path.getPrefab("PopupQinTombSmallMap", "qinTomb"), (popupQinTombSmallMap:PopupQinTombSmallMap) => {
                this._smallMapDlg = popupQinTombSmallMap;
                this._smallMapDlgSignal = this._smallMapDlg.signal.add(handler(this, this._onPopupSmallMapDlgClose));
                this._removeEffect();
                this._smallMapDlg.open();
            })
        }
    }

    private _onPopupSmallMapDlgClose(event) {
        if (event == 'close') {
            this._smallMapDlg = null;
            if (this._smallMapDlgSignal) {
                this._smallMapDlgSignal.remove();
                this._smallMapDlgSignal = null;
            }
        }
    }

    public onEnable() {
        this.updateEffect();
    }

    public onDisable() {
    }

    public updateCamera(cameraX, cameraY) {
        this._scrollView.content.setPosition(cameraX, cameraY);
    }

    public convertToSmallMapPos(pos) {
        pos.x = pos.x * QinTombConst.CAMERA_SCALE_MIN;
        pos.y = pos.y * QinTombConst.CAMERA_SCALE_MIN;
        return pos;
    }

    public updateSelf(selfPosX, selfPosY, monsterKey) {
        QinTombHelper.updateSelfNode(this._scrollView.content, selfPosX, selfPosY);
        QinTombHelper.updateTargetNode(this._scrollView.content);
        QinTombHelper.updateMiniMapAttackTeam(this._scrollView.content, monsterKey);
        QinTombHelper.updateMiniMapMonsterFight(this._scrollView.content);
        if (this._smallMapDlg) {
            this._smallMapDlg.updateSelf(selfPosX, selfPosY, monsterKey);
        }
    }
}