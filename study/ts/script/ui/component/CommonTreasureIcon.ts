import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Colors, G_ConfigLoader } from "../../init";
import UIHelper from "../../utils/UIHelper";
import CommonIconBase from "./CommonIconBase";
import { ComponentIconHelper } from "./ComponentIconHelper";
import { Path } from "../../utils/Path";
import CommonUI from "./CommonUI";
import PopupItemGuider from "../PopupItemGuider";
import { Lang } from "../../lang/Lang";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import PopupTreasureDetail from "../../scene/view/treasureDetail/PopupTreasureDetail";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { EquipJadeHelper } from "../../scene/view/equipmentJade/EquipJadeHelper";
import TreasureConst from "../../const/TreasureConst";
import { stringUtil } from "../../utils/StringUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTreasureIcon extends CommonIconBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeJadeSlot: cc.Node = null;


    public static R_LEVEL_NORMAL_POSY = 20;
    public static R_LEVEL_JADE_POSY = 26;

    private _textItemTopNum: cc.Label;
    private _textRlevel: cc.Label;
    private _textLevel: cc.Label;
    private _imageLevel: cc.Sprite;
    private _treasureId;
    _value: any;

    onLoad(): void {
        super.onLoad();
        this._textItemTopNum = null;
        this._type = TypeConvertHelper.TYPE_TREASURE;
        this._treasureId = null;
    }
    _init() {
        //super._init();
        this.setTouchEnabled(false);
    }
    setId(id) {
        this._treasureId = id;
    }
    updateUI(value, size?, rank?) {
        var itemParams = super.updateUI(value, size, rank);
        this._value = value;
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        if (this._textRlevel) {
            var widget = this._textRlevel.node.getComponent(cc.Widget);
            if(widget)
            {
                widget.bottom = (CommonTreasureIcon.R_LEVEL_NORMAL_POSY);
            }
        }
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
            this._textItemTopNum = uiWidget.getComponent(cc.Label);
        }
        this._textItemTopNum.string = ('' + size);
        this._textItemTopNum.node.active = (size > 0);
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
            label.setAnchorPoint(new cc.Vec2(0.5, 0.5));
            label.setPosition(new cc.Vec2(18, -10));
            this._textLevel = label.getComponent(cc.Label);
        }
        var itemParam = this.getItemParams();
        if (this._imageLevel == null) {
            var params1 = {
                name: '_imageLevel',
                texture: Path.getUICommonFrame('img_iconsmithingbg_0' + itemParam.color)
            };
            var imageBg = UIHelper.createImage(params1);
            imageBg.addChild(this._textLevel.node);
            imageBg.setAnchorPoint(new cc.Vec2(0, 1));
            imageBg.setPosition(cc.v2(-95 / 2, 95 / 2));
            this._imageLevel = imageBg.getComponent(cc.Sprite);
            this.appendUI(imageBg);
        }
        this._textLevel.string = (level);
        UIHelper.enableOutline(this._textLevel, Colors.COLOR_QUALITY_OUTLINE[itemParam.color - 1], 2)
        this._imageLevel.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame('img_iconsmithingbg_0' + itemParam.color));
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
            label.setAnchorPoint(new cc.Vec2(0.5, 0.5));
            //label.setPosition(new cc.Vec2(0,-20));
            var widget = label.addComponent(cc.Widget);
            widget.isAlignBottom = true;
            widget.bottom = 20;
            widget.isAlignHorizontalCenter = true;
            widget.horizontalCenter = 0;
            widget.alignMode = cc.Widget.AlignMode.ALWAYS;
            this.appendUI(label);
            this._textRlevel = label.getComponent(cc.Label);
        }
        this._textRlevel.string = ('+' + rLevel);
        this._textRlevel.node.active = (rLevel > 0);
    }
    _onTouchCallBack(sender: cc.Touch) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._callback) {
                this._callback(sender, this._itemParams);
            } else {
                if (this._itemParams.cfg.treasure_type == 0) {
                    UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                        popupItemGuider.updateUI(TypeConvertHelper.TYPE_TREASURE, this._itemParams.cfg.id);
                        popupItemGuider.setTitle(Lang.get('way_type_get'));
                    }.bind(this))

                } else {
                    // var PopupTreasureDetail = require('PopupTreasureDetail').new(TypeConvertHelper.TYPE_TREASURE, this._itemParams.cfg.id);
                    // PopupTreasureDetail.openWithAction();
                    PopupTreasureDetail.loadCommonPrefab("PopupTreasureDetail", (popup: PopupTreasureDetail) => {
                        popup.initData(TypeConvertHelper.TYPE_TREASURE, this._itemParams.cfg.id);
                        popup.openWithAction();
                    })
                }
            }
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
        var config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(this._value);
        function canInjectJade(baseId) {
            var config = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(baseId);
            var jadeList = stringUtil.split(config.inlay_type, '|');
            for (var k in jadeList) {
                var v = jadeList[k];
                if (v != '0') {
                    return true;
                }
            }
            return false;
        }
        if (config && canInjectJade(this._value)) {
            nodeJadeSlot.active = (true);
            if (this._textRlevel) {
                this._textRlevel.node.y = (CommonTreasureIcon.R_LEVEL_JADE_POSY);
            }
            var imageSlot = nodeJadeSlot.getChildByName('imageSlot');
            if (!imageSlot) {
                imageSlot = UIHelper.createImage({
                    name: 'imageSlot',
                    adaptWithSize: true
                });
                nodeJadeSlot.addChild(imageSlot);
            }
            UIHelper.loadTexture(imageSlot.getComponent(cc.Sprite), Path.getJadeImg(TreasureConst.TREASURE_JADE_SLOT_BG[config.color]));
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
                    slot.setPosition(TreasureConst.TREASURE_JADE_SLOT_POS[config.color][Number(i) + 1]);
                    imageSlot.addChild(slot);
                }
            }
        }
    }

}