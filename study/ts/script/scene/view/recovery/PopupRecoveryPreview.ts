const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import ListView from './ListView';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { HorseEquipDataHelper } from '../../../utils/data/HorseEquipDataHelper';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { G_SignalManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import RecoveryPreviewCell from './RecoveryPreviewCell';

@ccclass
export default class PopupRecoveryPreview extends PopupBase {

    @property({ type: CommonNormalMidPop, visible: true })
    _panelBg: CommonNormalMidPop = null;

    @property({ type: cc.Label, visible: true })
    _textTip: cc.Label = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    @property({ type: CommonResourceInfo, visible: true })
    _fileNodeCost: CommonResourceInfo = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _buttonOk: CommonButtonLevel0Highlight = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _buttonCancel: CommonButtonLevel0Normal = null;

    @property({ type: cc.Prefab, visible: true })
    _recoveryPreviewCellPrefab: cc.Prefab = null;

    private _datas:any[];
    private _recoveryType;
    private _onClickOk;
    private _previewData: any[];
    private _count;

    public init(datas, recoveryType, onClickOk) {
        this._datas = datas;
        this._recoveryType = recoveryType;
        this._onClickOk = onClickOk;
        this.node.name = "PopupRecoveryPreview";
        this._fileNodeCost.onLoad();
        this.setClickOtherClose(true);
    }

    public onCreate() {
        this._panelBg.addCloseEventListener(handler(this, this._onButtonClose));
        var recoveryType = this._recoveryType;
        this._panelBg.setTitle(Lang.get('recovery_preview_title_' + recoveryType));
        this._textTip.string = (Lang.get('recovery_preview_tip_' + recoveryType));
        this._buttonCancel.setString(Lang.get('recovery_btn_cancel'));
        this._buttonOk.setString(Lang.get('recovery_btn_ok'));
        this._previewData = [];
        var isShowCost = false;
        if (recoveryType == RecoveryConst.RECOVERY_TYPE_1) {
            this._previewData = UserDataHelper.getHeroRecoveryPreviewInfo(this._datas);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_2) {
            this._previewData = UserDataHelper.getHeroRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_3) {
            this._previewData = UserDataHelper.getEquipRecoveryPreviewInfo(this._datas);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_4) {
            this._previewData = UserDataHelper.getEquipRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_5) {
            this._previewData = UserDataHelper.getTreasureRecoveryPreviewInfo(this._datas);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_6) {
            this._previewData = UserDataHelper.getTreasureRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_7) {
            this._previewData = UserDataHelper.getInstrumentRecoveryPreviewInfo(this._datas);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_8) {
            this._previewData = UserDataHelper.getInstrumentRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_9) {
            this._previewData = UserDataHelper.getPetRecoveryPreviewInfo(this._datas);
            isShowCost = false;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_10) {
            this._previewData = UserDataHelper.getPetRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_11) {
            this._previewData = HorseDataHelper.getHorseRecoveryPreviewInfo(this._datas);
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_12) {
            this._previewData = HorseDataHelper.getHorseRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_13) {
            this._previewData = UserDataHelper.getHistoricalHeroRebornPreviewInfo(this._datas[0]);
            isShowCost = true;
        } else if (recoveryType == RecoveryConst.RECOVERY_TYPE_14) {
            this._previewData = HorseEquipDataHelper.getHorseEquipRecoveryPreviewInfo(this._datas);
            isShowCost = false;
        }
        this._count = Math.ceil(this._previewData.length / 4);
        this._listView.setTemplate(this._recoveryPreviewCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._listView.setData(this._previewData);
        if (isShowCost) {
            this._fileNodeCost.showResName(true, Lang.get('reborn_cost_title'));
            var costCount = RecoveryDataHelper.getRebornCostCount();
            this._fileNodeCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
            this._fileNodeCost.node.active = (true);
        } else {
            this._fileNodeCost.node.active = (false);
        }
    }

    public onEnter() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupRecoveryPreview");
    }

    public onExit() {
    }

    private _onItemUpdate(item: cc.Node, index) {
        let cell: RecoveryPreviewCell = item.getComponent(RecoveryPreviewCell);
        cell.updateUI(this._previewData[index]);
    }

    public onButtonCancel() {
        this.close();
    }

    public onButtonOk() {
        if (this._onClickOk) {
            this._onClickOk();
        }
        this.close();
    }

    private _onButtonClose() {
        this.close();
    }
}