import { AudioConst } from "../../../const/AudioConst";
import { DataConst } from "../../../const/DataConst";
import { Colors, G_AudioManager, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import PopupChooseBase from "../../../ui/popup/PopupChooseBase";
import { RecoveryDataHelper } from "../../../utils/data/RecoveryDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import RecoveryRebornLayerBase from "./RecoveryRebornLayerBase";
import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RebornLayerBase extends RecoveryRebornLayerBase {
    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode: RecoveryRebornNodeBase = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBtnBg: cc.Sprite = null;

    @property({ type: CommonResourceInfo, visible: true })
    _fileNodeCost: CommonResourceInfo = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _buttonReborn: CommonButtonLevel0Highlight = null;

    onCreate() {
        this._recoveryRebornNodes = [this._fileNode];

        super.onCreate();
    }

    public onEnter() {
        this._buttonReborn.setString(Lang.get('reborn_btn'));
        var costCount = RecoveryDataHelper.getRebornCostCount();
        this._fileNodeCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        this._fileNodeCost.showResName(true, Lang.get('reborn_cost_title'));
        this._fileNodeCost.setTextColor(Colors.DARK_BG_ONE);
        super.onEnter();
    }

    public _rebornSuccess(eventName, awards) {
        RecoveryDataHelper.sortAward(awards);
        this._playEffect(awards);
    }

    protected _showAddPopup(title: string) {
        cc.resources.load(Path.getPrefab(this._popupCheckName, "common"), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            let popup: PopupChooseBase = cc.instantiate(res).getComponent(PopupChooseBase);
            popup.setTitle(title);
            popup.updateUI(this._popupCheckFromType, handler(this, this._onChooseItem));
            popup.openWithAction();
        }.bind(this));
    }

    protected _onChooseItem(data) {
        this._recoveryRebornList[0] = data;
        this._updateView();
    }

    private _playEffect(awards) {
        function eventFunction(event) {
            if (event == 'start') {
                G_EffectGfxMgr.applySingleGfx(this._fileNode.node, 'smoving_zhuangbei', null, null, null);
            } else if (event == 'play') {
                this._fileNode.node.active = (false);
            } else if (event == 'finish') {
                this._showPopupGetReward(awards)
                this._fileNode.node.active = true;
                this._resetNode();
                this._buttonReborn.setEnabled(true);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_chongsheng', null, eventFunction.bind(this), false);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_REBORN);
    }
}