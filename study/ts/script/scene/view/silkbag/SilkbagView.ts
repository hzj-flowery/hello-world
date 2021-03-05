const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { SilkbagConst } from '../../../const/SilkbagConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import UIConst from '../../../const/UIConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { EffectGfxType } from '../../../manager/EffectGfxManager';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonHeroPower from '../../../ui/component/CommonHeroPower';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import { unpack } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import ViewBase from '../../ViewBase';
import TeamHeroBustIcon from '../team/TeamHeroBustIcon';
import PopupSilkbagDetail from './PopupSilkbagDetail';
import SilkbagIcon from './SilkbagIcon';
import SilkbagListCell from './SilkbagListCell';





@ccclass
export default class SilkbagView extends ViewBase {

    private static count2Pos = {
        1: [cc.v2(196, 390)],
        2: [cc.v2(196, 390), cc.v2(31, 105)],
        3: [cc.v2(196, 390), cc.v2(31, 105), cc.v2(361, 105)],
        4: [cc.v2(62, 334), cc.v2(331, 334), cc.v2(62, 66), cc.v2(331, 66)],
        5: [cc.v2(196, 390), cc.v2(15, 259), cc.v2(377, 259), cc.v2(84, 46), cc.v2(308, 46)],
        6: [cc.v2(196, 390), cc.v2(31, 295), cc.v2(361, 295), cc.v2(31, 105), cc.v2(361, 105), cc.v2(196, 10)],
        7: [cc.v2(196, 390), cc.v2(47, 318), cc.v2(344, 318), cc.v2(11, 157), cc.v2(381, 157), cc.v2(113, 28), cc.v2(278, 28)],
        8: [cc.v2(196, 390), cc.v2(62, 333), cc.v2(331, 333), cc.v2(6, 199), cc.v2(386, 199), cc.v2(62, 65), cc.v2(330, 65), cc.v2(196, 10)],
        9: [cc.v2(196, 390), cc.v2(72, 344), cc.v2(318, 344), cc.v2(8, 232), cc.v2(384, 232), cc.v2(30, 103), cc.v2(361, 103), cc.v2(131, 21), cc.v2(261, 21)],
        10: [cc.v2(138, 380), cc.v2(255, 380), cc.v2(43, 309), cc.v2(350, 309), cc.v2(6, 198), cc.v2(386, 198), cc.v2(42, 87), cc.v2(350, 87), cc.v2(136, 18), cc.v2(253, 18)]
    };

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _silkbagPanel: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _silkbagIcon: cc.Prefab = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePlateButtom: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePlateFront: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHero: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeHeroIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewLineup: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonDetail: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDetailEffect: cc.Node = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBasic: cc.Node = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _tabListView: CommonListView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageWaterFlow: CommonEmptyListNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTotalEffect: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    _heroScrollView: cc.ScrollView;

    _pos: any;
    _selectTabIndex: number;
    _curSilkbagIndex: number;
    _recordAttr: any;
    _heroUnitData: any;
    _iconBgs: any[];
    _heroIcons: TeamHeroBustIcon[];
    _allWearedSilkbagIds: any[];
    _silkbagIds: any[];
    _enterEffects: any[];
    _signalSilkbagEquip;
    _enterMoving;
    _showSilkbagIcons: SilkbagIcon[];
    _silkbagIcons: SilkbagIcon[];

    protected preloadEffectList = [{
        type: EffectGfxType.SingleGfx,
        name: "smoving_jinnang_right"
    }]

    ctor(pos) {
        this._pos = pos;
    }
    onCreate() {
        this.setSceneSize();
        this._initData();
        this._initView();
    }
    onEnter(){
    }
        
    onExit(){

    }
    _initData() {
      var param = G_SceneManager.getViewArgs('silkbag');
      this.ctor(param[0]);
      this._pos = this._pos || 1;
        G_UserData.getTeam().setCurPos(this._pos);
        this._selectTabIndex = -1;
        this._allWearedSilkbagIds = [];
        this._curSilkbagIndex = 1;
        this._silkbagIds = [];
        this._recordAttr = null;
        this._heroUnitData = null;
        this._enterEffects = [];
    }
    _initView() {
        this._topbarBase.setImageTitle('txt_sys_com_silkbag');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.node.x = (1136 - G_ResolutionManager.getDesignWidth()) / 2;
     
        this._initHeroIcons();
        this._initSilkbagIcons();
        this._initListView();
    }
    _initHeroIcons() {
        // function createIcon(icon) {s
        //     var iconBg = ccui.Widget.create();
        //     var iconBgSize = cc.size(100, 127);
        //     iconBg.setContentSize(iconBgSize);
        //     icon.setPosition(cc.v2(iconBgSize.width / 2, iconBgSize.height / 2));
        //     iconBg.addChild(icon);
        //     return iconBg;
        // }
        this._iconBgs = [];
        this._heroIcons = [];
        var iconsData = SilkbagDataHelper.getHeroIconsData();
        for (var i = 0; i < 6; i++) {
            var iconBg = this._listViewLineup.getChildByName('TeamHeroBustIcon' + i);
            iconBg.setPosition(0, -(62 + 127 * i));
            if (i < iconsData.length) {
                var icon = iconBg.getComponent(TeamHeroBustIcon);
                icon.setInitData(i + 1, handler(this, this._onHeroIconClicked));
                this._iconBgs.push(iconBg);
                this._heroIcons.push(icon);
            } else {
                iconBg.active = false;
            }
        }
        this._heroScrollView = this._listViewLineup.parent.parent.getComponent(cc.ScrollView);
        this._listViewLineup.height = 127 * iconsData.length;
    }
    _initSilkbagIcons() {
        this._silkbagIcons = [];
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_SILKBAG_SLOT' + i])[0];
            var silkbagIconNode = cc.instantiate(this._silkbagIcon);
            var comp = silkbagIconNode.getComponent(SilkbagIcon);
            comp.ctor(i, handler(this, this._onClickSilkbagIcon));
            this._silkbagIcons.push(comp);
            this._silkbagPanel.addChild(silkbagIconNode);

            //碰到第一个未解锁的，就结束
            if (!isOpen) {
                break;
            }

        }
    }
    _initListView() {
        var scrollViewParam = {
            template: SilkbagListCell,
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        this._tabListView.init(null, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        var tabNameList = [];
        tabNameList.push(Lang.get('silkbag_list_tab_name1'));
        tabNameList.push(Lang.get('silkbag_list_tab_name2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
    }
    _onTabSelect(index, sender) {
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateData();
        this._updateList();
        return true;
    }
    start() {
        this._signalSilkbagEquip = G_SignalManager.add(SignalConst.EVENT_SILKBAG_EQUIP_SUCCESS, handler(this, this._silkbagEquipSuccess));
        var emptyIndex = this._getEmptyIndex();
        this._curSilkbagIndex = emptyIndex || 1;
        this._updateData();
        this._updateHeroIcons();
        this._updateSilkbagIconsPos();
        this._updateView();

        this._nodeTabRoot.setTabIndex(0);
        this._playEnterEffect();
        this._startRotatePlate();
        this._nodeHeroIcon.setCallBack(handler(this, this.onButtonDetailClicked));
    }
    onDestroy() {
        this._signalSilkbagEquip.remove(); 
        this._signalSilkbagEquip = null;
        this._stopRotatePlate();
    }
    _startRotatePlate() {
        this._imagePlateButtom.node.runAction(cc.repeatForever(cc.rotateBy(60, 360)));
        this._imagePlateFront.node.runAction(cc.repeatForever(cc.rotateBy(60, -360)));
    }
    _stopRotatePlate() {
        // this._imagePlateButtom.node.stopAllActions();
        // this._imagePlateFront.node.stopAllActions();
    }
    _updateData() {
        var curPos = G_UserData.getTeam().getCurPos();
        this._allWearedSilkbagIds = this._getAllWearedIds(curPos);
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_SILKBAG_SLOT' + curPos]);
        var heroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
        var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
        this._heroUnitData = unitData;
        var param = { heroUnitData: unitData };
        var curAttr = HeroDataHelper.getTotalAttr(param);
        this._recordAttr.updateData(curAttr);
        G_UserData.getAttr().recordPower();
        var heroBaseId = unitData.getAvatarToHeroBaseId();
        var heroRank = unitData.getRank_lv();
        var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(curPos);
        var isWeard = !(this._selectTabIndex == 0);
        var heroLimit = unitData.getLeaderLimitLevel();
        var heroRedLimit = unitData.getLeaderLimitRedLevel();
        this._silkbagIds = G_UserData.getSilkbag().getListBySort(heroBaseId, heroRank, isInstrumentMaxLevel, curPos, isWeard, heroLimit, heroRedLimit);
    }
    _getAllWearedIds(curPos) {
        var silkbagIds = [];
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            var silkbagId = G_UserData.getSilkbagOnTeam().getIdWithPosAndIndex(curPos, i);
            if (silkbagId > 0) {
                silkbagIds.push(silkbagId);
            }
        }
        return silkbagIds;
    }
    _updateView() {
        this._updateHeroIconsSelectedState();
        this._updateSilkbagViews();
    }
    _updateHeroIcons() {
        var iconsData = SilkbagDataHelper.getHeroIconsData();
        for (var i in iconsData) {
            var data = iconsData[i];
            var icon = this._heroIcons[i];
            icon.updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel);
        }
    }
    _updateSilkbagViews() {
        this._updateHeroIconRedPoint();
        this._updateBaseInfo();
        this._updateSilkbagIcons();
        this._updateSilkbagIconRedPoint();
        this._updateList();
    }
    _updateHeroIconRedPoint() {
        for (var i in this._heroIcons) {
            var icon = this._heroIcons[i];
            var redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_SILKBAG, parseFloat(i) + 1);
            icon.showRedPoint(redValue);
        }
    }
    _updateBaseInfo() {
        var [showId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
        var limitLevel = avatarLimitLevel || this._heroUnitData.getLimit_level();
        var limitRedLevel = arLimitLevel || this._heroUnitData.getLimit_rtg();
        this._nodeHeroIcon.updateUI(showId, null, limitLevel, limitRedLevel);

        var param = { heroUnitData: this._heroUnitData };
        var attrInfo = HeroDataHelper.getHeroPowerAttr(param);
        var power = AttrDataHelper.getPower(attrInfo);
        this._fileNodePower.updateUI(power);
        var width = this._fileNodePower.getWidth();
        var posX = (0 - width) / 2;
        this._fileNodePower.node.x = (posX);
    }
    _updateSilkbagIconsPos() {
        var count = this._silkbagIcons.length;
        this._showSilkbagIcons = [];
        for (var i = 0; i < count; i++) {
            this._silkbagIcons[i].node.active = (true);
            var pos = SilkbagView.count2Pos[count][i];
            this._silkbagIcons[i].setPosition(cc.v2(pos.x - 198.5, pos.y - 198.5));
            this._showSilkbagIcons.push(this._silkbagIcons[i]);
        }
    }
    _updateSilkbagIcons() {
        var curPos = G_UserData.getTeam().getCurPos();
        for (var i = 1; i <= this._silkbagIcons.length; i++) {
            this._silkbagIcons[i - 1].updateIcon(curPos);
            this._silkbagIcons[i - 1].setSelected(i == this._curSilkbagIndex);
        }
    }
    _updateSilkbagIconRedPoint() {
        var curPos = G_UserData.getTeam().getCurPos();
        for (var i = 1; i <= this._silkbagIcons.length; i++) {
            var param = {
                pos: curPos,
                slot: i
            };
            var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SILKBAG, 'slotRP', param);
            this._silkbagIcons[i - 1].showRedPoint(redValue);
        }
    }
    _onClickSilkbagIcon(index) {
        if (index == this._curSilkbagIndex) {
            return;
        }
        this._curSilkbagIndex = index;
        for (var i = 1; i <= this._silkbagIcons.length; i++) {
            this._silkbagIcons[i - 1].setSelected(i == this._curSilkbagIndex);
        }
    }
    _updateList() {
        var count = this._silkbagIds.length;
        this._tabListView.setData(count, this._selectTabIndex);
        if (count == 0) {
            this._imageWaterFlow.node.active = (true);
        } else {
            this._imageWaterFlow.node.active = (false);
        }
    }
    _onItemUpdate(item, index, type) {
        var index = index;
        var silkbagId = this._silkbagIds[index];
        if (silkbagId) {
            var heroBaseId = this._heroUnitData.getAvatarToHeroBaseId();
            var heroRank = this._heroUnitData.getRank_lv();
            var curPos = G_UserData.getTeam().getCurPos();
            var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(curPos);
            var heroLimit = this._heroUnitData.getLeaderLimitLevel();
            var heroRedLimit = this._heroUnitData.getLeaderLimitRedLevel()
            item.updateItem(index, [silkbagId, heroBaseId, heroRank, isInstrumentMaxLevel, curPos, heroLimit, heroRedLimit]);
        } else {
            item.updateItem(index, null, type);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var index = index + t;
        var silkbagId = this._silkbagIds[index];
        var curPos = G_UserData.getTeam().getCurPos();
        var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
        var isCanWear = unitData.isCanWearWithPos(curPos);
        if (!isCanWear) {
            G_Prompt.showTip(Lang.get('silkbag_only_equip_tip'));
            return;
        }
        G_UserData.getSilkbag().c2sEquipSilkbag(curPos, this._curSilkbagIndex, silkbagId);
    }
    _onHeroIconClicked(pos) {
        var curPos = G_UserData.getTeam().getCurPos();
        if (pos == curPos) {
            return;
        }
        G_UserData.getTeam().setCurPos(pos);
        var emptyIndex = this._getEmptyIndex();
        this._curSilkbagIndex = emptyIndex || 1;
        this._updateData();
        this._updateView();
    }
    _updateHeroIconsSelectedState() {
        var curPos = G_UserData.getTeam().getCurPos();
        for (var i in this._heroIcons) {
            var icon = this._heroIcons[i];
            var j = parseFloat(i) + 1;
            if (j == curPos) {
                icon.setSelected(true);
            } else {
                icon.setSelected(false);
            }
        }
        if (curPos >= 1 && curPos <= 4) {
            this._heroScrollView.scrollToTop();
            // this._listViewLineup.jumpToTop();
        } else if (curPos >= 5 && curPos <= 6) {
            this._heroScrollView.scrollToBottom();
            // this._listViewLineup.jumpToBottom();
        }
    }
    _getEmptyIndex() {
        var curPos = G_UserData.getTeam().getCurPos();
        for (var i = 1; i <= SilkbagConst.SLOT_MAX; i++) {
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_SILKBAG_SLOT' + i])[0];
            if (isOpen) {
                var silkbagId = G_UserData.getSilkbagOnTeam().getIdWithPosAndIndex(curPos, i);
                if (silkbagId == 0) {
                    return i;
                }
            }
        }
        return null;
    }
    onButtonDetailClicked() {
        var silkbagIds = this._allWearedSilkbagIds;
        if (silkbagIds.length == 0) {
            G_Prompt.showTip(Lang.get('silkbag_no_detail_tip'));
            return;
        }
        var curPos = G_UserData.getTeam().getCurPos();
        PopupSilkbagDetail.getIns(PopupSilkbagDetail, (p: PopupSilkbagDetail) => {
            p.openWithAction();
            p.updateUI(silkbagIds, curPos);

        })
    }
    _silkbagEquipSuccess(eventName, pos, index, silkbagId) {
        if (silkbagId > 0) {
            var emptyIndex = this._getEmptyIndex();
            if (emptyIndex) {
                this._curSilkbagIndex = emptyIndex;
            }
        }
        this._updateData();
        this._updateSilkbagViews();
        this._playEffect(index, silkbagId);
        this._playPrompt(silkbagId);
    }
    _playEffect(index, silkbagId) {
        if (silkbagId == 0) {
            return;
        }
        var color2EffectName = {
            4: 'effect_jinnang_zisejihuo',
            5: 'effect_jinnang_chengsejihuo',
            6: 'effect_jinnang_hongsejihuo',
            7: 'effect_jinnang_hongsejihuo'
        };
        var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
        var baseId = unitData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId);
        var effectName = color2EffectName[param.color];
        this._silkbagIcons[index - 1].playEffect(effectName);
    }
    _playPrompt(silkbagId) {
        var summary = [];
        var param = {
            content: silkbagId == 0 && Lang.get('summary_silkbag_unload_success') || Lang.get('summary_silkbag_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_SILKBAG }
        };
        summary.push(param);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_SILKBAG);
    }
    _addBaseAttrPromptSummary(summary) {
        var attrIds = this._recordAttr.getAllAttrIdsBySort();
        for (var i in attrIds) {
            var attrId = attrIds[i];
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_SILKBAG + UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _playEnterEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'ren') {
                this._playTopAndDownEnter();
                this._playHeroEnter();
            } else if (event == 'left_right') {
                this._playLeftHeroIconEnter();
                this._playRightPanelEnter();
            } else if (event == 'xiangqing') {
                this._playDetailEnter();
            } else if (event == 'left_right_icon') {
                this._playSilkbagIconEnter();
            } else if (event == 'finish') {
                this._onEnterEffectFinish();
            }
        }.bind(this);
        this._resetEffectNode();
        this._hideAllEffectNode();
        if (this._enterMoving) {
            this._enterMoving.node.runAction(cc.destroySelf());
            this._enterMoving = null;
        }
        this._enterMoving = G_EffectGfxMgr.createPlayMovingGfx(this._nodeTotalEffect, 'moving_jinnang_ui', null, eventFunction, false);
    }
    _resetEffectNode() {
        for (var i in this._enterEffects) {
            var effect = this._enterEffects[i];
            effect.reset();
        }
        this._enterEffects = [];
    }
    _hideAllEffectNode() {
        this._topbarBase.node.active = (false);
        this._nodeHero.active = (false);
        this._nodeDetailEffect.active = (false);
        this._hideLeftHeroIcon();
        this._panelBasic.active = (false);
        this._hideSilkbagIcon();
    }
    _hideLeftHeroIcon() {
        for (var i in this._iconBgs) {
            var iconBg = this._iconBgs[i];
            iconBg.active = (false);
        }
    }
    _hideSilkbagIcon() {
        for (var i in this._showSilkbagIcons) {
            var icon = this._showSilkbagIcons[i];
            icon.node.active = (false);
        }
    }
    _playTopAndDownEnter() {
        this._topbarBase.node.active = (true);
        var enterEffectTop = G_EffectGfxMgr.applySingleGfx(this._topbarBase.node, 'smoving_shangdian_top', null, null, null);
        this._enterEffects.push(enterEffectTop);
    }
    _playHeroEnter() {
        this._nodeHero.active = (true);
        var enterEffectHero = G_EffectGfxMgr.applySingleGfx(this._nodeHero, 'smoving_shangdian_alpha', null, null, null);
        this._enterEffects.push(enterEffectHero);
    }
    _playLeftHeroIconEnter() {
        var nodes = [];
        for (var i in this._iconBgs) {
            var iconBg = this._iconBgs[i];
            nodes.push(iconBg);
        }
        var actions = [];
        for (i in nodes) {
            let node = nodes[i];
            var action1 = cc.callFunc(function () {
                node.active = (true);
                var enterEffectHeroIcon = G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhenrong_left', null, null, null);
                this._enterEffects.push(enterEffectHeroIcon);
            }.bind(this));
            var action2 = cc.delayTime(0.06);
            actions.push(action1);
            if (i != (nodes.length - 1).toString()) {
                actions.push(action2);
            }
        }
        var action = cc.sequence(unpack(actions));
        this._nodeTotalEffect.runAction(action);
    }
    _playRightPanelEnter() {
        this._panelBasic.active = (true);
        //todo 加了这个特效右边的不知道跑哪里去了
       // var enterEffectRight = G_EffectGfxMgr.applySingleGfx(this._panelBasic, 'smoving_jinnang_right', null, null, null);
        //this._enterEffects.push(enterEffectRight);
    }
    _playDetailEnter() {
        this._nodeDetailEffect.active = (true);
        var enterEffectDetail = G_EffectGfxMgr.applySingleGfx(this._nodeDetailEffect, 'smoving_jinnang_xiangqing', null, null, null);
        this._enterEffects.push(enterEffectDetail);
    }
    _playSilkbagIconEnter() {
        var count = this._showSilkbagIcons.length;
        var leftNodes = [];
        var rightNodes = [];
        var isOdd = count % 2 == 1;
        for (var i in this._showSilkbagIcons) {
            var icon = this._showSilkbagIcons[i];
            var j = parseFloat(i);
            if (j == 0) {
                leftNodes.push(icon);
            } else {
                var indexOdd = j % 2 == 1;
                if (isOdd) {
                    if (indexOdd) {
                        rightNodes.push(icon);
                    } else {
                        leftNodes.push(icon);
                    }
                } else {
                    if (indexOdd) {
                        leftNodes.push(icon);
                    } else {
                        rightNodes.push(icon);
                    }
                }
            }
        }
        var leftActions = [];
        var actionDelay = cc.delayTime(0.06);
        for (i in leftNodes) {
            let node = leftNodes[i];
            var action = cc.callFunc(function () {
                node.node.active = (true);
                var enterEffectLeftIcon = G_EffectGfxMgr.applySingleGfx(node.node, 'smoving_jinnang_left_icon', null, null, null);
                this._enterEffects.push(enterEffectLeftIcon);
            }.bind(this));
            leftActions.push(action);
            if (i != (leftNodes.length - 1).toString()) {
                leftActions.push(actionDelay);
            }
        }
        var rightActions = [];
        var actionDelay = cc.delayTime(0.06);
        for (i in rightNodes) {
            let node = rightNodes[i];
            var action = cc.callFunc(function () {
                node.node.active = (true);
                var enterEffectRightIcon = G_EffectGfxMgr.applySingleGfx(node.node, 'smoving_jinnang_right_icon', null, null, null);
                this._enterEffects.push(enterEffectRightIcon);
            }.bind(this));
            rightActions.push(action);
            if (i != (rightNodes.length - 1).toString()) {
                rightActions.push(actionDelay);
            }
        }
        if (leftActions.length > 0) {
            if (leftActions.length <= 1) {
                this._nodeTotalEffect.runAction(leftActions[0]);
            }
            else {
                var leftAction = cc.sequence(unpack(leftActions));
                this._nodeTotalEffect.runAction(leftAction);
            }
        }
        if (rightActions.length > 0) {
            if (rightActions.length <= 1) {
                this._nodeTotalEffect.runAction(rightActions[0]);
            }
            else {
                var rightAction = cc.sequence(unpack(rightActions));
                this._nodeTotalEffect.runAction(rightAction);
            }
        }
    }
    _onEnterEffectFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'SilkbagView');
    }

}