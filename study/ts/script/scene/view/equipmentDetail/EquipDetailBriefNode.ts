import EquipDetailDynamicModule from "../equipment/EquipDetailDynamicModule";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailBriefNode extends EquipDetailDynamicModule {
    _equipData: any;
    _contentHeight: number;

    _labelDes: cc.Label;


    onLoad() {

        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_brief'));

        var color = Colors.BRIGHT_BG_TWO;
        var labelDes = UIHelper.createWithTTF("", Path.getCommonFont(), 20);
        labelDes.node.setAnchorPoint(cc.v2(0, 1));
        labelDes.lineHeight = 26;
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.enableWrapText = true;
        labelDes.node.width = (354);
        labelDes.node.color = (color);
        this._labelDes = labelDes;
        this._listView.addChild(this._labelDes.node);
    }


    setEquipData(equipData) {
        this._equipData = equipData;
        this.updateView();
    }
    updateView() {
        this._contentHeight = 0;
        this._createTitle();
        this._createDes();
        this._listView.height = this._contentHeight;
        this.node.setContentSize(this._listView.width, this._listView.height);
    }
    _createTitle() {
        var title = this._commonDetailTitleWithBg;
        this._contentHeight += 50;
        title.node.setPosition(201, -(this._contentHeight - 30));
    }
    _createDes() {
        var briefDes = this._equipData.getConfig().description;
        this._labelDes.string = briefDes;
        this._labelDes['_updateRenderData'](true);
        var height = this._labelDes.node.height;
        this._contentHeight += height + 20;
        this._labelDes.node.setPosition(cc.v2(24, -(this._contentHeight - height - 15)));
    }
}