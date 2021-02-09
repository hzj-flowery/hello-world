const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import HeroTransformNode from './HeroTransformNode'
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_Prompt, G_UserData, G_EffectGfxMgr, G_ResolutionManager, G_ConfigLoader } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { HeroConst } from '../../../const/HeroConst';
import PopupHeroTransformPreview from './PopupHeroTransformPreview';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { InstrumentDataHelper } from '../../../utils/data/InstrumentDataHelper';
import { table } from '../../../utils/table';
import PopupCheckHeroTransform from './PopupCheckHeroTransform';
import PopupChooseHeroHelper from '../../../ui/popup/PopupChooseHeroHelper';
import { clone, uniquePush } from '../../../utils/GlobleFunc';
import { DataConst } from '../../../const/DataConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import PopupTransformResult from './PopupTransformResult';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { stringUtil } from '../../../utils/StringUtil';
import ViewBase from '../../ViewBase';
import PopupChooseHero2 from '../../../ui/popup/PopupChooseHero2';

@ccclass
export default class HeroTransformView extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;
    @property({
        type: HeroTransformNode,
        visible: true
    })
    _nodeSrcHero: HeroTransformNode = null;
    @property({
        type: HeroTransformNode,
        visible: true
    })
    _nodeTarHero: HeroTransformNode = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;
    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonPreview: CommonButtonLevel0Normal = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTopTip: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTipBg: cc.Sprite = null;
    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBoxInstrument: cc.Toggle = null;
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
    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeCost2: CommonResourceInfo = null;

    _signalHeroTransform: any;
    _srcHeroIds: any[];
    _tarHeroBaseId: number;
    _tarHeroLimitLevel: number;
    _resultData: any;
    _isChangeCountry: boolean;
    _srcHero: HeroTransformNode;
    _tarHero: HeroTransformNode;

    onCreate() {
        this._buttonPreview.addClickEventListenerEx(handler(this, this._onButtonPreviewClicked));
        this._buttonTransform.addClickEventListenerEx(handler(this, this._onButtonTransformClicked));
        this._initData();
        this.setSceneSize(null, false);
        this._initView();

    }
    onEnter() {
        this._signalHeroTransform = G_SignalManager.add(SignalConst.EVENT_HERO_TRANSFORM_SUCCESS, handler(this, this._heroTransformSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalHeroTransform.remove();
        this._signalHeroTransform = null;
    }
    _initData() {
        this._srcHeroIds = [];
        this._tarHeroBaseId = 0;
        this._tarHeroLimitLevel = 0;
        this._resultData = null;
        this._isChangeCountry = false;
    }
    _initView() {
        this._initTips();
        this._buttonPreview.setString(Lang.get('hero_transform_btn_preview'));
        this._buttonTransform.setString(Lang.get('hero_transform_btn_transform'));
        this._nodeSrcHero.ctor(HeroConst.HERO_TRANSFORM_NODE_TYPE_SRC, handler(this, this._onClickSrcHero));
        this._nodeTarHero.ctor(HeroConst.HERO_TRANSFORM_NODE_TYPE_TAR, handler(this, this._onClickTarHero));
        this._srcHero = this._nodeSrcHero;
        this._tarHero = this._nodeTarHero;
        this._checkBoxInstrument.isChecked = (true);
    }
    _initTips() {
        var content = Lang.get('hero_transform_tips');
        var label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeTopTip.addChild(label.node);
    }
    _updateData() {
    }
    _updateView() {
        this._updateSrcHeroNode();
        this._updateTarHeroNode();
        this._updateTipsInfo();
    }
    _onButtonPreviewClicked() {
        var srcHeroId = this._srcHeroIds[0];
        var tarBaseHeroId = this._tarHeroBaseId;
        PopupHeroTransformPreview.getIns(PopupHeroTransformPreview, (popup:PopupHeroTransformPreview)=> {
            popup.ctor(this, srcHeroId, tarBaseHeroId);
            popup.openWithAction();
        })
    }
    _onButtonTransformClicked() {
        if (this._checkTransformCondition() == false) {
            return;
        }
        var title = Lang.get('hero_transform_alert_title');
        var content = '';
        if (this._isChangeCountry) {
            var [costType, costValue, costSize] = this._getCostParam2();
            var itemParam = TypeConvertHelper.convert(costType, costValue);
            content = Lang.get('hero_transform_alert_content2', { itemName: itemParam.name });
        } else {
            content = Lang.get('hero_transform_alert_content');
        }
        UIPopupHelper.popupSystemAlert(title, content, handler(this, this._doTransform), null, (popup) => {
            popup.setCheckBoxVisible(false);
            popup._isClickOtherClose = true;
        });
    }
    _checkTransformCondition() {
        if (this._srcHeroIds.length == 0) {
            G_Prompt.showTip(Lang.get('hero_transform_condition_tip4'));
            return false;
        }
        if (this._tarHeroBaseId == 0) {
            G_Prompt.showTip(Lang.get('hero_transform_condition_tip5'));
            return false;
        }
        var [costType1, costValue1, costSize1] = this._getCostParam1();
        var ownCount1 = UserDataHelper.getNumByTypeAndValue(costType1, costValue1);
        var needCount1 = this._getNeedItemCount1();
        if (ownCount1 < needCount1) {
            UIPopupHelper.popupItemGuiderByType(costType1, costValue1, Lang.get('way_type_get'));
            return false;
        }
        var [costType2, costValue2, costSize2] = this._getCostParam2();
        var ownCount2 = UserDataHelper.getNumByTypeAndValue(costType2, costValue2);
        var needCount2 = this._getNeedItemCount2(costSize2);
        if (ownCount2 < needCount2) {
            UIPopupHelper.popupItemGuiderByType(costType2, costValue2, Lang.get('way_type_get'));
            return false;
        }
        return true;
    }
    _doTransform() {
        this._setResultData();
        var srcIds = this._srcHeroIds;
        var toId = this._tarHeroBaseId;
        var withInstrument = this._checkBoxInstrument.isChecked;
        G_UserData.getHero().c2sHeroTransform(srcIds, toId, withInstrument);
        this._setButtonEnable(false);
    }
    _setResultData() {
        var data: any = {};
        var firstHeroId = this._srcHeroIds[0];
        var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
        var level = heroData.getLevel();
        var rank = heroData.getRank_lv();
        var awakeLevel = heroData.getAwaken_level();
        var [awakeStar, starLevel] = HeroDataHelper.convertAwakeLevel(awakeLevel);
        var awakeDes = Lang.get('hero_awake_star_level', {
            star: awakeStar,
            level: starLevel
        });
        var num = this._srcHeroIds.length;
        var instrumentNum = 0;
        if (this._checkBoxInstrument.isChecked) {
            instrumentNum = InstrumentDataHelper.getInstrumentCountWithHeroIds(this._srcHeroIds);
        }
        data.srcHeroBaseId = heroData.getBase_id();
        data.tarHeroBaseId = this._tarHeroBaseId;
        data.tarHeroLimitLevel = this._tarHeroLimitLevel;
        data.value = [];
        data.isGoldHero = this._isChooseGoldHero();
        data.value.push(level);
        data.value.push(rank);
        data.value.push(awakeDes);
        data.value.push(num);
        data.value.push(instrumentNum);
        this._resultData = data;
    }
    _getSrcHeroCountry() {
        var country = 1;
        var firstHeroId = this._srcHeroIds[0];
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            country = heroData.getConfig().country;
        }
        return country;
    }
    _getSrcHeroTrained() {
        var trained = false;
        var firstHeroId = this._srcHeroIds[0];
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            trained = heroData.isDidTrain();
        }
        return trained;
    }
    _getSrcHeroBaseIds() {
        var result = [];
        for (var i in this._srcHeroIds) {
            var heroId = this._srcHeroIds[i];
            var heroData = G_UserData.getHero().getUnitDataWithId(heroId);
            var baseId = heroData.getBase_id();
            uniquePush(result, baseId);
        }
        return result;
    }
    _getTarHeroTempData() {
        var tempData: any = {};
        var firstHeroId = this._srcHeroIds[0];
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            tempData.level = heroData.getLevel();
            tempData.rank_lv = heroData.getRank_lv();
            tempData.awaken_level = heroData.getAwaken_level();
            tempData.limit_level = heroData.getLimit_level();
            tempData.isDidLimit = heroData.isDidLimit();
            tempData.color = heroData.getConfig().color;
        }
        return tempData;
    }
    _onClickSrcHero() {
        var country = this._getSrcHeroCountry();
        var tabIndex = country;
        PopupCheckHeroTransform.getIns(PopupCheckHeroTransform, (p: PopupCheckHeroTransform) => {
            p.ctor(this, handler(this, this._onChooseSrcHero), tabIndex);
            p.setSelectedIds(this._srcHeroIds);
            p.openWithAction();
        })
    }
    _onClickTarHero() {
        var filterIds = this._getSrcHeroBaseIds();
        var tempData = this._getTarHeroTempData();
        PopupChooseHero2.getIns(PopupChooseHero2, (popup: PopupChooseHero2) => {
            popup.setTitle(Lang.get('hero_transform_choose_list_title2'));
            popup.updateUI(PopupChooseHeroHelper.FROM_TYPE8, handler(this, this._onChooseTarHero), filterIds, tempData);
            popup.openWithAction();
        })

    }
    _onChooseSrcHero(heroIds) {
        this._srcHeroIds = clone(heroIds);
        this._updateSrcHeroNode();
        this._tarHeroBaseId = 0;
        this._updateTarHeroNode();
        this._updateTipsInfo();
        var color = 5;
        if (this._isChooseRedHero()) {
            color = 6;
        } else if (this._isChooseGoldHero()) {
            color = 7;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HERO_TRANSFORM_CHOOSE, color);
    }
    _onChooseTarHero(heroId, param, heroData) {
        this._tarHeroBaseId = heroData.getBase_id();
        this._tarHeroLimitLevel = heroData.getLimit_level();
        this._updateTarHeroNode();
        this._updateTipsInfo();
    }
    _updateSrcHeroNode() {
        var firstHeroId = this._srcHeroIds[0];
        var baseId = 0;
        var limitLevel = 0;
        var heroCount = this._srcHeroIds.length;
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            baseId = heroData.getBase_id();
            limitLevel = heroData.getLimit_level();
        }
        this._srcHero.setHeroCount(heroCount);
        this._srcHero.setHeroId(baseId, limitLevel);
        this._srcHero.updateUI();
    }
    _updateTarHeroNode() {
        var lock = this._srcHeroIds.length == 0 && true || false;
        this._imageArrow.node.active = (!lock);
        this._tarHero.setLock(lock);
        this._tarHero.setHeroId(this._tarHeroBaseId, this._tarHeroLimitLevel);
        this._tarHero.updateUI();
    }
    _updateTipsInfo() {
        var show = this._srcHeroIds.length > 0 && this._tarHeroBaseId > 0;
        this._imageTipBg.node.active = (show);
        this._nodeCost.setVisible(show);
        var previewShow = show && this._getSrcHeroTrained();
        this._buttonPreview.setVisible(previewShow);
        if (previewShow) {
            this._buttonPreview.node.x = (-159);
            this._buttonTransform.node.x = (158);
            this._nodeCost.node.x = (158);
        } else {
            this._buttonTransform.node.x = (0);
            this._nodeCost.node.x = (0);
        }
        this._updateCost1();
        this._updateCost2();
    }
    _isChooseRedHero() {
        var firstHeroId = this._srcHeroIds[0];
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            var color = heroData.getConfig().color;
            if (color == 6) {
                return true;
            }
        }
        return false;
    }
    _isChooseGoldHero() {
        var firstHeroId = this._srcHeroIds[0];
        if (firstHeroId) {
            var heroData = G_UserData.getHero().getUnitDataWithId(firstHeroId);
            var color = heroData.getConfig().color;
            if (color == 7) {
                return true;
            }
        }
        return false;
    }
    _getCostParam1() {
        var costType = TypeConvertHelper.TYPE_ITEM;
        var costValue = DataConst.ITEM_TRANSFORM;
        var costSize = 1;
        if (this._isChooseRedHero()) {
            costValue = DataConst.ITEM_TRANSFORM_RED;
        } else if (this._isChooseGoldHero()) {
            costValue = DataConst.ITEM_TRANSFORM_GOLD;
        }
        return [
            costType,
            costValue,
            costSize
        ];
    }
    _getCostParam2() {
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var strContent = cfg.get(ParameterIDConst.DISPLACE_CHANGE_CAMP).content;
        if (this._isChooseRedHero()) {
            strContent = cfg.get(ParameterIDConst.DISPLACE_RED_ACROSS).content;
        } else if (this._isChooseGoldHero()) {
            strContent = cfg.get(ParameterIDConst.DISPLACE_GOLD_ACROSS).content;
        }
        var tbTemp = stringUtil.split(strContent, '|');
        var costType = parseFloat(tbTemp[0]);
        var costValue = parseFloat(tbTemp[1]);
        var costSize = parseFloat(tbTemp[2]);
        return [
            costType,
            costValue,
            costSize
        ];
    }
    _updateCost1() {
        var [costType, costValue, costSize] = this._getCostParam1();
        this._nodeCost.updateUI(costType, costValue);
        var count = UserDataHelper.getNumByTypeAndValue(costType, costValue);
        var max = this._getNeedItemCount1();
        var enough = count >= max;
        this._nodeCost.setCount(max);
        this._nodeCost.setTextColorToDTypeColor(enough);
    }
    _updateCost2() {
        var [costType, costValue, costSize] = this._getCostParam2();
        this._nodeCost2.updateUI(costType, costValue);
        var count = UserDataHelper.getNumByTypeAndValue(costType, costValue);
        var needCount = this._getNeedItemCount2(costSize);
        if (needCount == 0) {
            this._nodeCost2.setVisible(false);
        } else {
            this._nodeCost2.setVisible(true);
            var enough = count >= needCount;
            this._nodeCost2.setCount(needCount);
            this._nodeCost2.setTextColorToDTypeColor(enough);
        }
    }
    _getNeedItemCount1() {
        var totalCost = {};
        var count = 0;
        for (var i in this._srcHeroIds) {
            var heroId = this._srcHeroIds[i];
            var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var cost1 = HeroDataHelper.getAllBreakCost(unitData);
            var cost2 = HeroDataHelper.getAllAwakeCost(unitData);
            RecoveryDataHelper.formatRecoveryCost(totalCost, TypeConvertHelper.TYPE_HERO, unitData.getBase_id(), 1);
            RecoveryDataHelper.mergeRecoveryCost(totalCost, cost1);
            RecoveryDataHelper.mergeRecoveryCost(totalCost, cost2);
        }
        for (var type in totalCost) {
            var unit = totalCost[type];
            if (type == TypeConvertHelper.TYPE_HERO.toString()) {
                for (var value in unit) {
                    var size = unit[value];
                    count = count + size;
                }
            }
        }
        var cfg = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var temp = parseFloat(cfg.get(ParameterIDConst.DISPLACE_PROPORTION).content);
        if (this._isChooseRedHero()) {
            temp = parseFloat(cfg.get(ParameterIDConst.DISPLACE_RED_BASIS).content);
        } else if (this._isChooseGoldHero()) {
            temp = parseFloat(cfg.get(ParameterIDConst.DISPLACE_HERO_GOLD).content);
        }
        count = Math.ceil(count / temp);
        return count;
    }
    _getNeedItemCount2(ratio) {
        if (this._tarHeroBaseId == 0) {
            return 0;
        }
        var count = 0;
        var tarCountry = UserDataHelper.getHeroConfig(this._tarHeroBaseId).country;
        var tbTemp = {};
        for (var i in this._srcHeroIds) {
            var heroId = this._srcHeroIds[i];
            var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var baseId = unitData.getBase_id();
            var country = unitData.getConfig().country;
            if (tbTemp[country] == null) {
                tbTemp[country] = {};
            }
            if (tbTemp[country][baseId] == null) {
                tbTemp[country][baseId] = true;
            }
        }
        for (country in tbTemp) {
            var one = tbTemp[country];
            if (country != tarCountry) {
                for (var id in one) {
                    var value = one[id];
                    count = count + ratio;
                }
            }
        }
        this._isChangeCountry = count > 0;
        return count;
    }
    _setButtonEnable(enable) {
        this._buttonPreview.setEnabled(enable);
        this._buttonTransform.setEnabled(enable);
        this._srcHero.setEnabled(enable);
        this._tarHero.setEnabled(enable);
    }
    _heroTransformSuccess() {
        this._playEffect();
    }
    _playEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        let eventFunction = function (event) {
            if (event == '1p') {
                var action = cc.fadeOut(0.3);
                var heroNode = this._srcHero.getHeroNode();
                heroNode.node.runAction(action);
            } else if (event == '2p') {
                var action = cc.fadeOut(0.3);
                var heroNode = this._tarHero.getHeroNode();
                heroNode.node.runAction(action);
            } else if (event == 'finish') {
                PopupTransformResult.getIns(PopupTransformResult, (popup: PopupTransformResult) => {
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