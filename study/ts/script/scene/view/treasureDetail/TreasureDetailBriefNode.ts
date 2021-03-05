import ListViewCellBase from "../../../ui/ListViewCellBase";
import { TreasureUnitData } from "../../../data/TreasureUnitData";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import { Lang } from "../../../lang/Lang";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";

const { ccclass, property } = cc._decorator;


@ccclass
export default class TreasureDetailBriefNode extends CommonDetailDynamicModule {
    @property({
        type: cc.Prefab,
        visible: true
    })    
    _CommonDetailTitleWithBg:cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode:cc.Node = null;

    private _treasureData:TreasureUnitData;

    init(instrumentData){
        this._treasureData = instrumentData;
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
        return UIHelper.createDetailTitleWithBg(Lang.get('treasure_detail_title_brief'), this._CommonDetailTitleWithBg);
    }

    _createDes() {
        var briefDes = this._treasureData.getConfig().description;
        return UIHelper.createDetailDesEx(this._textDesNode, briefDes);
    }
}
