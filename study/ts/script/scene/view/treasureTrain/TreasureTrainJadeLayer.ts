const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import TreasureConst from '../../../const/TreasureConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import { G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelpBig from '../../../ui/component/CommonHelpBig'


import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar'
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { TreasureDataHelper } from '../../../utils/data/TreasureDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import EquipJadeIcon from '../equipmentJade/EquipJadeIcon';



var EFFECT_BG_RES = 'moving_shuijingxiangqian_bg';
var EFFECT_BAGUA = 'effect_shuijingxiangqian_bg_bagua';
var EFFECT_TEXING = 'moving_zhanma_chengse_up';
@ccclass
export default class TreasureTrainJadeLayer extends ViewBase {
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
        type: CommonTreasureAvatar,
        visible: true
    })
    _treasureAvatar: CommonTreasureAvatar = null;

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
    _parentView: any;
    _recordAttr: AttrRecordUnitData;
    _signalJadeEquipSuccess: any;
    _unitData: any;

    ctor(parentView) {
        this._parentView = parentView;
    }

    onCreate() {
        this._initUI();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
    }

    onEnter() {
        this._signalJadeEquipSuccess = G_SignalManager.add(SignalConst.EVENT_JADE_TREASURE_SUCCESS, handler(this, this._onEventEquipJadeSuccess));
        this._playBgEffect();
    }

    onExit() {
        this._signalJadeEquipSuccess.remove();
        this._signalJadeEquipSuccess = null;
    }

    _playBgEffect() {
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode1, EFFECT_BG_RES, null, function () {
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
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(TreasureConst.TREASURE_TRAIN_JADE);
        }
    }

    _playPrompt(text) {
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
        for (var index = 1; index <= TreasureConst.MAX_JADE_SLOT; index++) {
            this['_jadeSlot' + index].init(index, FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
        }
        this._treasureAvatar.showShadow(false);
        this._buttonHelp.updateLangName('treasure_jade_help_txt');
        this._textTips.string = (Lang.get('treasure_cannot_inject_jade'));
    }
    updateInfo() {
        this._updateData();
        this._updateView();
        this._updateItem();
        this._updateJadeSlot();
    }

    _updateData() {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        this._unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var attrInfo = TreasureDataHelper.getTreasureJadeAttrInfo(this._unitData, G_UserData.getBase().getLevel(), null);
        this._recordAttr.updateData(attrInfo);
    }

    _updateView() {
        var treasureBaseId = this._unitData.getBase_id();
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
        var treasureName = treasureParam.name;
        var rLevel = this._unitData.getRefine_level();
        if (rLevel > 0) {
            treasureName = treasureName + ('+' + rLevel);
        }
        this._textName.string = (treasureName);
        this._textName.node.color = (treasureParam.icon_color);
        UIHelper.updateTextOutline(this._textName, treasureParam);
        var [baseId, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithTreasureId(this._unitData.getId());
        if (baseId == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
    }

    _updateItem() {
        var treasureBaseId = this._unitData.getBase_id();
        this._treasureAvatar.updateUI(treasureBaseId);
        if (this._unitData.getJadeSlotNums && this._unitData.getJadeSlotNums() > 0) {
            this._nodeSlot.active = (true);
            this._textTips.node.active = (false);
        } else {
            this._nodeSlot.active = (false);
            this._textTips.node.active = (true);
        }
    }

    _updateJadeSlot() {
        var config = this._unitData.getConfig();
        var slotInfo = (config.inlay_type.split('|'));
        for (var i = 0; i < slotInfo.length; i++) {
            var jadeIconIdx = i + 1;
            if (Number(slotInfo[i]) == 0) {
                this['_jadeSlot' + jadeIconIdx].lockIcon();
            } else {
                var jades = this._unitData.getJades();
                var jadeId = jades[i];
                this['_jadeSlot' + jadeIconIdx].updateIcon(this._unitData.getId(), jadeId && jadeId || 0);
            }
        }
        this._updateLvEffect();
    }

    _updateLvEffect() {
        this._effectNode2.removeAllChildren();
        this._effectNode3.removeAllChildren();
        if (this._unitData.isFullAttrJade()) {
            G_EffectGfxMgr.createPlayGfx(this._effectNode2, EFFECT_BAGUA);
        }
        if (this._unitData.isFullJade()) {
            G_EffectGfxMgr.createPlayMovingGfx(this._effectNode3, EFFECT_TEXING, null, function () {
            });
        }
    }
}