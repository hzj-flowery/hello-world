const {ccclass, property} = cc._decorator;
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import { Colors, G_UserData } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

@ccclass
export default class HorseDetailBriefNode extends CommonDetailDynamicModule {
    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    @property(cc.Prefab)
    detailTitleWithBg:cc.Prefab = null;

    private _data:any;

    ctor(data) {
        this._data = data;
        this.onInit();
    }
    onInit() {
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
        return UIHelper.createDetailTitleWithBg('horse_detail_title_brief', this.detailTitleWithBg);
    }
    _createDes() {
        var briefDes = this._data.getConfig().description;
        var color = Colors.BRIGHT_BG_TWO;
        return UIHelper.createDetailDes(this._textDesNode, briefDes, color);
    }
}
