import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryWeaponDetailSkillNode extends CommonDetailDynamicModule {

    @property(cc.Prefab)
    detailTitleWithBg: cc.Prefab = null;
    private _weaponData: any;


    ctor(weaponData) {
        this._weaponData = weaponData;
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        var des = this._createDes();
        this._listView.pushBackCustomItem(des);
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('historyhero_weapon_detail_title_skill'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addChild(title.node);
        return widget;
    }
    _createDes() {
        var briefDes = this._weaponData.getConfig().long_description;
        var color = Colors.BRIGHT_BG_TWO;
        var widget = new cc.Node();
        var labelDes = UIHelper.createWithTTF(briefDes, Path.getCommonFont(), 20);
        labelDes.node.setAnchorPoint(cc.v2(0, 1));
        labelDes.lineHeight = (26);
        labelDes.node.width = (354);
        labelDes.node.color = (color);
        UIHelper.updateLabelSize(labelDes);
        var height = labelDes.node.getContentSize().height;
        labelDes.node.setPosition(cc.v2(24, height + 15));
        widget.addChild(labelDes.node);
        var size = cc.size(402, height + 20);
        widget.setContentSize(size);
        return widget;
    }
}