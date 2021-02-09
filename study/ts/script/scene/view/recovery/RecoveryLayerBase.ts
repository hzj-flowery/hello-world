import RecoveryRebornLayerBase from "./RecoveryRebornLayerBase";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { Lang } from "../../../lang/Lang";
import { G_Prompt, G_EffectGfxMgr, G_SceneManager } from "../../../init";
import { RecoveryDataHelper } from "../../../utils/data/RecoveryDataHelper";
import RecoveryRebornNodeBase from "./RecoveryRebornNodeBase";
import { Path } from "../../../utils/Path";
import PopupCheckBase from "./PopupCheckBase";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RecoveryLayerBase extends RecoveryRebornLayerBase {

    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode5: RecoveryRebornNodeBase = null;

    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode4: RecoveryRebornNodeBase = null;

    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode3: RecoveryRebornNodeBase = null;

    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode2: RecoveryRebornNodeBase = null;

    @property({ type: RecoveryRebornNodeBase, visible: true })
    _fileNode1: RecoveryRebornNodeBase = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _buttonAutoAdd: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _buttonRecovery: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Node, visible: true })
    _nodeFlyTarget: cc.Node = null;

    private _showRedPoint: boolean;
    private _isNotShowLightEffect: boolean;

    public onCreate() {
        this._recoveryRebornNodes = [this._fileNode1, this._fileNode2, this._fileNode3, this._fileNode4, this._fileNode5];
        this._buttonAutoAdd.setString(Lang.get('recovery_btn_auto_add'));
        this._buttonRecovery.setString(Lang.get('recovery_btn_recovery'));
        this._showRedPoint = false;
        super.onCreate();
    }

    public onEnter() {
        super.onEnter();
        this.updateRedPoint();
    }

    protected _autoAddClicked(list: any[], tips: string) {
        if (list.length == 0) {
            G_Prompt.showTip(tips);
            return;
        }
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var heroData = this._getDataWithIndex(i);
            if (heroData == null) {
                for (const j in list) {
                    var data = list[j];
                    if (!this._checkIsAdded(data)) {
                        this._recoveryRebornList[i] = data;
                        break;
                    }
                }
            }
        }
        this._updateView();
        this.setRedPoint(false);
        this.updateRedPoint();
    }

    protected _onClickAdd() {
        G_SceneManager.openPopup(Path.getPrefab(this._popupCheckName, "recovery"), (popup: PopupCheckBase) => {
            popup.init(this, this._recoveryRebornList);
            popup.updateUI(this._popupCheckFromType, handler(this, this._updateView));
            popup.openWithAction();
        })
    }

    protected _setBtnEnable(enable) {
        this._buttonAutoAdd.setEnabled(enable);
        this._buttonRecovery.setEnabled(enable);
    }

    protected _recoverySuccess(eventName, awards: any[]) {
        RecoveryDataHelper.sortAward(awards);
        this._playFlyEffect(awards);
    }

    protected _setIsNotShowLightEffect(isShow) {
        this._isNotShowLightEffect = isShow;
    }

    private _playFlyEffect(awards: any[]) {
        var finishPlayed = false;
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var data = this._getDataWithIndex(i);
            if (data) {
                if (finishPlayed == false) {
                    this._recoveryRebornNodes[i].playFlyEffect(this._nodeFlyTarget, this._playShake.bind(this, awards));
                    finishPlayed = true;
                }
                else {
                    this._recoveryRebornNodes[i].playFlyEffect(this._nodeFlyTarget, null);
                }
            }
        }
    }

    private _playShake(awards) {
        this._playLight(awards);
    }

    private _playLight(awards) {
        function eventFunction(event) {
            if (event == 'finish') {
                this._resetNode();
                this._setBtnEnable(true);
                this._showPopupGetReward(awards);
            }
        }
        if (this._isNotShowLightEffect) {
            this._resetNode();
            this._setBtnEnable(true);
            this.updateRedPoint();
            this._showPopupGetReward(awards);
        }
        else {

            G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_huishou', null, eventFunction.bind(this), false);
        }
    }

    public updateRedPoint() {
        this._buttonAutoAdd.showRedPoint(this._showRedPoint);
    }

    public setRedPoint(show) {
        this._showRedPoint = show;
    }

}