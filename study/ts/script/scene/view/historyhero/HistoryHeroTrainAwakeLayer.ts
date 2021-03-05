import { FunctionConst } from "../../../const/FunctionConst";
import { HistoryHeroConst } from "../../../const/HistoryHeroConst";
import { SignalConst } from "../../../const/SignalConst";
import { HistoryHeroUnit } from "../../../data/HistoryHeroUnit";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_SignalManager, G_UserData, G_Prompt, G_EffectGfxMgr, Colors, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import CommonHistoryHeroIcon from "../../../ui/component/CommonHistoryHeroIcon";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import { PopupHistoryHeroUseWeapon } from "../../../ui/PopupHistoryHeroUseWeapon";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

var COLOR_SKILL_INVALID = cc.color(254, 242, 200);
var COLOR_SKILL_VALID = Colors.OBVIOUS_GREEN;
var COLOR_SKILL_OUTLINE = cc.color(163, 101, 30);

@ccclass
export default class HistoryHeroTrainAwakeLayer extends ViewBase {
    @property({ type: CommonButtonSwitchLevel1, visible: true })
    _buttonAwake: CommonButtonSwitchLevel1 = null;
    @property({ type: cc.Button, visible: true })
    _addWeapon: cc.Button = null;
    @property({ type: cc.Node, visible: true })
    _nodeBreak: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _commonItem01: CommonHistoryHeroIcon = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _commonItem02: CommonHistoryHeroIcon = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _commonItem03: CommonHistoryHeroIcon = null;
    @property({ type: CommonIconTemplate, visible: true })
    _commonItem: CommonIconTemplate = null;
    @property({ type: cc.Button, visible: true })
    _btnUnloadWeapon: cc.Button = null;
    @property({ type: cc.Sprite, visible: true })
    _imageAdd1: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageAdd2: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageAdd3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _sword: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _trainTitleLv1: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _trainTitleLv2: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _redPointWeapon: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeSkillTitle: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeSkillDesc: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _fakeSkillNode: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _avalon: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node1: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node2: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _node3: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _fakeAddNode: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffectWeapon: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeAwakeEffect: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect1: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect2: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect3: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeAwakeEffectWeapon: cc.Node = null;

    _textSkillTitle: any;
    _awakeData: any = {};
    _awakeId: number;
    _breakData: {};
    _unitData: any;
    _curAddPos: number = 0;
    _isFakeData: boolean;
    _heroUsedWeapon: any;
    _onStatusChangeCallback: any;
    _awakeSuccess: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _downSuccess: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _resource: any;
    _skillDesc: any;
    _effectShow: import("f:/mingjiangzhuan/main/assets/resources/script/effect/EffectGfxMoving").default;

    onCreate() {
        this._buttonAwake.setString(Lang.get('hero_detail_btn_awake'));
        this._initAddView();
        UIActionHelper.playBlinkEffect(this._addWeapon.node);
        this._buttonAwake.addClickEventListenerEx(handler(this, this._onButtonAwake));
        UIHelper.addEventListener(this.node, this._addWeapon, 'HistoryHeroTrainAwakeLayer', '_onAddWeapon');
        UIHelper.addEventListener(this.node, this._btnUnloadWeapon, 'HistoryHeroTrainAwakeLayer', '_onUnloadWeapon');
    }
    onEnter() {
        this._awakeSuccess = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS, handler(this, this._onEquipSuccess));
        this._downSuccess = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_DOWN_SUCCESS, handler(this, this._onBreakDownSuccess));
    }
    onExit() {
        if (this._awakeSuccess) {
            this._awakeSuccess.remove();
            this._awakeSuccess = null;
        }
        if (this._downSuccess) {
            this._downSuccess.remove();
            this._downSuccess = null;
        }
    }
    setNodeVisible(bVisible) {
        this._resource.setVisible(bVisible);
    }
    setWeaponVisible(bVisible) {
        this._addWeapon.node.active = (bVisible);
    }
    _initAddView() {
        for (let index = 1; index <= 3; index++) {
            UIActionHelper.playBlinkEffect(this['_imageAdd' + index].node);
            this['_imageAdd' + index].node.active = (false);
            UIHelper.addEventListenerToNode(this.node, this['_imageAdd' + index].node, 'HistoryHeroTrainAwakeLayer', '_onClickAdd', index);
        }
    }
    _updateAddVisible() {
        var bCanAwake = false;
        var data = G_UserData.getHistoryHero().getWeaponList();
        for (var key in data) {
            var value = data[key];
            if (value.getId() == this._awakeData.value) {
                bCanAwake = true;
            }
        }
        this['_addWeapon'].node.active = (bCanAwake);
    }
    _updateSquadNum(bSquad) {
    }
    _updateName() {
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(this._unitData.getSystem_id(), 1);
        if (Number(heroStepInfo.type_1) > 0) {
            this._awakeData.type = heroStepInfo.type_1;
            this._awakeData.value = heroStepInfo.value_1;
            this._awakeData.size = heroStepInfo.size_1;
        }
        var limitLevel = this._unitData.getBreak_through();
        var color = this._unitData.getConfig().color;
        var content;
        if (color == HistoryHeroConst.QUALITY_ORANGE) {
            if (limitLevel == 1) {
                content = Lang.get('historyhero_skill_purple_break1', { icon: Path.getQinTombMini('img_qintomb_add02') });
            } else if (limitLevel == 2) {
                content = Lang.get('historyhero_skill_orange_break2', { icon: Path.getQinTombMini('img_qintomb_add02') });
            } else if (limitLevel == 3) {
                content = Lang.get('historyhero_skill_orange_break3', { icon: Path.getQinTombMini('img_btn_close01') });
            }
        } else if (color == HistoryHeroConst.QUALITY_PURPLE) {
            if (limitLevel == 1) {
                content = Lang.get('historyhero_skill_purple_break1', { icon: Path.getQinTombMini('img_qintomb_add02') });
            } else if (limitLevel == 2) {
                content = Lang.get('historyhero_skill_purple_break2', { icon: Path.getQinTombMini('img_btn_close01') });
            }
        }
        var label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(cc.v2(0.5, 1));
        this._nodeSkillTitle.removeAllChildren();
        this._nodeSkillTitle.addChild(label.node);
        if (color == HistoryHeroConst.QUALITY_ORANGE) {
            this._setTitleStyle(limitLevel == 1 && 1 || 2);
        } else if (color == HistoryHeroConst.QUALITY_PURPLE) {
            this._setTitleStyle(1);
        }
    }
    _updateAddAwake(data) {
        if (G_UserData.getHistoryHero().getHeroWeaponUnitData(this._awakeData.value) != null) {
            this['_commonItem'].setIconMask(false);
        } else {
            this['_commonItem'].setIconMask(true);
        }
    }
    updateUI(data, isOnFormation?) {
        if (!data) {
            data = this._createFakeData();
        } else {
            this._isFakeData = false;
        }
        this._unitData = data;
        this._updateFakeDataUI();
        this._updateName();
        this._updateIcon();
        this._updateSkillDesc();
        this._createAnimation(isOnFormation);
        this._updateBtn();
    }
    _updateIcon() {
        var data = this._unitData;
        var limitLevel = data.getBreak_through();
        if (limitLevel < 2) {
            this['_commonItem'].node.active = (false);
            this['_addWeapon'].node.active = (!this._isFakeData);
            var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HISTORY_HERO_WAKEN, data);
            this._redPointWeapon.node.active = (reach);
        } else {
            var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data.getSystem_id(), 1);
            this['_commonItem'].unInitUI();
            this['_commonItem'].initUI(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1);
            var weaponParam = TypeConvertHelper.convert(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1);
            this['_commonItem'].hideBg();
            this['_commonItem'].setIconScale(0.4);
            this['_commonItem'].loadIcon(weaponParam.icon_big);
            this['_commonItem'].setIconMask(false);
            this['_commonItem'].node.active = (true);
            this['_addWeapon'].node.active = (false);
        }
        this._btnUnloadWeapon.node.active = (limitLevel == 2 && this._unitData.getMaterialCount() == 0);
        var heroStepInfo2 = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data.getSystem_id(), 2);
        this._initBreakIcon(heroStepInfo2);
        this._updateBreakIcon(data);
    }
    _initBreakIcon(data) {
        this._breakData = {};
        var count = 0;
        if (Number(data.type_1) > 0) {
            count = count + 1;
            this['_commonItem01'].setRoundType(true);
            this['_commonItem01'].setTag(1);
            this['_commonItem01'].setCloseBtnHandler(handler(this, this._onUnloadHeroTouched));
            this['_commonItem01'].updateUI(data.value_1, data.size_1);
            if (this._breakData[1] == null) {
                this._breakData[1] = {
                    type: data.type_1,
                    value: data.value_1,
                    size: data.size_1,
                    step: data.step_1
                };
            }
        }
        if (Number(data.type_2) > 0) {
            count = count + 1;
            this['_commonItem02'].setRoundType(true);
            this['_commonItem02'].setTag(2);
            this['_commonItem02'].setCloseBtnHandler(handler(this, this._onUnloadHeroTouched));
            this['_commonItem02'].updateUI(data.value_2, data.size_2);
            this._breakData[2] = {
                type: data.type_2,
                value: data.value_2,
                step: data.step_2
            };
        }
        if (Number(data.type_3) > 0) {
            count = count + 1;
            this['_commonItem03'].setRoundType(true);
            this['_commonItem03'].setTag(3);
            this['_commonItem03'].setCloseBtnHandler(handler(this, this._onUnloadHeroTouched));
            this['_commonItem03'].updateUI(data.value_3, data.size_3);
            this._breakData[3] = {
                type: data.type_3,
                value: data.value_3,
                size: data.size_3,
                step: data.step_3
            };
        }
        var tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_1;
        if (count == 1) {
            tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_1;
        } else if (count == 2) {
            tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_2;
        } else if (count == 3) {
            tab = HistoryHeroConst.TYPE_BREAKTHROUGH_POS_3;
        }
        for (var index = 1; index <= count; index++) {
            this['_commonItem0' + index].node.active = (true);
            this['_commonItem0' + index].setRoundIconMask(true);
            this['_commonItem0' + index].setTouchEnabled(false);
            this['_commonItem0' + index].updateUIBreakThrough(this._breakData[index].step);
            this['_imageAdd' + index].node.active = (true);
        }
    }
    _updateBreakIcon(data) {
        if (data.getBreak_through() == 3) {
            for (var idx = 1; idx <= 3; idx++) {
                this['_imageAdd' + idx].node.active = (false);
                this['_commonItem0' + idx].setRoundIconMask(false);
                this['_commonItem0' + idx].showRedPoint(false);
                this['_commonItem0' + idx].showCloseBtn(true);
            }
            return;
        }
        var materialData = data.getMaterials();
        if (typeof (materialData) != 'object') {
            return;
        }
        for (var index in this._breakData) {
            var cfg = this._breakData[index];
            this['_imageAdd' + index].node.active = (true);
            this['_commonItem0' + index].setRoundIconMask(true);
            this['_commonItem0' + index].showCloseBtn(false);
            var reach1 = G_UserData.getHistoryHero().existLevel2Hero(cfg.value);
            var reach2 = G_UserData.getHistoryHero().existLevel1HeroWithWeapon(cfg.value);
            var bExist = data.existMaterial(index);
            this['_commonItem0' + index].showRedPoint(reach1 || reach2);
            for (var k in materialData) {
                var v = materialData[k];
                if (cfg.type == v.type && cfg.value == v.value) {
                    this['_imageAdd' + index].node.active = (false);
                    this['_commonItem0' + index].setRoundIconMask(false);
                    this['_commonItem0' + index].showRedPoint(false);
                    this['_commonItem0' + index].showCloseBtn(true);
                }
            }
        }
    }
    _updateSkillDesc() {
        var limitLevel = this._unitData.getBreak_through();
        var color = this._unitData.getConfig().color;
        var colorSkill = null;
        if (color == HistoryHeroConst.QUALITY_ORANGE) {
            if (limitLevel == 1 || limitLevel == 2) {
                colorSkill = COLOR_SKILL_INVALID;
            } else if (limitLevel == 3) {
                colorSkill = COLOR_SKILL_VALID;
            }
        } else if (color == HistoryHeroConst.QUALITY_PURPLE) {
            if (limitLevel == 1) {
                colorSkill = COLOR_SKILL_INVALID;
            } else if (limitLevel == 2) {
                colorSkill = COLOR_SKILL_VALID;
            }
        }
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(this._unitData.getSystem_id(), limitLevel);
        var skillDes = heroStepInfo.description;
        if (!this._skillDesc) {
            this._skillDesc = UIHelper.createWithTTF('', Path.getCommonFont(), 20);
            this._skillDesc.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            this._skillDesc.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._skillDesc.node.width = 185;
            this._skillDesc.node.setAnchorPoint(cc.v2(0.5, 1));
            this._skillDesc.node.setPosition(this._nodeSkillDesc.getPosition());
            this._fakeSkillNode.addChild(this._skillDesc.node);
        }
        this._skillDesc.node.color = colorSkill;
        this._skillDesc.string = (skillDes);
    }
    _updateBtn() {
        this._buttonAwake.setVisible(false);
    }
    _createFakeData(id?) {
        var unit = new HistoryHeroUnit();
        unit.createFakeUnit(id || HistoryHeroConst.DEFAULT_HISTORY_HERO_ID);
        this._isFakeData = true;
        return unit;
    }
    _onEquipSuccess(id, message) {
        var unitData = G_UserData.getHistoryHero().getHisoricalHeroValueById(this._unitData.getId());
        if (unitData != null) {
            this._unitData = unitData;
            this._isFakeData = false;
            this._updateIcon();
            this._updateBtn();
            var bAttrChanged = true;
            if (unitData.getBreak_through() == 2) {
                if (this._curAddPos == 0) {
                    this._createEffect();
                } else {
                    this._createEffectWithPos(this._curAddPos);
                    bAttrChanged = false;
                }
            } else {
                this._createAwakeEffect();
            }
            this.updateUI(unitData);
            if (this._heroUsedWeapon) {
                G_UserData.getHistoryHero().c2sStarBreakThrough(this._unitData.getId(), this._curAddPos, this._heroUsedWeapon.getId());
                this._heroUsedWeapon = null;
                return;
            }
            if (unitData.getBreak_through() == 2 && unitData.getConfig().color == HistoryHeroConst.QUALITY_ORANGE && unitData.getMaterials().length == 0) {
                this._createUpAnimation();
            }
            this._onStatusChangeCallback(unitData, bAttrChanged, false);
            this._curAddPos = 0;
        }
    }
    _onAddWeapon() {
        var weaponId = this._unitData.getConfig().arm;
        var bHave = this._unitData.haveWeapon();
        if (!bHave) {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
                popup.setTitle(Lang.get('way_type_get'));
                popup.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponId);
                popup.openWithAction();
            })
            return;
        }
        G_UserData.getHistoryHero().c2sStarBreakThrough(this._unitData.getId(), 0, null);
    }
    _onUnloadWeapon() {
        if (this._unitData.getBreak_through() != 2) {
            return;
        }
        G_UserData.getHistoryHero().c2sStarBreakDown(this._unitData.getId(), 0);
    }
    _onBreakDownSuccess() {
        var unitData = G_UserData.getHistoryHero().getHisoricalHeroValueById(this._unitData.getId());
        if (unitData != null) {
            this._unitData = unitData;
            this._updateIcon();
            this._updateBtn();
            var bAttrChanged = true;
            var materialCount = unitData.getMaterialCount();
            if (unitData.getBreak_through() == 2) {
                if (materialCount != 2) {
                    bAttrChanged = false;
                }
            } else {
            }
            this.updateUI(unitData);
            if (unitData.getBreak_through() == 1 && unitData.getConfig().color == HistoryHeroConst.QUALITY_ORANGE && unitData.getMaterials().length == 0) {
                this._createOrangeOpen2CloseAnimation();
            }
            this._onStatusChangeCallback(unitData, bAttrChanged, true);
            this._curAddPos = 0;
        }
    }
    _onClickAdd(evt, curAddIndex) {
        if (typeof (curAddIndex) != 'number') {
            return;
        }
        if (this._unitData.getBreak_through() < 2) {
            G_Prompt.showTip(Lang.get('historyhero_awake_first'));
            return;
        }
        function getWakedHeroList(notInFormationList) {
            var wakedList = [];
            var unwakedList = [];
            for (var k in notInFormationList) {
                var v = notInFormationList[k];
                if (v.getBreak_through() == 2) {
                    table.insert(wakedList, v);
                }
                if (v.getBreak_through() == 1) {
                    table.insert(unwakedList, v);
                }
            }
            return [
                wakedList,
                unwakedList
            ];
        }
        var breakData = this._breakData[curAddIndex];
        var notInFormationList = G_UserData.getHistoryHero().getNotInFormationList(breakData.value);
        if (notInFormationList.length > 0) {
            var [wakedList, unwakedList] = getWakedHeroList(notInFormationList);
            this._curAddPos = curAddIndex;
            if (wakedList.length > 0) {
                this._enoughProc(wakedList, curAddIndex);
            } else {
                this._notEnoughProc(unwakedList, notInFormationList.length, curAddIndex);
            }
        } else {
            this._noHistoryHeroProc(breakData.value);
        }
    }
    _onButtonAwake() {
        if (this._unitData.getMaterials().length < 3) {
            G_Prompt.showTip(Lang.get('historyhero_material_not_enough'));
            return;
        }
        G_UserData.getHistoryHero().c2sStarBreakThrough(this._unitData.getId(), 0, 0);
    }
    _onUnloadHeroTouched(commonHistoryHeroIcon) {
        if (this._unitData.getBreak_through() == 1) {
            return;
        }
        var tag = commonHistoryHeroIcon.getTag();
        G_UserData.getHistoryHero().c2sStarBreakDown(this._unitData.getId(), commonHistoryHeroIcon.getTag());
    }
    _enoughProc(wakedList, curAddIndex) {
        G_SceneManager.showDialog('prefab/common/PopupHistoryHeroUseWeapon', (popupUseWeapon: PopupHistoryHeroUseWeapon) => {
            popupUseWeapon.ctor(handler(this, this._onPopupHistoryHeroUseWeapon2));
            popupUseWeapon.setType(PopupHistoryHeroUseWeapon.TYPE_NOT_NEED_WEAPON);
            popupUseWeapon.openWithAction();
            popupUseWeapon.updateUI(wakedList);
        })
    }
    _onPopupHistoryHeroUseWeapon2(data) {
        G_UserData.getHistoryHero().c2sStarBreakThrough(this._unitData.getId(), this._curAddPos, data.getId());
    }
    _notEnoughProc(unwakedList, num, curAddIndex) {
        G_SceneManager.showDialog('prefab/common/PopupHistoryHeroUseWeapon', (popupUseWeapon: PopupHistoryHeroUseWeapon) => {
            popupUseWeapon.ctor(handler(this, this._onPopupHistoryHeroUseWeapon));
            popupUseWeapon.openWithAction();
            popupUseWeapon.updateUI(unwakedList);
        })
    }
    _onPopupHistoryHeroUseWeapon(data) {
        this._heroUsedWeapon = data;
        G_UserData.getHistoryHero().c2sStarBreakThrough(this._heroUsedWeapon.getId(), 0, null);
    }
    _noHistoryHeroProc(baseId) {
        G_SceneManager.showDialog('prefab/common/PopupHistoryHeroUseWeapon', (popupUseWeapon: PopupHistoryHeroUseWeapon) => {
            popupUseWeapon.ctor();
            var data = this._createFakeData(baseId);
            popupUseWeapon.openWithAction();
            popupUseWeapon.updateUI([data], 1, true);
        })
    }
    _createAnimation(isOnFormation) {
        this._removeAwakeEffectAvalon();
        if (isOnFormation && this._unitData.getConfig().color == HistoryHeroConst.QUALITY_PURPLE) {
            this._createOpen2CloseAnimation();
            return;
        }
        if (this._isFakeData) {
            this._createNoHeroOpenAnimation();
            return;
        }
        if (this._unitData.getBreak_through() == 1) {
            this._createCloseAnimation();
        } else if (this._unitData.getBreak_through() == 3) {
            this._createOpenAnimation();
            this._createAwakeEffectAvalon();
        } else if (this._unitData.getBreak_through() == 2) {
            if (this._unitData.getConfig().color == HistoryHeroConst.QUALITY_PURPLE) {
                this._createCloseAnimation();
            } else if (this._unitData.getConfig().color == HistoryHeroConst.QUALITY_ORANGE) {
                this._createOpenAnimation();
            }
        }
    }
    _createUpAnimation() {
        this._nodeEffect.removeAllChildren();
        this._avalon.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close);
        this._sword.node.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close);
        this._node1.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon1.close);
        this._node2.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon2.close);
        this._node3.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon3.close);
        function effectFunction(effect) {
            var node = new cc.Node();
            if (effect == 'effect_lidaimingjiang_ui_faguang_copy3') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy2') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_guangdian_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_guangdian');
            }
            return node;
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
            } else if (event == 'start') {
                this._avalon.active = (true);
                this._sword.active = (true);
                this._showIcon(true);
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaodong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jiandong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node1, 'smoving_lidaimingjiang_ui_icon1dong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node2, 'smoving_lidaimingjiang_ui_icon2dong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node3, 'smoving_lidaimingjiang_ui_icon3dong', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_up', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createOpenAnimation() {
        this._nodeEffect.removeAllChildren();
        this._avalon.active = (true);
        this._sword.node.active = (true);
        this._showIcon(true);
        this._avalon.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.open);
        this._sword.node.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.open);
        this._node1.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon1.open);
        this._node2.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon2.open);
        this._node3.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.icon3.open);
        function effectFunction(effect) {
            var node = new cc.Node();
            if (effect == 'effect_lidaimingjiang_ui_faguang_copy3') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy2') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_guangdian_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_guangdian');
            } else if (effect == 'effect_lidaimingjiang_ui_guangdian_copy2') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_guangdian');
            }
            return node;
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaobudong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jianbudong', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_open', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createCloseAnimation() {
        this._nodeEffect.removeAllChildren();
        this._avalon.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close);
        this._sword.node.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close);
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._avalon.active = (true);
                this._sword.node.active = (true);
                this._showIcon(false);
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaobudong', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jianbudong', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_clsoe', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createOpen2CloseAnimation() {
        this._nodeEffect.removeAllChildren();
        this._avalon.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close);
        this._sword.node.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close);
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'start') {
                this._avalon.active = (true);
                this._sword.node.active = (true);
                this._showIcon(false);
                this._updateFakeDataUI();
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaoshou', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jianshou', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_shoujian2', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createOrangeOpen2CloseAnimation() {
        this._nodeEffect.removeAllChildren();
        function effectFunction(effect) {
            var node = new cc.Node();
            if (effect == 'effect_lidaimingjiang_ui_faguang_copy3') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy2') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_faguang_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_faguang');
            } else if (effect == 'effect_lidaimingjiang_ui_guangdian_copy1') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_guangdian');
            } else if (effect == 'effect_lidaimingjiang_ui_guangdian_copy2') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(node, 'effect_lidaimingjiang_ui_guangdian');
            }
            return node;
        }
        var eventFunction = function (event) {
            if (event == 'start') {
                this._avalon.active = (true);
                this._sword.node.active = (true);
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaoshou', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jianshou', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node1, 'smoving_lidaimingjiang_ui_icon1shou', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node2, 'smoving_lidaimingjiang_ui_icon2shou', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._node3, 'smoving_lidaimingjiang_ui_icon3shou', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_shoujian', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createNoHeroOpenAnimation() {
        this._nodeEffect.removeAllChildren();
        this._avalon.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.avalon.close);
        this._sword.node.setPosition(HistoryHeroConst.TYPE_BREAKTHROUGH_POS.sword.close);
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'start') {
                this._avalon.active = (true);
                this._sword.node.active = (true);
                this._showIcon(false);
                this._updateFakeDataUI();
                G_EffectGfxMgr.applySingleGfx(this._avalon, 'smoving_lidaimingjiang_ui_jianqiaozhangkai', null, null, null);
                G_EffectGfxMgr.applySingleGfx(this._sword.node, 'smoving_lidaimingjiang_ui_jianzhangkai', null, null, null);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_lidaimingjiang_ui_zhangkai', effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _showIcon(bShow) {
        this._node1.active = (bShow);
        this._node2.active = (bShow);
        this._node3.active = (bShow);
    }
    _setTitleStyle(style) {
        if (style == 1) {
            this._trainTitleLv1.node.active = (true);
            this._trainTitleLv2.node.active = (false);
        } else {
            this._trainTitleLv1.node.active = (false);
            this._trainTitleLv2.node.active = (true);
        }
    }
    _createEffect() {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectWeapon, 'effect_jinnang_chengsejihuo');
    }
    _createEffectWithPos(pos) {
        G_EffectGfxMgr.createPlayGfx(this['_nodeEffect' + pos], 'effect_jinnang_chengsejihuo');
    }
    _createAwakeEffect() {
        G_EffectGfxMgr.createPlayGfx(this._nodeAwakeEffect, 'effect_lidaimingjiang_ui_juexing');
    }
    _createAwakeEffectAvalon() {
        G_EffectGfxMgr.createPlayGfx(this._nodeAwakeEffectWeapon, 'effect_lidaimingjiang_ui_juexingwuqi');
    }
    _removeAwakeEffectAvalon() {
        this['_nodeAwakeEffectWeapon'].removeAllChildren();
    }
    _updateFakeDataUI() {
        this._fakeAddNode.active = (!this._isFakeData);
        this._fakeSkillNode.active = (!this._isFakeData);
    }
    setStatusChangeCallback(cb) {
        this._onStatusChangeCallback = cb;
    }
}