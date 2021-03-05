const { ccclass, property } = cc._decorator;

import CommonHelpBig from '../../../ui/component/CommonHelpBig'

import EquipJadeIcon from '../equipmentJade/EquipJadeIcon'

import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar'
import { G_UserData, G_SignalManager, G_EffectGfxMgr, G_Prompt } from '../../../init';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { stringUtil } from '../../../utils/StringUtil';
import UIConst from '../../../const/UIConst';
import { Slot } from '../../../utils/event/Slot';
import EquipConst from '../../../const/EquipConst';
import ViewBase from '../../ViewBase';

@ccclass
export default class EquipTrainJadeLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode3: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFrom: cc.Label = null;

    @property({
        type: CommonEquipAvatar,
        visible: true
    })
    _equipAvatar: CommonEquipAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSlot: cc.Node = null;

    @property({
        type: EquipJadeIcon,
        visible: true
    })
    _jadeSlot1: EquipJadeIcon = null;

    @property({
        type: EquipJadeIcon,
        visible: true
    })
    _jadeSlot4: EquipJadeIcon = null;

    @property({
        type: EquipJadeIcon,
        visible: true
    })
    _jadeSlot3: EquipJadeIcon = null;

    @property({
        type: EquipJadeIcon,
        visible: true
    })
    _jadeSlot2: EquipJadeIcon = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _buttonHelp: CommonHelpBig = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTips: cc.Label = null;

    private static INJECT = 1;
    private static UNALOAD = 2;
    private static EFFECT_BG_RES = 'moving_shuijingxiangqian_bg';
    private static EFFECT_BAGUA = 'effect_shuijingxiangqian_bg_bagua';
    private static EFFECT_TEXING = 'moving_zhanma_chengse_up';


    _recordAttr: any;
    _signalJadeEquipSuccess: Slot;
    _unitData: any;

    onCreate() {
        this.setSceneSize(null, false);
        this._initUI();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
    }
    onEnter() {
        this._signalJadeEquipSuccess = G_SignalManager.add(SignalConst.EVENT_JADE_EQUIP_SUCCESS, handler(this, this._onEventEquipJadeSuccess));
        this._playBgEffect();
    }
    onExit() {
        this._signalJadeEquipSuccess.remove();
        this._signalJadeEquipSuccess = null;
    }
    _playBgEffect() {
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode1, EquipTrainJadeLayer.EFFECT_BG_RES, null, function () {
        });
    }
    _onEventEquipJadeSuccess(id, message) {
        var id = message['id'];
        var pos = message['pos'];
        this._updateData();
        this._updateJadeSlot();
        var text = '';
        if (id > 0) {
            text = Lang.get('jade_inject_success');
            this['_jadeSlot' + (pos + 1)].playEquipEffect();
        } else {
            text = Lang.get('jade_unload_success');
        }
        this._playPrompt(text);
    }
    _playPrompt(text, isSuitable?) {
        if (!this._unitData.isInBattle()) {
            return;
        }
        var summary = [];
        var param = { content: text };
        if (summary.length == 0) {
            summary.push(param);
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        if (summary.length > 0) {
            G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
            G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_JADE, -5);
        }
    }
    _addBaseAttrPromptSummary(summary) {
        var attr = TextHelper.getAttrInfoBySort(this._recordAttr.getAttr());
        var attr2 = TextHelper.getAttrInfoBySort(this._recordAttr.getLastAttr());
        for (var i in attr2) {
            var info = attr2[i];
            if (!this._ishaveIdInAttr(info.id, attr)) {
                attr.push(info);
            }
        }
        var desInfo = attr;
        for (i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _ishaveIdInAttr(id, attr) {
        for (var i in attr) {
            var info = attr[i];
            if (id == info.id) {
                return true;
            }
        }
        return false;
    }
    _initUI() {
        for (var i = 1; i <= EquipConst.MAX_JADE_SLOT; i++) {
            this['_jadeSlot' + i].init(i);
            // this['_equipJadeIcon' + index] = new EquipJadeIcon(this['_jadeSlot' + index], index);
        }
        this._equipAvatar.showShadow(false);
        this._buttonHelp.updateLangName('equipment_jade_help_txt');
    }
    updateInfo() {
        this._updateData();
        this._updateView();
        this._updateItem();
        this._updateJadeSlot();
    }
    _updateData() {
        var equipid = G_UserData.getEquipment().getCurEquipId();
        this._unitData = G_UserData.getEquipment().getEquipmentDataWithId(equipid);
        var attrInfo = EquipDataHelper.getEquipJadeAttrInfo(this._unitData, G_UserData.getBase().getLevel());
        this._recordAttr.updateData(attrInfo);
    }
    _updateView() {
        var equipBaseId = this._unitData.getBase_id();
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
        var equipName = equipParam.name;
        var rLevel = this._unitData.getR_level();
        if (rLevel > 0) {
            equipName = equipName + ('+' + rLevel);
        }
        this._textName.string = (equipName);
        this._textName.node.color = (equipParam.icon_color);
        UIHelper.enableOutline(this._textName, equipParam.icon_color_outline, 2);
        var heroUnitData = UserDataHelper.getHeroDataWithEquipId(this._unitData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
    }
    _updateItem() {
        var equipBaseId = this._unitData.getBase_id();
        this._equipAvatar.updateUI(equipBaseId);
        if (EquipTrainHelper.canLimitUp(equipBaseId)) {
            this._nodeSlot.active = (true);
            this._textTips.node.active = (false);
        } else {
            this._nodeSlot.active = (false);
            this._textTips.node.active = (true);
        }
    }
    _updateJadeSlot() {
        var config = this._unitData.getConfig();
        var slotInfo = stringUtil.split(config.inlay_type, '|');
        for (var i = 0; i < slotInfo.length; i++) {
            var jadeIconIdx = i + 1;
            if (parseFloat(slotInfo[i]) == 0) {
                this['_jadeSlot' + jadeIconIdx].lockIcon();
            } else {
                var suit_id = config.suit_id;
                var jades = this._unitData.getJades();
                var jadeId = jades[i];
                this['_jadeSlot' + jadeIconIdx].updateIcon(this._unitData.getId(), jadeId);
            }
        }
        this._updateLvEffect();
    }
    _updateLvEffect() {
        this._effectNode2.removeAllChildren();
        this._effectNode3.removeAllChildren();
        if (this._unitData.isFullAttrJade()) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode2, EquipTrainJadeLayer.EFFECT_BAGUA);
        }
        if (this._unitData.isFullJade()) {
            G_EffectGfxMgr.createPlayMovingGfx(this._effectNode3, EquipTrainJadeLayer.EFFECT_TEXING, null, function () {
            });
        }
    }

}