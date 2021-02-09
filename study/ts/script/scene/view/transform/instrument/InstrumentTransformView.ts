const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../../ui/component/CommonResourceInfo'

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import InstrumentTransformNode from './InstrumentTransformNode'
import { handler } from '../../../../utils/handler';
import { G_SignalManager, G_Prompt, G_UserData, G_EffectGfxMgr, G_ResolutionManager, G_ConfigLoader } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { Lang } from '../../../../lang/Lang';
import { TransformConst } from '../../../../const/TransformConst';
import { UserDataHelper } from '../../../../utils/data/UserDataHelper';
import { table } from '../../../../utils/table';
import PopupCheckInstrumentTransform from './PopupCheckInstrumentTransform';
import PopupChooseInstrumentHelper from '../../../../ui/popup/PopupChooseInstrumentHelper';
import { clone, uniquePush } from '../../../../utils/GlobleFunc';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import { DataConst } from '../../../../const/DataConst';
import { InstrumentDataHelper } from '../../../../utils/data/InstrumentDataHelper';
import { RecoveryDataHelper } from '../../../../utils/data/RecoveryDataHelper';
import ParameterIDConst from '../../../../const/ParameterIDConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import { ConfigNameConst } from '../../../../const/ConfigNameConst';
import TrPopupTransformResult from '../treasure/TrPopupTransformResult';
import PopupChooseInstrument2 from '../../../../ui/popup/PopupChooseInstrument2';
import { PopupCheckInstrumentHelper } from '../../recovery/PopupCheckInstrumentHelper';
import ViewBase from '../../../ViewBase';

@ccclass
export default class InstrumentTransformView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: InstrumentTransformNode,
        visible: true
    })
    _nodeSrcItem: InstrumentTransformNode = null;

    @property({
        type: InstrumentTransformNode,
        visible: true
    })
    _nodeTarItem: InstrumentTransformNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTopTip: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonTransform: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeCost: CommonResourceInfo = null;
    _signalTransform;
    _srcIds: any[];
    _tarBaseId: number;
    _tarLimitLevel: number;
    _resultData: any;

    onCreate() {
        this._buttonTransform.addClickEventListenerEx(handler(this, this._onButtonTransformClicked));
        this._initData();
        this.setSceneSize(null, false);
        this._initView();
    }
    onEnter() {
        this._signalTransform = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_TRANSFORM_SUCCESS, handler(this, this._transformSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalTransform.remove();
        this._signalTransform = null;
    }
    _initData() {
        this._srcIds = [];
        this._tarBaseId = 0;
        this._tarLimitLevel = 0;
        this._resultData = null;
    }
    _initView() {
        this._initTips();
        this._buttonTransform.setString(Lang.get('transform_btn_transform'));
        this._nodeSrcItem.ctor(TransformConst.TRANSFORM_NODE_TYPE_SRC, handler(this, this._onClickSrcItem));
        this._nodeTarItem.ctor(TransformConst.TRANSFORM_NODE_TYPE_TAR, handler(this, this._onClickTarItem));
    }
    _initTips() {
        var content = Lang.get('instrument_transform_tips', { name: Lang.get('transform_tab_icon_3') });
        var label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeTopTip.addChild(label.node);
    }
    _updateData() {
    }
    _updateView() {
        this._updateSrcItemNode();
        this._updateTarItemNode();
        this._updateTipsInfo();
    }
    _onButtonTransformClicked() {
        if (this._checkTransformCondition() == false) {
            return;
        }
        var title = Lang.get('transform_alert_title');
        var content = Lang.get('transform_alert_content', { name: Lang.get('transform_tab_icon_3') });
        UIPopupHelper.popupSystemAlert(title, content, handler(this, this._doTransform), null, (popup) => {
            popup.setCheckBoxVisible(false);
            popup._isClickOtherClose = true;
        })
    }
    _checkTransformCondition() {
        if (this._srcIds.length == 0) {
            G_Prompt.showTip(Lang.get('transform_condition_tip4', { name: Lang.get('transform_tab_icon_3') }));
            return false;
        }
        if (this._tarBaseId == 0) {
            G_Prompt.showTip(Lang.get('transform_condition_tip5', { name: Lang.get('transform_tab_icon_3') }));
            return false;
        }
        var [costType, costValue, costSize] = this._getCostParam();
        var ownCount = UserDataHelper.getNumByTypeAndValue(costType, costValue);
        var needCount = this._getNeedItemCount();
        if (ownCount < needCount) {
            UIPopupHelper.popupItemGuiderByType( costType, costValue,Lang.get('way_type_get'));
            return false;
        }
        return true;
    }
    _doTransform() {
        this._setResultData();
        var srcIds = this._srcIds;
        var toId = this._tarBaseId;
        G_UserData.getInstrument().c2sInstrumentTransform(srcIds, toId);
        this._setButtonEnable(false);
    }
    _setResultData() {
        var data: any = {};
        var firstItemId = this._srcIds[0];
        var itemData = G_UserData.getInstrument().getInstrumentDataWithId(firstItemId);
        var level = itemData.getLevel();
        var num = this._srcIds.length;
        data.srcItemBaseId = itemData.getBase_id();
        data.tarItemBaseId = this._tarBaseId;
        data.tarLimitLevel = this._tarLimitLevel;
        data.value = [];
        data.value.push(level);
        data.value.push(num);
        this._resultData = data;
    }
    _getSrcItemBaseIds() {
        var result = [];
        for (var i in this._srcIds) {
            var itemId = this._srcIds[i];
            var itemData = G_UserData.getInstrument().getInstrumentDataWithId(itemId);
            var baseId = itemData.getBase_id();
            uniquePush(result, baseId);
        }
        return result;
    }
    _getTarItemTempData() {
        var tempData: any = {};
        var firstItemId = this._srcIds[0];
        if (firstItemId) {
            var itemData = G_UserData.getInstrument().getInstrumentDataWithId(firstItemId);
            tempData.level = itemData.getLevel();
            tempData.limit_level = itemData.getLimit_level();
            tempData.isDidLimit = itemData.isDidLimit();
            tempData.color = itemData.getConfig().color;
        }
        return tempData;
    }
    _onClickSrcItem() {
        PopupCheckInstrumentTransform.getIns(PopupCheckInstrumentTransform, (popup: PopupCheckInstrumentTransform) => {
            popup.ctor(null, handler(this, this._onChooseSrcItem), 1, PopupCheckInstrumentHelper.FROM_TYPE2);
            popup.setSelectedIds(this._srcIds);
            popup.openWithAction();
        })
    }
    _onClickTarItem() {
        PopupChooseInstrument2.getIns(PopupChooseInstrument2, (popup: PopupChooseInstrument2) => {
            popup.setTitle(Lang.get('transform_choose_list_title2', { name: Lang.get('transform_tab_icon_3') }));
            var filterIds = this._getSrcItemBaseIds();
            var tempData = this._getTarItemTempData();
            popup.updateUI(PopupChooseInstrumentHelper.FROM_TYPE4, handler(this, this._onChooseTarItem), filterIds, tempData);
            popup.openWithAction();
        })
    }
    _onChooseSrcItem(itemIds) {
        this._srcIds = clone(itemIds);
        this._updateSrcItemNode();
        this._tarBaseId = 0;
        this._updateTarItemNode();
        this._updateTipsInfo();
    }
    _onChooseTarItem(itemId, param, itemData) {
        this._tarBaseId = itemData.getBase_id();
        this._tarLimitLevel = itemData.getLimit_level();
        this._updateTarItemNode();
        this._updateTipsInfo();
    }
    _updateSrcItemNode() {
        var firstItemId = this._srcIds[0];
        var baseId = 0;
        var limitLevel = 0;
        var itemCount = this._srcIds.length;
        if (firstItemId) {
            var itemData = G_UserData.getInstrument().getInstrumentDataWithId(firstItemId);
            baseId = itemData.getBase_id();
            limitLevel = itemData.getLimit_level();
        }
        this._nodeSrcItem.setItemCount(itemCount);
        this._nodeSrcItem.setItemId(baseId, limitLevel);
        this._nodeSrcItem.updateUI();
    }
    _updateTarItemNode() {
        var lock = this._srcIds.length == 0 && true || false;
        this._imageArrow.node.active = (!lock);
        this._nodeTarItem.setLock(lock);
        this._nodeTarItem.setItemId(this._tarBaseId, this._tarLimitLevel);
        this._nodeTarItem.updateUI();
    }
    _updateTipsInfo() {
        var show = this._srcIds.length > 0 && this._tarBaseId > 0;
        this._nodeCost.setVisible(show);
        var [costType, costValue, costSize] = this._getCostParam();
        this._nodeCost.updateUI(costType, costValue);
        var count = UserDataHelper.getNumByTypeAndValue(costType, costValue);
        var max = this._getNeedItemCount();
        var enough = count >= max;
        this._nodeCost.setCount(max);
        this._nodeCost.showImageAdd(false);
        this._nodeCost.setTextColorToDTypeColor(enough);
    }
    _isChooseRedInstrument() {
        var firstItemId = this._srcIds[0];
        if (firstItemId) {
            var itemData = G_UserData.getInstrument().getInstrumentDataWithId(firstItemId);
            var color = itemData.getConfig().color;
            if (color == 6) {
                return true;
            }
        }
        return false;
    }
    _isChooseGoldInstrument() {
        var firstItemId = this._srcIds[0];
        if (firstItemId) {
            var itemData = G_UserData.getInstrument().getInstrumentDataWithId(firstItemId);
            var color = itemData.getConfig().color;
            if (color == 7) {
                return true;
            }
        }
        return false;
    }
    _getCostParam() {
        var costType = TypeConvertHelper.TYPE_ITEM;
        var costValue = DataConst.ITEM_TRANSFORM;
        var costSize = 1;
        if (this._isChooseGoldInstrument()) {
            costValue = DataConst.ITEM_TRANSFORM_GOLD;
        } else if (this._isChooseRedInstrument()) {
            costValue = DataConst.ITEM_TRANSFORM_RED;
        }
        return [
            costType,
            costValue,
            costSize
        ];
    }
    _getNeedItemCount() {
        var totalCost = {};
        var count = 0;
        for (var i in this._srcIds) {
            var itemId = this._srcIds[i];
            var unitData = G_UserData.getInstrument().getInstrumentDataWithId(itemId);
            var cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(unitData);
            RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_INSTRUMENT, unitData.getBase_id(), 1);
            RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1);
        }
        for (var type in totalCost) {
            var unit = totalCost[type];
            if (type == TypeConvertHelper.TYPE_INSTRUMENT.toString()) {
                for (var value in unit) {
                    var size = unit[value];
                    count = count + size;
                }
            }
        }
        var temp = parseFloat(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DISPLACE_WEAPON_RED).content);
        if (this._isChooseGoldInstrument()) {
            temp = parseFloat(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DISPLACE_WEAPON_GOLD).content);
        }
        count = Math.ceil(count / temp);
        return count;
    }
    _setButtonEnable(enable) {
        this._buttonTransform.setEnabled(enable);
        this._nodeSrcItem.setEnabled(enable);
        this._nodeTarItem.setEnabled(enable);
    }
    _transformSuccess() {
        this._playEffect();
    }
    _playEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        let eventFunction = function (event) {
            if (event == '1p') {
                var action = cc.fadeOut(0.3);
                var itemNode = this._nodeSrcItem.getItemNode();
                itemNode.node.runAction(action);
            } else if (event == '2p') {
                var action = cc.fadeOut(0.3);
                var itemNode = this._nodeTarItem.getItemNode();
                itemNode.node.runAction(action);
            } else if (event == 'finish') {
                TrPopupTransformResult.getIns(TrPopupTransformResult, (popup: TrPopupTransformResult) => {
                    popup.ctor(this, this._resultData, TypeConvertHelper.TYPE_INSTRUMENT);
                    popup.open();
                    this._setButtonEnable(true);
                    this._initData();
                    this._updateView();
                })
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_zhihuan', effectFunction, eventFunction, false);
        effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5, G_ResolutionManager.getDesignHeight() * 0.5));
    }
}