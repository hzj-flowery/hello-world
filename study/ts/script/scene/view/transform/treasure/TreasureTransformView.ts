const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../../const/ConfigNameConst';
import { DataConst } from '../../../../const/DataConst';
import ParameterIDConst from '../../../../const/ParameterIDConst';
import { SignalConst } from '../../../../const/SignalConst';
import { TransformConst } from '../../../../const/TransformConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SignalManager, G_UserData } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight';
import CommonResourceInfo from '../../../../ui/component/CommonResourceInfo';
import PopupChooseTreasure from '../../../../ui/popup/PopupChooseTreasure';
import { PopupChooseTreasureHelper } from '../../../../ui/popup/PopupChooseTreasureHelper';
import { RecoveryDataHelper } from '../../../../utils/data/RecoveryDataHelper';
import { TreasureDataHelper } from '../../../../utils/data/TreasureDataHelper';
import { clone, uniquePush } from '../../../../utils/GlobleFunc';
import { handler } from '../../../../utils/handler';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import ViewBase from '../../../ViewBase';
import PopupCheckTreasureTransform from './PopupCheckTreasureTransform';
import TreasureTransformNode from './TreasureTransformNode';
import TrPopupTransformResult from './TrPopupTransformResult';

@ccclass
export default class TreasureTransformView extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;
    @property({
        type: TreasureTransformNode,
        visible: true
    })
    _nodeSrcItem: TreasureTransformNode = null;
    @property({
        type: TreasureTransformNode,
        visible: true
    })
    _nodeTarItem: TreasureTransformNode = null;
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
    _resultData: any;

    onCreate() {
        this._buttonTransform.addClickEventListenerEx(handler(this, this._onButtonTransformClicked));
        this._initData();
        this.setSceneSize(null, false);
        this._initView();
    }
    onEnter() {
        this._signalTransform = G_SignalManager.add(SignalConst.EVENT_TREASURE_TRANSFORM_SUCCESS, handler(this, this._transformSuccess));
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
        this._resultData = null;
    }
    _initView() {
        this._initTips();
        this._buttonTransform.setString(Lang.get('transform_btn_transform'));
        this._nodeSrcItem.ctor(TransformConst.TRANSFORM_NODE_TYPE_SRC, handler(this, this._onClickSrcItem));
        this._nodeTarItem.ctor(TransformConst.TRANSFORM_NODE_TYPE_TAR, handler(this, this._onClickTarItem));
    }
    _initTips() {
        var content = Lang.get('treasure_transform_tips', { name: Lang.get('transform_tab_icon_2') });
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
        var content = Lang.get('transform_alert_content', { name: Lang.get('transform_tab_icon_2') });
        UIPopupHelper.popupSystemAlert(title, content, handler(this, this._doTransform), null, (popup) => {
            popup.setCheckBoxVisible(false);
            popup._isClickOtherClose = true;
        })
    }
    _checkTransformCondition() {
        if (this._srcIds.length == 0) {
            G_Prompt.showTip(Lang.get('transform_condition_tip4', { name: Lang.get('transform_tab_icon_2') }));
            return false;
        }
        if (this._tarBaseId == 0) {
            G_Prompt.showTip(Lang.get('transform_condition_tip5', { name: Lang.get('transform_tab_icon_2') }));
            return false;
        }
        var ownCount = G_UserData.getItems().getItemNum(DataConst.ITEM_TRANSFORM);
        var needCount = this._getNeedItemCount();
        if (ownCount < needCount) {
            UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TRANSFORM,Lang.get('way_type_get'));
            return false;
        }
        return true;
    }
    _doTransform() {
        this._setResultData();
        var srcIds = this._srcIds;
        var toId = this._tarBaseId;
        var withInstrument = false;
        G_UserData.getTreasure().c2sTreasureTransform(srcIds, toId);
        this._setButtonEnable(false);
    }
    _setResultData() {
        var data: any = {};
        var firstItemId = this._srcIds[0];
        var itemData = G_UserData.getTreasure().getTreasureDataWithId(firstItemId);
        var level = itemData.getLevel();
        var refine = itemData.getRefine_level();
        var num = this._srcIds.length;
        data.srcItemBaseId = itemData.getBase_id();
        data.tarItemBaseId = this._tarBaseId;
        data.value = [];
        data.value.push(level);
        data.value.push(refine);
        data.value.push(num);
        this._resultData = data;
    }
    _getSrcItemBaseIds() {
        var result = [];
        for (var i in this._srcIds) {
            var itemId = this._srcIds[i];
            var itemData = G_UserData.getTreasure().getTreasureDataWithId(itemId);
            var baseId = itemData.getBase_id();
            uniquePush(result, baseId);
        }
        return result;
    }
    _getTarItemTempData() {
        var tempData: any = {};
        var firstItemId = this._srcIds[0];
        if (firstItemId) {
            var itemData = G_UserData.getTreasure().getTreasureDataWithId(firstItemId);
            tempData.level = itemData.getLevel();
            tempData.refine_level = itemData.getRefine_level();
            tempData.color = itemData.getConfig().color;
        }
        return tempData;
    }
    _onClickSrcItem() {
        PopupCheckTreasureTransform.getIns(PopupCheckTreasureTransform, (popup: PopupCheckTreasureTransform) => {
            popup.ctor(this, handler(this, this._onChooseSrcItem));
            popup.setSelectedIds(this._srcIds);
            popup.openWithAction();
        })
    }
    _onClickTarItem() {
        var filterIds = this._getSrcItemBaseIds();
        var tempData = this._getTarItemTempData();
        PopupChooseTreasure.getIns(PopupChooseTreasure, (popup: PopupChooseTreasure) => {
            popup.setTitle(Lang.get('transform_choose_list_title2', { name: Lang.get('transform_tab_icon_2') }));
            popup.updateUI(PopupChooseTreasureHelper.FROM_TYPE4, handler(this, this._onChooseTarItem), filterIds, tempData);
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
        this._updateTarItemNode();
        this._updateTipsInfo();
    }
    _updateSrcItemNode() {
        var firstItemId = this._srcIds[0];
        var baseId = 0;
        var itemCount = this._srcIds.length;
        if (firstItemId) {
            var itemData = G_UserData.getTreasure().getTreasureDataWithId(firstItemId);
            baseId = itemData.getBase_id();
        }
        this._nodeSrcItem.setItemCount(itemCount);
        this._nodeSrcItem.setItemId(baseId);
        this._nodeSrcItem.updateUI();
    }
    _updateTarItemNode() {
        var lock = this._srcIds.length == 0 && true || false;
        this._imageArrow.node.active = (!lock);
        this._nodeTarItem.setLock(lock);
        this._nodeTarItem.setItemId(this._tarBaseId);
        this._nodeTarItem.updateUI();
    }
    _updateTipsInfo() {
        var show = this._srcIds.length > 0 && this._tarBaseId > 0;
        this._nodeCost.setVisible(show);
        this._buttonTransform.node.x = (0);
        this._nodeCost.node.x = (0);
        this._nodeCost.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TRANSFORM);
        var count = G_UserData.getItems().getItemNum(DataConst.ITEM_TRANSFORM);
        var max = this._getNeedItemCount();
        var enough = count >= max;
        this._nodeCost.setCount(max);
        this._nodeCost.showImageAdd(false);
        this._nodeCost.setTextColorToDTypeColor(enough);
    }
    _getNeedItemCount() {
        var totalCost = {};
        var count = 0;
        for (var i in this._srcIds) {
            var itemId = this._srcIds[i];
            var unitData = G_UserData.getTreasure().getTreasureDataWithId(itemId);
            var cost1 = TreasureDataHelper.getTreasureStrengAllCost(unitData);
            var cost2 = TreasureDataHelper.getTreasureRefineAllCost(unitData);
            RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_TREASURE, unitData.getBase_id(), 1);
            RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1);
            RecoveryDataHelper.mergeRecoveryCost(totalCost, cost2);
        }
        for (var type in totalCost) {
            var unit = totalCost[type];
            if (type == TypeConvertHelper.TYPE_TREASURE.toString()) {
                for (var value in unit) {
                    var size = unit[value];
                    count = count + size;
                }
            }
        }
        var temp = parseFloat(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DISPLACE_TREASURE_PROPORTION).content);
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
                    popup.ctor(this, this._resultData);
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