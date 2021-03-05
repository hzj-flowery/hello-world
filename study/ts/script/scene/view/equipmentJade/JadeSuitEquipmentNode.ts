import EquipDetailDynamicModule from "../equipment/EquipDetailDynamicModule";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import EquipConst from "../../../const/EquipConst";
import { stringUtil } from "../../../utils/StringUtil";
import { G_ConfigLoader, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ResourceLoader from "../../../utils/resource/ResourceLoader";
import CommonEquipIcon from "../../../ui/component/CommonEquipIcon";
import { ComponentIconHelper } from "../../../ui/component/ComponentIconHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JadeSuitEquipmentNode extends EquipDetailDynamicModule {
    _rangeType: any;

    _contentHeight: number;
    _jadeConfig: any;

    onLoad() {
        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_jade'));
    }

    setJadeData(jadeConfig, rangeType?) {
        this._jadeConfig = jadeConfig;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;
        this.updateView();
    }
    updateView() {
  //      this._listView.removeAllChildren();
        this._contentHeight = 0;
        this._createTitle();
        this._addSuitEquipments();
        this._addSuitTreasure();
        this._listView.height = this._contentHeight;
    }
    _createTitle() {
        var title = this._commonDetailTitleWithBg;
        this._contentHeight += 50;
        title.node.setPosition(201, -(this._contentHeight - 30));
       // this._listView.addChild(title.node);
    }
    _addSuitEquipments() {
        var equipmentInfos = stringUtil.split(this._jadeConfig.equipment, '|');
        for (var k in equipmentInfos) {
            var i = parseFloat(k);
            let value = equipmentInfos[k];
            var equipmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(parseFloat(value));
            if (equipmentConfig) {
                let widget = new cc.Node();
                var imageParam = {
                    texture: Path.getTeamUI('img_teamtrain_bg_icon01'),
                    adaptWithSize: true
                };
                var imageBg = UIHelper.createImage(imageParam);
                var size = imageBg.getContentSize();
                imageBg.setPosition(size.width * 0.5, size.height * 0.5 + 9);
                widget.addChild(imageBg);
                var node = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_EQUIPMENT, parseFloat(value))
                node.setPosition(65, 60);
                widget.addChild(node);

                var params: any = {};
                params.text = equipmentConfig.name;
                params.color = Colors.getColor(equipmentConfig.color);
                if (equipmentConfig.color == 7) {
                    params.outlineColor = Colors.getColorOutline(equipmentConfig.color);
                    params.outlineSize = 2;
                }
                var name = UIHelper.createLabel(params);
                name.setAnchorPoint(cc.v2(0, 0.5));
                name.setPosition(135, 90);
                var richText = Lang.get('lang_equipment_des', { value: equipmentConfig.description });
                var des = RichTextExtend.createWithContent(richText);
                des.maxWidth = 270;
                des.node.setAnchorPoint(cc.v2(0, 1));
                des.node.setPosition(120, 75);

                widget.addChild(name);
                widget.addChild(des.node);
                widget.setContentSize(cc.size(402, 110));
                this._contentHeight += 110;
                widget.y = -this._contentHeight;
                this._listView.addChild(widget);
            }
        }
    }

    _addSuitTreasure() {
        var treasureInfos = stringUtil.split(this._jadeConfig.treasure, '|');
        for (var k in treasureInfos) {
            var value = treasureInfos[k];
            var treasureConfig = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(parseInt(value));
            if (treasureConfig) {
                var widget = new cc.Node();
                var imageParam = {
                    texture: Path.getTeamUI('img_teamtrain_bg_icon01'),
                    adaptWithSize: true
                };
                var imageBg = UIHelper.createImage(imageParam);
                var size = imageBg.getContentSize();
                imageBg.setPosition(size.width * 0.5, size.height * 0.5 + 9);
                widget.addChild(imageBg);
                var node = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_TREASURE, parseFloat(value))
                node.setPosition(65, 60);
                var params:any = {};
                params.text = treasureConfig.name;
                params.color = Colors.getColor(treasureConfig.color);
                if (treasureConfig.color == 7) {
                    params.outlineColor = Colors.getColorOutline(treasureConfig.color);
                    params.outlineSize = 2;
                }
                var name = UIHelper.createLabel(params);
                name.setAnchorPoint(cc.v2(0, 0.5));
                name.setPosition(135, 90);
                var richText = Lang.get('lang_equipment_des', { value: treasureConfig.description });
                var des = RichTextExtend.createWithContent(richText);
                des.maxWidth = 270;
                des.node.setAnchorPoint(cc.v2(0, 1));
                des.node.setPosition(120, 75);

                widget.addChild(node);
                widget.addChild(name);
                widget.addChild(des.node);
                widget.setContentSize(cc.size(402, 110));
                this._contentHeight += 110;
                widget.y = -this._contentHeight;
                this._listView.addChild(widget);
            }
        }
    }
}
