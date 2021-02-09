import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { SignalConst } from "../../../const/SignalConst";
import TeamConst from "../../../const/TeamConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import UIConst from "../../../const/UIConst";
import { HistoryHeroUnit } from "../../../data/HistoryHeroUnit";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { G_ResolutionManager, G_SignalManager, G_AudioManager, G_UserData, Colors, G_Prompt, G_SceneManager, G_EffectGfxMgr, G_ConfigLoader } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Normal from "../../../ui/component/CommonButtonLevel1Normal";
import CommonHistoryAvatar from "../../../ui/component/CommonHistoryAvatar";
import CommonPowerPrompt from "../../../ui/component/CommonPowerPrompt";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { rawget } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import HistoryHeroAvatar from "../historyhero/HistoryHeroAvatar";
import HistoryHeroTrainAwakeLayer from "../historyhero/HistoryHeroTrainAwakeLayer";
import { PopupChooseHistoricalItemView } from "../historyhero/PopupChooseHistoricalItemView";
import PopupHistoryHeroDetail from "../historyhero/PopupHistoryHeroDetail";
import TeamHeroBustIcon from "../team/TeamHeroBustIcon";
import TeamViewHelper from "../team/TeamViewHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroTrainView extends ViewBase {
    @property({ type: cc.Node, visible: true })
    _nodeAvatar: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeAttr: cc.Node = null;
    @property({ type: cc.Button, visible: true })
    _btnAddHero: cc.Button = null;
    @property({ type: CommonButtonLevel1Normal, visible: true })
    _buttonReplace: CommonButtonLevel1Normal = null;
    @property({ type: cc.Label, visible: true })
    _labelAttr1: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelAttr2: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelAttr3: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelAttr4: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _labelFormation: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    _panelLeft: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeCenter: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeDes: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeLayer: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node1: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node2: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node3: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node4: cc.Node = null;
    @property({
        type: CommonPowerPrompt,
        visible: true
    })
    _fileNodePower: CommonPowerPrompt = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _avatarPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _awakePrefab: cc.Prefab = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _listViewLineup: cc.Node = null;
    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property({ type: cc.Sprite, visible: true })
    _attrBg: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _btnAddRedpoint: cc.Sprite = null;

    _pos: any;
    _awakenLayer: any;
    _curTabIndex: number;
    _heroList: {};
    _squadIndex: number;
    _curAvatarIndex: number;
    _skillDesc: cc.Label;
    _attrDiff: any;
    _curHistoryHeroUnitData: any;
    _lastTotalPower: number;
    _diffPower: number;
    _isDoOnformation: boolean;
    _starFormationUpdate: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _leftIcons: {};
    _heroIcons: any[];
    _effectShow: import("f:/mingjiangzhuan/main/assets/resources/script/effect/EffectGfxMoving").default;

    _heroScrollView: cc.ScrollView;

    HeroSkillActiveConfig;
    _historyAvatar: HistoryHeroAvatar;

    ctor(pos) {
        this._initMember(pos);
        UIHelper.addEventListener(this.node, this._btnAddHero, 'HistoryHeroTrainView', '_onButtonAdd');
        this._buttonReplace.addClickEventListenerEx(handler(this, this._onButtonReplace));
        this.HeroSkillActiveConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE);
    }
    _initMember(pos) {
        this._pos = pos;
        this._awakenLayer = null;
        this._curTabIndex = 1;
        this._heroList = {};
        this._squadIndex = 1;
        this._curAvatarIndex = 0;
        this._skillDesc = null;
        this._attrDiff = {};
        this._curHistoryHeroUnitData = null;
        this._lastTotalPower = 0;
        this._diffPower = 0;
        this._isDoOnformation = false;
    }
    onCreate() {
        this.setSceneSize();
        var param = G_SceneManager.getViewArgs('historyheroTrain');
        this.ctor(param[0] || 1);
        this._fileNodePower.node.active = false;
        this._initBaseView();
        this._initBtn();
        this._initAwakenLayer();
        this._createAnimation();
    }
    onEnter() {
        this._starFormationUpdate = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(this, this._onStarFormationUpdate));
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HISTORY_HERO);
        this._topbarBase.setImageTitle('txt_sys_com_historical02');
        this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        this._refreshData();
        this.updateUI();
        this._recordTotalPower();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BGM_HISTORY_HERO_TRAIN);
    }

    start() {
        this._updateHeroIcons();
        this._updateLeftIconsSelectedState();
    }

    onExit() {
        if (this._starFormationUpdate) {
            this._starFormationUpdate.remove();
            this._starFormationUpdate = null;
        }
    }
    updateUI(bAnimate?) {
        this._updateAwakenLayer();
        this._updateAttr(bAnimate);
        this._updateAvatarView();
        this._updateBtn();
    }
    _initBaseView() {
        this._initNoDataUI();
        this._initStarListView();
    }
    _initStarListView() {
        var heroIds = G_UserData.getTeam().getHeroIds();

        this._heroIcons = [];
        for (var i = 0; i < 6; i++) {
            var iconBg = this._listViewLineup.getChildByName('TeamHeroBustIcon' + i);
            iconBg.setPosition(0, -(62 + 127 * i));
            if (i < heroIds.length) {
                var icon = iconBg.getComponent(TeamHeroBustIcon);
                icon.setInitData(i + 1, handler(this, this._onLeftIconClicked));
                this._heroIcons.push(icon);
            } else {
                iconBg.active = false;
            }
        }
        this._heroScrollView = this._listViewLineup.parent.parent.getComponent(cc.ScrollView);
        this._listViewLineup.height = 127 * heroIds.length;
    }
    _initNoDataUI() {
        UIActionHelper.playBlinkEffect(this._btnAddHero.node);
        this._btnAddHero.node.active = (false);
    }
    _initBtn() {
        this._buttonReplace.setString(Lang.get('historyhero_replace'));
    }
    _updateAvatarView() {
        var curIndex = this._pos;
        if (this._heroList == null || rawget(this._heroList, curIndex) == null) {
            this._nodeAvatar.active = false;
            this._btnAddHero.node.active = (true);
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'space');
            this._showBtnAddRedPoint(reach);
            return;
        }
        if (!this._heroList[curIndex]) {
            return;
        }
        this._btnAddHero.node.active = (false);
        this._nodeAvatar.active = true;
        if (!this._historyAvatar) {
            this._historyAvatar = cc.instantiate(this._avatarPrefab).getComponent(HistoryHeroAvatar);
            this._historyAvatar.setTouchCallback(handler(this, this._onAvatarClicked));
            this._nodeAvatar.addChild(this._historyAvatar.node);
        }
        this._historyAvatar.updateUI(this._heroList[curIndex].getConfig(), false);
    }
    _updateBtn() {
        var curIndex = this._pos;
        if (this._heroList[curIndex]) {
            this._buttonReplace.setVisible(true);
            this._nodeAttr.active = (true);
        } else {
            this._buttonReplace.setVisible(false);
            this._nodeAttr.active = (false);
        }
        if (this._heroList[curIndex]) {
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HISTORY_FORMATION, 'strongerThanMe', this._heroList[curIndex]);
            this._buttonReplace.showRedPoint(reach);
        } else {
            this._buttonReplace.showRedPoint(false);
        }
    }
    _initAwakenLayer() {
        this._awakenLayer = cc.instantiate(this._awakePrefab).getComponent(HistoryHeroTrainAwakeLayer);
        this._awakenLayer.setStatusChangeCallback(handler(this, this._onHeroStatusChageCallback));
        this._nodeLayer.addChild(this._awakenLayer.node);
    }
    _updateAwakenLayer() {
        var curIndex = this._pos;
        this._awakenLayer.updateUI(this._heroList[curIndex], this._isDoOnformation);
        if (this._heroList == null || table.nums(this._heroList) <= 0) {
            this._awakenLayer.setWeaponVisible(false);
        }
    }
    _onHeroStatusChageCallback(unitData, bAttrChanged, bUnload) {
        this._refreshData();
        if (bAttrChanged) {
            this._updateAttrDiff(unitData);
            this._playPrompt(unitData, bUnload);
            this._playPowerPromt();
        }
        this._recordTotalPower();
    }
    _updateAttr(bAnimate) {
        var curIndex = this._pos;
        var heroUnitData = this._heroList[curIndex];
        if (!heroUnitData) {
            heroUnitData = this._createFakeData();
        }
        var limitLevel = heroUnitData.getBreak_through();
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData.getConfig().id, limitLevel);
        this._labelFormation.string = ('');
        if (bAnimate) {
            this._labelAttr1.string = (heroStepInfo.atk);
            this._labelAttr2.string = (heroStepInfo.hp);
            this._labelAttr3.string = (heroStepInfo.pdef);
            this._labelAttr4.string = (heroStepInfo.mdef);
        } else {
            this._labelAttr1.string = (heroStepInfo.atk);
            this._labelAttr2.string = (heroStepInfo.hp);
            this._labelAttr3.string = (heroStepInfo.pdef);
            this._labelAttr4.string = (heroStepInfo.mdef);
        }
        var widthDiff = -70; //this._labelFormation.node.getContentSize().width
        this._attrBg.node.setContentSize(cc.size(581 + widthDiff, 32));
        var position = [
            80,
            208,
            336,
            464
        ];
        for (var i = 1; i <= 4; i++) {
            this['_node' + i].x = (position[i - 1] - this._attrBg.node.width / 2 + widthDiff);
        }

        var skillConfig = this.HeroSkillActiveConfig.get(heroStepInfo.skill_id);
        var skillDes = '[' + (skillConfig.name + (']' + skillConfig.description));
        if (this._skillDesc == null) {
            this._skillDesc = UIHelper.createWithTTF('', Path.getCommonFont(), 20);
            this._skillDesc.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._skillDesc.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            this._skillDesc.node.color = Colors.NUMBER_WHITE;
            this._skillDesc.node.width = 520;
            this._skillDesc.node.setAnchorPoint(cc.v2(0.5, 1));
            this._skillDesc.node.setPosition(this._nodeDes.getPosition());
            this._nodeAttr.addChild(this._skillDesc.node);
        }
        this._skillDesc.string = (skillDes);
        this._recordAttr(heroUnitData);
    }
    _onButtonClick(sender) {
        var funcId = sender.getTag();
        if (funcId > 0) {
            WayFuncDataHelper.gotoModuleByFuncId(funcId);
        }
    }
    _onButtonAdd(sender) {
        this._recordTotalPower();
        var okCallback = function (id) {
            this._isDoOnformation = true;
            G_UserData.getHistoryHero().c2sStarEquip(id, this._pos - 1);
        }.bind(this);
        var notInFormationList = G_UserData.getHistoryHero().getNotInFormationList();
        if (notInFormationList.length == 0) {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
                popup.setTitle(Lang.get('way_type_get'));
                popup.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO, HistoryHeroConst.DEFAULT_HISTORY_HERO_ID);
                popup.openWithAction();
            })
        } else {
            G_SceneManager.openPopup('prefab/historyhero/PopupChooseHistoricalItemView',  (pop: PopupChooseHistoricalItemView)=> {
                pop.updateUI(HistoryHeroConst.TAB_TYPE_HERO, null, okCallback);
                pop.openWithAction();
            });

            // var PopupChooseHistoricalItemView = new (require('PopupChooseHistoricalItemView'))(HistoryHeroConst.TAB_TYPE_HERO, null, okCallback);
            // PopupChooseHistoricalItemView.open();
        }
    }
    _onButtonReplace(sender) {
        this._recordTotalPower();
        var okCallback = function(id, arg, data) {
            if (data.isDown) {
                id = 0;
            }
            G_UserData.getHistoryHero().c2sStarEquip(id, this._pos - 1);
        }.bind(this);
        var curHeroUnitData = this._heroList[this._pos];
        G_SceneManager.openPopup('prefab/historyhero/PopupChooseHistoricalItemView',  (pop: PopupChooseHistoricalItemView)=> {
            pop.updateUI(HistoryHeroConst.TAB_TYPE_HERO, curHeroUnitData, okCallback);
            pop.openWithAction();
        });
    }
    _onLeftIconClicked(pos) {
        if (pos == this._pos) return;
        var iconData = TeamViewHelper.getHeroAndPetIconData();
        var info = iconData[pos - 1];
        if (info.type == TypeConvertHelper.TYPE_HERO) {
            var state = G_UserData.getTeam().getStateWithPos(pos);
            if (state == TeamConst.STATE_HERO) {
                this._pos = pos;
                this._updateLeftIconsSelectedState();
                this.updateUI(false);
            } else if (state == TeamConst.STATE_OPEN) {
            } else if (state == TeamConst.STATE_LOCK) {
                G_Prompt.showTip(Lang.get('team_not_unlock_tip'));
            }
        }
    }
    _onStarFormationUpdate(id, message) {
        this._refreshData();
        this.updateUI();
        this._playPowerPromt();
        this._recordTotalPower();
        this._isDoOnformation = false;
    }
    _setCallback() {
        // G_UserData.getTeamCache().setShowHistoryHeroFlag(true);
        G_SceneManager.popScene();
    }
    _onAvatarClicked() {
        var heroData = this._heroList[this._pos];
        var isHave = true;
        var list = [];
        table.insert(list, {
            cfg: heroData.getConfig(),
            isHave: isHave
        });
        G_SceneManager.openPopup('prefab/historyhero/PopupHistoryHeroDetail', (p: PopupHistoryHeroDetail) => {
            p.ctor(TypeConvertHelper.TYPE_HISTORY_HERO, null, list, false, 1, heroData.getConfig().id);
            p.openWithAction();
        })
    }
    _updateLeftIconsSelectedState() {
        var curPos = this._pos;
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
    _updateHeroIcons() {
        var iconData = TeamViewHelper.getHeroIconData();
        for (var i = 0; i < this._heroIcons.length; i++) {
            var icon = this._heroIcons[i];
            var data = iconData[i];
            icon.updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel);
        }
    }
    _getEquipedHeroName(pos) {
        if (pos) {
            var curHeroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
            var baseId = curHeroData.getBase_id();
            if (pos == 1) {
                return Lang.get('main_role');
            } else {
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, curHeroData.getBase_id(), null, null, curHeroData.getLimit_level(), curHeroData.getLimit_rtg());
                return heroParam.name;
            }
        }
        return '';
    }
    _getEquipedHeroParam(pos) {
        if (pos) {
            var curHeroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
            var baseId = curHeroData.getBase_id();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, curHeroData.getBase_id(), null, null, curHeroData.getLimit_level(), curHeroData.getLimit_rtg());
            return heroParam;
        }
    }
    _createFakeData() {
        var unit = new HistoryHeroUnit();
        unit.createFakeUnit(HistoryHeroConst.DEFAULT_HISTORY_HERO_ID);
        return unit;
    }
    _createAnimation() {
        G_EffectGfxMgr.applySingleGfx(this._panelLeft, 'smoving_lidaimingjiangui_left', null, null, null);
        G_EffectGfxMgr.applySingleGfx(this._nodeCenter, 'smoving_lidaimingjiangui_lihui', null, null, null);
        G_EffectGfxMgr.applySingleGfx(this._nodeLayer, 'smoving_lidaimingjiangui_right', null, null, null);
        G_EffectGfxMgr.applySingleGfx(this._nodeAttr, 'smoving_lidaimingjiangui_weizi', null, null, null);
        this._nodeEffect.removeAllChildren();
        function effectFunction(effect) {
            if (effect == 'effect_lidaimingjiangui_beijingtihuan') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(new cc.Node(), 'effect_lidaimingjiangui_beijingtihuan');
                return subEffect.node;
            } else {
                return new cc.Node();
            }
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._effectShow.pause();
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_bgruchang', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _updateRedPoint() {
        // var bcannotChange = this._isCanChange(), state;
        // this['_imageChangeRP'].setVisible(bcannotChange);
        // this['_imageUnloadRP'].setVisible(!bcannotChange && state != HistoryHeroConst.TYPE_EQUIP_0);
    }
    _refreshData() {
        this._heroList = G_UserData.getHistoryHero().getOnFormationList();
    }
    _playPrompt(heroUnitData, bUnload) {
        var summary = [];
        var content = Lang.get('historyhero_awaken_success');
        if (heroUnitData.getBreak_through() == 3) {
            content = Lang.get('historyhero_break_success');
        }
        if (bUnload) {
            content = Lang.get('historyhero_unload_success');
        }
        var param = {
            content: content,
            anchorPoint: cc.v2(0.5, 0.5),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_HISTORYHERO }
        };
        table.insert(summary, param);
        var limitLevel = heroUnitData.getBreak_through();
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData.getConfig().id, limitLevel);
        var skillConfig = this.HeroSkillActiveConfig.get(heroStepInfo.skill_id);
        var skill = '[' + (skillConfig.name + (']' + skillConfig.description));
        var skillName = skillConfig.name;
        var color = Colors.colorToNumber(Colors.getColor(2));
        var outlineColor = Colors.colorToNumber(Colors.getColorOutline(2));
        var param1 = {
            content: Lang.get('historyhero_all_skill', {
                skill: skillName,
                color: color,
                outlineColor: outlineColor
            }),
            anchorPoint: cc.v2(0.5, 0.5),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_HISTORYHERO },
            dstPosition: UIHelper.convertSpaceFromNodeToNode(this._nodeDes, this.node),
            finishCallback: function() {
                if (this._heroList[this._pos] && heroUnitData.getId() == this._heroList[this._pos].getId()) {
                    //this._skillDesc.doScaleAnimation();
                    this._skillDesc.string = (skill);
                }
            }.bind(this)
        };
        table.insert(summary, param1);
        this._playAttrPrompt(heroUnitData, summary);
        G_Prompt.showSummary(summary);
    }
    _playAttrPrompt(heroUnitData, summary) {
        for (let i in this._attrDiff) {
            let item = this._attrDiff[i];
            if (item != 0) {
                var diff = item.newValue - item.value;
                var color = diff >= 0 ? Colors.colorToNumber(Colors.getColor(2)) : Colors.colorToNumber(Colors.getColor(6));
                var outlineColor = diff >= 0 ? Colors.colorToNumber(Colors.getColorOutline(2)) : Colors.colorToNumber(Colors.getColorOutline(6));
                var attr = diff >= 0 ? item.name + ('+' + diff) : item.name + diff;
                var param = {
                    content: Lang.get('historyhero_all_attr', {
                        attr: attr,
                        color: color,
                        outlineColor: outlineColor
                    }),
                    anchorPoint: cc.v2(0.5, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_HISTORYHERO },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_labelAttr' + i].node, this.node),
                    finishCallback: function() {
                        if (this._heroList[this._pos] && heroUnitData.getId() == this._heroList[this._pos].getId()) {
                            this['_labelAttr' + i].string = (item.newValue);
                        }
                    }.bind(this)
                };
                table.insert(summary, param);
                this._attrDiff[i].value = this._attrDiff[i].newValue;
            }
        }
        return summary;
    }
    _recordAttr(heroUnitData) {
        var limitLevel = heroUnitData.getBreak_through();
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData.getConfig().id, limitLevel);
        this._attrDiff = {
            "1": {
                name: Lang.get('historyhero_all_atk'),
                value: heroStepInfo.atk,
                newValue: 0,
                curValue: 0
            },
            "2": {
                name: Lang.get('historyhero_all_hp'),
                value: heroStepInfo.hp,
                newValue: 0,
                curValue: 0
            },
            "3": {
                name: Lang.get('historyhero_all_pdef'),
                value: heroStepInfo.pdef,
                newValue: 0,
                curValue: 0
            },
            "4": {
                name: Lang.get('historyhero_all_mdef'),
                value: heroStepInfo.mdef,
                newValue: 0,
                curValue: 0
            }
        }
    }
    _updateAttrDiff(heroUnitData) {
        var limitLevel = heroUnitData.getBreak_through();
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroUnitData.getConfig().id, limitLevel);
        this._attrDiff[1].newValue = heroStepInfo.atk;
        this._attrDiff[2].newValue = heroStepInfo.hp;
        this._attrDiff[3].newValue = heroStepInfo.pdef;
        this._attrDiff[4].newValue = heroStepInfo.mdef;
    }
    _recordTotalPower() {
        var totalPower = G_UserData.getBase().getPower();
        this._diffPower = totalPower - this._lastTotalPower;
        this._lastTotalPower = totalPower;
    }
    _playPowerPromt() {
        var totalPower = G_UserData.getBase().getPower();
        this._fileNodePower.node.active = (true);
        this._fileNodePower.updateUI(totalPower, totalPower - this._lastTotalPower);
        this._fileNodePower.playEffect(false);
    }
    _showBtnAddRedPoint(bShow) {
        this._btnAddRedpoint.node.active = (bShow);
    }
}