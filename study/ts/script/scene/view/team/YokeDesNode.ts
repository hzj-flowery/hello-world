import { Lang } from "../../../lang/Lang";
import { G_ConfigLoader, G_UserData, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import UIHelper from "../../../utils/UIHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";


var TEMP_DIS = 5;

const {ccclass, property} = cc._decorator;

@ccclass
export default class YokeDesNode extends cc.Node {

    private _content: Array<any>;
    updateView(info, width, dis?) {
        var node = new cc.Node();
        var richText = node.addComponent(cc.RichText) as cc.RichText;
        this._content = [];
        var fateType = info.fateType;
        if(this['_createTemplate' + fateType])
        this['_createTemplate' + fateType](info);
        var dis = dis || TEMP_DIS;
        if (this._content.length > 0) {
            this.updateRichText(richText, this._content)
            richText.node.setAnchorPoint(new cc.Vec2(0, 1));
            richText.node.setPosition(new cc.Vec2(0, 0));
            //richText.ignoreContentAdaptWithSize(false);
            //richText.node.setContentSize(cc.size(width, 0));
            richText.maxWidth = width;
            // richText.formatText();
            this.addChild(richText.node);
            var size = richText.node.getContentSize();
            this.setContentSize(cc.size(size.width, size.height + dis * 2));
        }
    }

    private updateRichText(richText: cc.RichText, data): void {
        RichTextExtend.setRichText(richText, data);
    }
    private _createUnit(text, isActivated) {
        var unit: any = {};
        unit.type = 'text';
        unit.color = isActivated && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        unit.msg = text;
        unit.fontSize = 20;
        this._content.push(unit);
        return unit;
    }
    private _createTemplate1(info) {
        var heroIds = info.heroIds;
        var isActivated = info.isShowColor;
        for (var i = 0; i < heroIds.length; i++) {
            var heroId = heroIds[i];
            var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
          //assert((config, cc.js.formatStr('hero config can not find id = %d', heroId));
            var text = config.type == 1 && G_UserData.getBase().getName() || config.name;
            if (i != heroIds.length - 1) {
                text = text + '\u3001';
            }
            var isIn = G_UserData.getTeam().isInBattleWithBaseId(heroId) || G_UserData.getTeam().isInReinforcementsWithBaseId(heroId);
            this._createUnit(text, isActivated && isIn);
            isActivated = isActivated && isIn;
        }
        this._createUnit(Lang.get('hero_yoke_des_middle'), isActivated);
        var attrInfo = info.attrInfo||[];
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _createTemplate2(info) {
        var equipIds = info.heroIds;
        var isActivated = true;
        this._createUnit(Lang.get('hero_yoke_des_pre'), info.isActivated);
        for (var i = 0; i < equipIds.length; i++) {
            var equipId = equipIds[i];
            var text = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(equipId).name;
            if (i != equipIds.length - 1) {
                text = text + '\u3001';
            }
            var isHave = G_UserData.getBattleResource().isInFirstPosWithEquipBaseId(equipId);
            this._createUnit(text, isHave);
            isActivated = isActivated && isHave;
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo||[];
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _createTemplate3(info) {
        var treasureIds = info.heroIds;
        var isActivated = info.isActivated;
        this._createUnit(Lang.get('hero_yoke_des_pre'), isActivated);
        for (var i = 0; i < treasureIds.length; i++) {
            var treasureId = treasureIds[i];
            var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(treasureId);
          //assert((configInfo, cc.js.formatStr('treasure config can not find id = %d', treasureId));
            var text = configInfo.name;
            if (i != treasureIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo||[];
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _createTemplate4(info) {
        var instrumentIds = info.heroIds;
        var isActivated = info.isActivated;
        this._createUnit(Lang.get('hero_yoke_des_pre'), isActivated);
        for (var i = 0; i < instrumentIds.length; i++) {
            var instrumentId = instrumentIds[i];
            var infoC = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentId);
          //assert((infoC, cc.js.formatStr('instrument config can not find id = %d', instrumentId));
            var text = infoC.name;
            if (i != instrumentIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo||[];
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    onlyShow(info, width) {
        var node = new cc.Node();
        var richText = node.addComponent(cc.RichText) as cc.RichText;
        this._content = [];
        var fateType = info.fateType;
        var func = this['_onlyShowTemplate' + fateType];
        if (func) {
            func(this, info);
        }
        if (this._content.length > 0) {
            this.updateRichText(richText, this._content)
            richText.node.setAnchorPoint(new cc.Vec2(0, 0));
            richText.node.setPosition(new cc.Vec2(0, 0));
            //richText.ignoreContentAdaptWithSize(false);
            richText.node.setContentSize(cc.size(width, 0));
            //richText.formatText();
            this.addChild(richText.node);
            var size = richText.node.getContentSize();
            this.setContentSize(size);
        }
    }
    private _onlyShowTemplate1(info) {
        var heroIds = info.heroIds;
        var isActivated = info.isActivated;
        for (var i = 0; i < heroIds.length; i++) {
            var heroId = heroIds[i];
            var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
          //assert((config, cc.js.formatStr('hero config can not find id = %d', heroId));
            var text = config.type == 1 && G_UserData.getBase().getName() || config.name;
            if (i != heroIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_middle'), isActivated);
        var attrInfo = info.attrInfo;
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: (parseFloat(attr.attrValue) / 10)
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _onlyShowTemplate2(info) {
        var equipIds = info.heroIds;
        var isActivated = info.isActivated;
        this._createUnit(Lang.get('hero_yoke_des_pre'), isActivated);
        for (var i = 0; i < equipIds.length; i++) {
            var equipId = equipIds[i];
            var text = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(equipId).name;
            if (i != equipIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo;
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _onlyShowTemplate3(info) {
        var treasureIds = info.heroIds;
        var isActivated = info.isActivated;
        this._createUnit(Lang.get('hero_yoke_des_pre'), isActivated);
        for (var i = 0; i < treasureIds.length; i++) {
            var treasureId = treasureIds[i];
            var text = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(treasureId).name;
            if (i != treasureIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo;
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseInt(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
    private _onlyShowTemplate4(info) {
        var instrumentIds = info.heroIds;
        var isActivated = info.isActivated;
        this._createUnit(Lang.get('hero_yoke_des_pre'), isActivated);
        for (var i = 0; i < instrumentIds.length; i++) {
            var instrumentId = instrumentIds[i];
            var info = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentId);
          //assert((info, cc.js.formatStr('instrument config can not find id = %d', instrumentId));
            var text = info.name;
            if (i != instrumentIds.length - 1) {
                text = text + '\u3001';
            }
            this._createUnit(text, isActivated);
        }
        this._createUnit(Lang.get('hero_yoke_des_suf'), isActivated);
        var attrInfo = info.attrInfo;
        for (var i = 0; i < attrInfo.length; i++) {
            var attr = attrInfo[i];
            text = Lang.get('hero_detail_yoke_attr_value', {
                attr: G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(attr.attrId).cn_name,
                value: parseFloat(attr.attrValue) / 10
            });
            if (i != attrInfo.length - 1) {
                text = text + '\uFF0C';
            }
            this._createUnit(text, isActivated);
        }
    }
}