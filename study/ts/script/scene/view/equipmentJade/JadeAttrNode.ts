import EquipDetailDynamicModule from "../equipment/EquipDetailDynamicModule";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import EquipConst from "../../../const/EquipConst";
import { Colors } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JadeAttrNode extends EquipDetailDynamicModule {
    _rangeType: any;
    _contentHeight: number;
    _jadeConfig: any;
    _labelDes: cc.Label;

    onLoad() {
        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_jade'));

        var color = Colors.BRIGHT_BG_ONE;
        var labelDes = UIHelper.createWithTTF("", Path.getCommonFont(), 20);
        labelDes.node.setAnchorPoint(cc.v2(0, 1));
        labelDes.lineHeight = 26;
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.enableWrapText = true;
        labelDes.node.width = (370);
        labelDes.node.color = color;
        this._labelDes = labelDes;
        this._listView.addChild(this._labelDes.node);
    }

    setJadeData(jadeConfig, rangeType?) {
        this._jadeConfig = jadeConfig;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;
        this.updateView();
    }
    updateView() {
        this._contentHeight = 0;
        this._createTitle();
        this._addAttrDes();
        this._listView.height = this._contentHeight;
    }
    _createTitle() {
        var title = this._commonDetailTitleWithBg;
        this._contentHeight += 50;
        title.node.setPosition(201, -(this._contentHeight - 30));
    }
    _addAttrDes() {
        this._labelDes.string = this._jadeConfig.description;
        this._labelDes['_updateRenderData'](true);
        var height = this._labelDes.node.height;
        this._contentHeight += height + 10;
        this._labelDes.node.setPosition(cc.v2(24, -(this._contentHeight - height - 15)));
    }
}
