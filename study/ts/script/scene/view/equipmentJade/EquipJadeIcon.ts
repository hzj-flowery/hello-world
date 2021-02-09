import { ConfigNameConst } from "../../../const/ConfigNameConst";
import EquipConst from "../../../const/EquipConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonJadeAvatar from "../../../ui/component/CommonJadeAvatar";
import PopupChangeJade from "../../../ui/PopupChangeJade";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { EquipJadeHelper } from "../equipmentJade/EquipJadeHelper";
import { EquipTrainHelper } from "../equipTrain/EquipTrainHelper";
import { TreasureTrainHelper } from "../treasureTrain/TreasureTrainHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import TreasureConst from "../../../const/TreasureConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipJadeIcon extends cc.Component {

    private static EFFECTS = {
        [4]: "effect_jinnang_zisejihuo",
        [5]: "effect_jinnang_chengsejihuo",
        [6]: "effect_jinnang_hongsejihuo"
    }

    private static EMPTY_FRAME = {
        [1]: "img_jade_frame05",
        [2]: "img_jade_frame04",
        [3]: "img_jade_frame00",
        [4]: "img_jade_frame01",
        [5]: "img_jade_frame02",
        [6]: "img_jade_frame03"
    }
    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageEmpty: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDesBg: cc.Sprite = null;

    @property({
        type: CommonJadeAvatar,
        visible: true
    })
    _fileNodeCommon: CommonJadeAvatar = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRich: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _jadeName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _jadeTip: cc.Label = null;
    _slot: any;
    _lock: boolean;
    _equipId: any;
    _jadeId: any;
    _richDes: any;
    _treasureId: any;
    _type: any;

    onLoad() {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "EquipJadeIcon";// 这个是代码文件名
        clickEventHandler.handler = "_onPanelTouch";
        var button = this._panelTouch.addComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    }

    init(slot, type) {
        this._slot = slot;
        this._treasureId = null;
        this._type = type || FunctionConst.FUNC_EQUIP_TRAIN_TYPE3;
        this._initUI();
    }
    _initUI() {
        this._resetUI();
        var emptyres = this._slot > 1 && 'img_jadebg01' || 'img_jadebg02';
        UIHelper.loadTexture(this._imageEmpty, Path.getJadeImg(emptyres));
    }
    _resetUI() {
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
        this._nodeRich.active = (false);
        this._imageEmpty.node.active = (false);
        this._jadeName.node.active = (false);
        this._imageLock.node.active = (false);
        this._jadeTip.node.active = (false);
    }
    lockIcon() {
        this._resetUI();
        this._lock = true;
        this._imageLock.node.active = (true);
        this._jadeTip.node.active = (true);
        this._imageEmpty.node.active = (true);
        var desc1 = '';
        var desc2 = '';
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            desc1 = Lang.get('lang_jade_open_des1');
            desc2 = Lang.get('lang_jade_open_des2');
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            desc1 = Lang.get('lang_jade_open_treasure_des1');
            desc2 = Lang.get('lang_jade_open_treasure_des2');
        }
        if (this._slot == 1) {
            this._jadeTip.string = (desc2);
        } else {
            this._jadeTip.string = (desc1);
        }
        if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            if (this._slot == 2) {
                this._jadeTip.string = (desc1);
            } else {
                this._jadeTip.string = (desc2);
            }
        }
        this._jadeTip.node.color = (Colors.DARK_BG_RED);
        this._jadeTip.fontSize = (18);
    }
    unlockIcon() {
        this._lock = false;
        this._imageLock.node.active = (false);
        this._jadeTip.node.active = (false);
    }
    updateIcon(equipId, jadeId) {
        this._jadeId = jadeId;
        this.unlockIcon();
        var isHave = false, isBetter = false;
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            this._equipId = equipId;
            var [isHave, isBetter] = EquipTrainHelper.haveBetterAndCanEquipJade(equipId, jadeId, this._slot);
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            this._treasureId = equipId;
            var [isHave, isBetter] = TreasureTrainHelper.haveBetterAndCanEquipJade(equipId, jadeId, this._slot);
        }

        if (jadeId == 0) {
            this._nodeRich.active = (false);
            this._jadeName.node.active = (false);
            this._fileNodeCommon.node.active = (false);
            this._imageEmpty.node.active = (true);
            this.showAddSprite(true);
            this.showRedPoint(isHave);
        } else {
            this.showAddSprite(false);
            this._imageEmpty.node.active = (false);
            this._fileNodeCommon.node.active = (true);
            this._nodeRich.active = (true);
            this._jadeName.node.active = (true);
            this.showRedPoint(isBetter);
            var jadeUnitData = G_UserData.getJade().getJadeDataById(jadeId);
            var heroBaseId = jadeUnitData.getEquipHeroBaseId()[1];
            var isSuitable = jadeUnitData.isSuitableHero(heroBaseId);
            this._fileNodeCommon.updateUI(jadeUnitData.getSys_id(), !isSuitable);
            var config = jadeUnitData.getConfig();
            this._createDesRichText(config, isSuitable);
            this._jadeName.fontSize = (22 - 2);
            this._jadeName.string = (config.name);
            this._jadeName.node.color = (Colors.getColor(config.color));
            UIHelper.enableOutline(this._jadeName, Colors.getColorOutline(config.color), 2);
        }
    }
    onlyShow(jadeSysId, isTe) {
        this._resetUI();
        if (!jadeSysId) {
            return;
        }
        var config = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(jadeSysId);
        this._imageEmpty.node.active = (true);
        this._jadeName.node.active = (true);
        this._jadeName.fontSize = (18);
        if (config) {
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(jadeSysId, true);
            this._jadeName.string = (config.name);
            this._jadeName.node.color = (Colors.getColor(config.color));
            if (config.property == 2) {
                UIHelper.loadTexture(this._imageEmpty, Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[config.color]));
            } else {
                UIHelper.loadTexture(this._imageEmpty, Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[2]));
            }
        } else {
            this._jadeName.string = (Lang.get('no_inject'));
            this._jadeName.node.color = (Colors.NO_INJECT_COLOR);
            if (isTe) {
                UIHelper.loadTexture(this._imageEmpty, Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[1]));
            } else {
                UIHelper.loadTexture(this._imageEmpty, Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[3]));
            }
        }
    }
    _createDesRichText(config, isSuitable) {
        if (this._richDes) {
            this._richDes.destroy();
            this._richDes = null;
        }
        var [name, value] = this._constructNameValue(config, isSuitable);
        var richText = Lang.get('lang_jade_des_value', {
            name: name,
            value: value
        });
        var des = RichTextExtend.createWithContent(richText);
        //des.ignoreContentAdaptWithSize(false);
        //   des.setContentSize(cc.size(220, 0));
        // des.formatText();
        des.node.width = 220;
        this._nodeRich.addChild(des.node);
        this._richDes = des.node;
        //  des.getComponent(cc.RichText)['_updateRenderData'](true);
        var virtualContentSize = des.node.getContentSize();
        this._richDes.setPosition(0, -virtualContentSize.height * 0.5);
        var size = this._imageDesBg.node.getContentSize();
        this._imageDesBg.node.setContentSize(size.width, virtualContentSize.height + 10);
    }
    _constructNameValue(config, isSuitable) {
        var name = '', value = '';
        if (!isSuitable) {
            name = Lang.get('jade_not_effective');
            return [
                name,
                value
            ];
        }
        if (config.property == 1) {
            name = config.profile;
        } else {
            var arr = TextHelper.getAttrBasicText(config.type, EquipJadeHelper.getRealAttrValue(config, G_UserData.getBase().getLevel()));
            name = arr[0], value = arr[1];
            value = '  +' + value;
        }
        return [
            name,
            value
        ];
    }
    _onPanelTouch() {
        var unitData = null;
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            unitData = G_UserData.getEquipment().getEquipmentDataWithId(this._equipId);
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            unitData = G_UserData.getTreasure().getTreasureDataWithId(this._treasureId);
        }
        if (!this._preCheck(unitData)) {
            return;
        }

        var jadeId = unitData.getJades()[this._slot - 1];
        var jadeData = G_UserData.getJade().getJadeDataById(jadeId);
        var dataList = EquipJadeHelper.getEquipJadeListByWear(this._slot, jadeData, unitData, true, this._type);

        if (jadeData) {
            PopupChangeJade.getIns(PopupChangeJade, (p: PopupChangeJade) => {
                p.ctor(Lang.get('equipment_choose_jade_title2'), this._slot, jadeData, unitData, this._imageRedPoint.node.active, handler(this, this._onChooseJade), this._type);
                p.openWithAction();
            })
        } else {
            if (dataList.length > 0) {
                EquipJadeHelper.popupChooseJadeStone(this._slot, jadeData, unitData, handler(this, this._onChooseJade), null, this._type);
            } else {
                var config = EquipJadeHelper.getMinSuitableJade(unitData.getBase_id(), this._slot > 1 ? 2 : 1, this._type);
                UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_JADE_STONE, config.id, Lang.get('way_type_get'));
            }
        }
    }
    _preCheck(unitData) {
        if (this._lock) {
            if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
                if (LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)[0]) {
                    G_SignalManager.dispatch(SignalConst.EVENT_EQUIP_TRAIN_CHANGE_VIEW, EquipConst.EQUIP_TRAIN_LIMIT);
                } else {
                    G_Prompt.showTip(Lang.get('common_tip_function_not_open'));
                }
            } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
                if (LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4)[0]) {
                    G_SignalManager.dispatch(SignalConst.EVENT_TREASURE_TRAIN_CHANGE_VIEW, TreasureConst.TREASURE_TRAIN_LIMIT);
                } else {
                    G_Prompt.showTip(Lang.get('common_tip_function_not_open'));
                }
            }
            return false;
        }
        var isOpen = false, des = null, info = null;
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            [isOpen, des, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            [isOpen, des, info] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3), des = null, info = null;
        }
        if (!isOpen) {
            G_Prompt.showTip(des);
            return false;
        }
        if (!unitData.isInBattle()) {
            G_Prompt.showTip(Lang.get('not_in_battle_can_not_inject_jade'));
            return false;
        }
        return true;
    }
    _onChooseJade(pos, jadeId) {
        console.warn('EquipTrainJadeLayer:_changeJade');
        var unitData = null;
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            unitData = G_UserData.getEquipment().getEquipmentDataWithId(this._equipId);
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            unitData = G_UserData.getTreasure().getTreasureDataWithId(this._treasureId);
        }
        var [isSame, slots] = unitData.isHaveTwoSameJade(jadeId);
        if (isSame && !slots[pos]) {
            G_Prompt.showTip(Lang.get('not_inject_same_jade_more_two'));
            return;
        }
        if (this._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) {
            G_UserData.getJade().c2sJadeEquip(jadeId, this._equipId, pos - 1);
        } else if (this._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) {
            G_UserData.getJade().c2sJadeTreasure(jadeId, this._treasureId, pos - 1);
        }
    }
    showRedPoint(visible) {
        this._imageRedPoint.node.active = (visible);
    }
    haveRedPoint() {
        return this._imageRedPoint.node.active;
    }
    showUpArrow(visible) {
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
    showAddSprite(visible) {
        this._spriteAdd.node.active = (visible);
        if (visible) {
            UIActionHelper.playBlinkEffect(this._spriteAdd.node);
        }
    }
    showEffect() {
        this._clearEffect();
        //   this._fileNodeCommon.showIconEffect();
    }
    _clearEffect() {
        //  this._fileNodeCommon.removeLightEffect();
    }
    setPosition(pos) {
        this.node.setPosition(pos);
    }
    setVisible(visible) {
        this.node.active = (visible);
    }
    playEquipEffect() {
        var jadeUnitData = G_UserData.getJade().getJadeDataById(this._jadeId);
        if (jadeUnitData) {
            var cfg = jadeUnitData.getConfig();
            this._nodeEffectDown.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffectDown, EquipJadeIcon.EFFECTS[cfg.color]);
        }
    }
    setTouchEnabled(b) {
        var btn = this._panelTouch.getComponent(cc.Button);
        if (btn) {
            btn.enabled = b;
        }
    }
}