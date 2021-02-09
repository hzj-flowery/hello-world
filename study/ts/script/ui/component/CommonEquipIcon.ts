import { ConfigNameConst } from "../../const/ConfigNameConst";
import EquipConst from "../../const/EquipConst";
import EffectGfxNode from "../../effect/EffectGfxNode";
import { Colors, G_ConfigLoader, G_EffectGfxMgr, G_SceneManager } from "../../init";
import PopupEquipDetail from "../../scene/view/equipmentDetail/PopupEquipDetail";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import { EquipDataHelper } from "../../utils/data/EquipDataHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import PopupBase from "../PopupBase";
import CommonIconBase from "./CommonIconBase";
import CommonUI from "./CommonUI";
import { ComponentIconHelper } from "./ComponentIconHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonEquipIcon extends CommonIconBase {



    private static R_LEVEL_NORMAL_POSY = 20; //-- 精炼等级正常时y坐标
    private static R_LEVEL_JADE_POSY = 26; //-- 精炼等级有玉石槽y坐标

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
    _nodeJadeSlot: cc.Node = null;


    _equipId;
    _value;
    _textRlevel: cc.Label;

    _effect1: EffectGfxNode;
    _effect2: EffectGfxNode;

    _textItemTopNum;
    _textLevel: cc.Label;
    _imageLevel: cc.Sprite;

    onLoad() {
        if (this._type == null) {
            this._type = TypeConvertHelper.TYPE_EQUIPMENT
        }
        super.onLoad();
    }

    setId(equipId) {
        this._equipId = equipId;
    }
    updateUI(value, size?) {
        if (this._type == null) {
            this._type = TypeConvertHelper.TYPE_EQUIPMENT
        }
        var itemParams = super.updateUI(value, size);
        this._value = value;
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        if (this._textRlevel) {
            this._textRlevel.node.y = -(CommonEquipIcon.R_LEVEL_NORMAL_POSY);
        }
        this.showIconEffect();
    }
    setTopNum(size) {
        if (this._textItemTopNum == null) {
            var params = {
                name: '_textItemTopNum',
                text: 'x' + '0',
                fontSize: 18,
                color: Colors.WHITE_DEFAULT,
                outlineColor: Colors.DEFAULT_OUTLINE_COLOR
            };
            ComponentIconHelper._setPostion(params, 'leftTop');
            var uiWidget = UIHelper.createLabel(params);
            this.appendUI(uiWidget);
            this._textItemTopNum = uiWidget;
        }
        this._textItemTopNum.setString('' + size);
        this._textItemTopNum.setVisible(size > 0);
    }
    setLevel(level) {
        if (this._textLevel == null) {
            var params = {
                name: '_textLevel',
                text: '0',
                fontSize: 20,
                color: Colors.COLOR_QUALITY[0],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[0]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(cc.v2(0.5, 0.5));
            label.setPosition(cc.v2(18, -10));
            this._textLevel = label.getComponent(cc.Label);
        }
        var equipParam = this.getItemParams();
        if (this._imageLevel == null) {
            var params2 = {
                name: '_imageLevel',
                texture: Path.getUICommonFrame('img_iconsmithingbg_0' + equipParam.color)
            };
            var imageBg = UIHelper.createImage(params2);
            imageBg.addChild(this._textLevel.node);
            imageBg.setAnchorPoint(cc.v2(0, 1));
            imageBg.setPosition(cc.v2(-95 / 2, 95 / 2));
            this._imageLevel = imageBg.getComponent(cc.Sprite);
            this.appendUI(imageBg);
        }
        this._textLevel.string = (level);
        UIHelper.enableOutline(this._textLevel, Colors.COLOR_QUALITY_OUTLINE[equipParam.color-1]);
        this._imageLevel.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame('img_iconsmithingbg_0' + equipParam.color));
        this._imageLevel.node.active = (level > 0);
    }
    setRlevel(rLevel) {
        if (this._textRlevel == null) {
            var params = {
                name: '_textRlevel',
                text: '+' + '0',
                fontSize: 20,
                color: Colors.COLOR_QUALITY[1],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[1]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(cc.v2(0.5, 0.5));
            label.setPosition(cc.v2(0, -CommonEquipIcon.R_LEVEL_NORMAL_POSY));
            this.appendUI(label);
            this._textRlevel = label.getComponent(cc.Label);
        }
        this._textRlevel.string = ('+' + rLevel);
        this._textRlevel.node.active = (rLevel > 0);
    }

    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            if (this._equipId) {
                G_SceneManager.showScene('equipmentDetail', this._equipId, EquipConst.EQUIP_RANGE_TYPE_1);
            } else {
                // var PopupEquipDetail = new (require('PopupEquipDetail'))(TypeConvertHelper.TYPE_EQUIPMENT, this._itemParams.cfg.id);
                //     PopupEquipDetail.openWithAction();
                var cfgid = this._itemParams.cfg.id;
                PopupBase.loadCommonPrefab('PopupEquipDetail',(popup:PopupEquipDetail)=>{
                    popup.ctor(TypeConvertHelper.TYPE_EQUIPMENT, cfgid);
                    popup.openWithAction();
                });
            }
        }
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.node.runAction(cc.destroySelf(true));
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.node.runAction(cc.destroySelf(true));
            this._effect2 = null;
        }
        this._nodeEffectUp && this._nodeEffectUp.removeAllChildren();
        this._nodeEffectDown && this._nodeEffectDown.removeAllChildren();
    }
    showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams == null) {
            return;
        }
        var baseId = this._itemParams.cfg.id;
        var effects = EquipDataHelper.getEquipEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (this._nodeEffectUp == null) {
            this._nodeEffectUp = this.node.getChildByName('NodeEffectUp');
        }
        if (this._nodeEffectDown == null) {
            this._nodeEffectDown = this.node.getChildByName('NodeEffectDown');
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName);
        }
        if (effects.length == 2) {
            var effectName1 = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName1);
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2);
        }
    }
    updateJadeSlot(jadeDatas, heroBaseId) {
        var nodeJadeSlot = this.node.getChildByName('NodeJadeSlot');
        if (!nodeJadeSlot) {
            return false;
        }
        nodeJadeSlot.active = (false);
        if (!jadeDatas) {
            return false;
        }
        var config = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(this._value);
        if (config && config.suit_id > 0) {
            nodeJadeSlot.active = (true);
            if (this._textRlevel) {
                this._textRlevel.node.y = -(CommonEquipIcon.R_LEVEL_JADE_POSY);
            }
            var imageSlot = nodeJadeSlot.getChildByName('imageSlot');
            if (!imageSlot) {
                imageSlot = UIHelper.createImage({
                    name: 'imageSlot',
                    adaptWithSize: true
                });
                nodeJadeSlot.addChild(imageSlot);
            }
            UIHelper.loadTexture(imageSlot.getComponent(cc.Sprite), Path.getJadeImg(EquipConst.EQUIPMENT_JADE_SLOT_BG[config.suit_id]));
            imageSlot.removeAllChildren();
            this._addJadeSlot(jadeDatas, imageSlot, heroBaseId, config);
            return true;
        }
        return false;
    }
    _addJadeSlot(jadeDatas, imageSlot, heroBaseId, config) {
        for (var i in jadeDatas) {
            var v = jadeDatas[i];
            if (jadeDatas[i] > 0) {
                var jconfig = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(jadeDatas[i]);
                if (jconfig) {
                    var texture = Path.getJadeImg('img_jade_' + jconfig.color);
                    var isActive = EquipJadeHelper.isSuitableHero(jconfig, heroBaseId);
                    if (!isActive) {
                        texture = Path.getJadeImg('img_jade_7');
                    }
                    var slot = UIHelper.createImage({
                        name: 'slot' + i,
                        texture: texture,
                        adaptWithSize: true
                    });
                    slot.setPosition(EquipConst.EQUIPMENT_JADE_SLOT_POS[config.suit_id][parseFloat(i) + 1]);
                    imageSlot.addChild(slot);
                }
            }
        }
    }

}